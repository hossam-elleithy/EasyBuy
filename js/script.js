
const state = {
    products: [],
    filteredProducts: [],
    selectedCategory: 'all',
    searchQuery: '',
    categories: []
};

const productsContainer = document.getElementById('productsContainer');
const categoryFilters = document.getElementById('categoryFilters');
const searchInput = document.getElementById('searchInput');
const shopNowBtn = document.getElementById('shopNowBtn');


function init() {
    fetchProducts();
    setupEventListeners();
    updateCartCount(); 
    updateFavoritesCount(); 
}

async function fetchProducts() {
    try {
        showLoading();
        const response = await fetch('https://fakestoreapi.com/products');
        state.products = await response.json();
        state.filteredProducts = [...state.products];
        
        extractCategories();
        renderCategories();

        if (isFavoritesPage()) {
            renderFavoritesPage();
        } else {
            renderProducts();
        }

    } catch (error) {
        showError('Failed to load products. Please try again later.');
    }
}


function extractCategories() {
    const categorySet = new Set();
    state.products.forEach(product => categorySet.add(product.category));
    state.categories = ['all', ...Array.from(categorySet)];
}

function renderCategories() {
    if (!categoryFilters) return; 

    categoryFilters.innerHTML = '';
    
    state.categories.forEach(category => {
        const button = document.createElement('button');
        button.className = `category-btn ${category === state.selectedCategory ? 'active' : ''}`;
        button.textContent = category === 'all' ? 'All Products' : formatCategoryName(category);
        button.dataset.category = category;
        categoryFilters.appendChild(button);
    });
}

function formatCategoryName(category) {
    return category.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


function filterProducts() {
    state.filteredProducts = state.products.filter(product => {
        const categoryMatch = state.selectedCategory === 'all' || product.category === state.selectedCategory;
        const searchMatch = product.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(state.searchQuery.toLowerCase());
        return categoryMatch && searchMatch;
    });
    
    renderProducts();
}


function renderProducts() {
    if (!productsContainer) return;

    if (state.filteredProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-results">
                <h2>No products found</h2>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    productsContainer.innerHTML = `
        <div class="products-grid">
            ${state.filteredProducts.map(product => productCardHTML(product)).join('')}
        </div>
    `;

    attachProductEvents();
}

function productCardHTML(product) {
    return `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-category">${formatCategoryName(product.category)}</p>
                <p class="product-price">$${product.price}</p>

                <!-- ⭐ Rating -->
                <div class="product-rating">
                    ${renderStars(product.rating?.rate || 0)}
                    <span class="rating-value">(${product.rating?.count || 0})</span>
                </div>

                <div class="product-actions">
                    <button class="favorite-btn" data-id="${product.id}" title="Add to Favorites">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="cart-btn fancy-btn" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}


function renderStars(rate) {
    const fullStars = Math.floor(rate);
    const halfStar = rate % 1 >= 0.5;
    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star" style="color: gold;"></i>';
    }
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt" style="color: gold;"></i>';
    }
    for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) {
        starsHtml += '<i class="far fa-star" style="color: gold;"></i>';
    }

    return starsHtml;
}


function loadFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleFavorite(productId) {
    let favorites = loadFavorites();
    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
    } else {
        favorites.push(productId);
    }
    saveFavorites(favorites);
    updateFavoritesUI();
    updateFavoritesCount();

    if (isFavoritesPage()) {
        renderFavoritesPage();
    }
}

function updateFavoritesUI() {
    const favorites = loadFavorites();
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        const icon = btn.querySelector('i');
        if (favorites.includes(id)) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = "red";
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = "black";
            icon.style.border = "none"; 
            icon.style.padding = "0";  
        }
    });
}

function updateFavoritesCount() {
    const favorites = loadFavorites();
    const badge = document.querySelector('.favorites-count');
    if (badge) {
        if (favorites.length > 0) {
            badge.textContent = favorites.length;
            badge.style.display = "inline-block";
        } else {
            badge.textContent = "";
            badge.style.display = "none";
        }
    }
}


function isFavoritesPage() {
    return window.location.pathname.includes("favorites.html");
}

function renderFavoritesPage() {
    const favorites = loadFavorites();
    if (!productsContainer) return;

    const favoriteProducts = state.products.filter(p => favorites.includes(p.id));

    if (favoriteProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-results">
                <h2>No Favorites Yet</h2>
                <p>Go back and add some products to your favorites ❤️</p>
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = `
        <div class="products-grid">
            ${favoriteProducts.map(product => productCardHTML(product)).join('')}
        </div>
    `;

    attachProductEvents();
}


function loadCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    let cart = loadCart();
    const product = state.products.find(p => p.id === productId);

    if (!product) return; 

    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        location.reload();
    }
}


function updateCartCount() {
    const cart = loadCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-count');
    if (badge) {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = "inline-block";
        } else {
            badge.textContent = "";
            badge.style.display = "none";
        }
    }
}


function attachProductEvents() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleFavorite(parseInt(btn.dataset.id));
        });
    });

    document.querySelectorAll('.cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            addToCart(parseInt(btn.dataset.id));
        });
    });

    updateFavoritesUI();
}

function setupEventListeners() {
    if (categoryFilters) {
        categoryFilters.addEventListener('click', function(e) {
            if (e.target.classList.contains('category-btn')) {
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                state.selectedCategory = e.target.dataset.category;
                filterProducts();
            }
        });
    }
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.searchQuery = e.target.value;
                filterProducts();
            }, 300);
        });

        searchInput.addEventListener('focus', () => {
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('products').scrollIntoView({ behavior: "smooth" });
        });
    }
}


function showLoading() {
    productsContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        `;
}

function showError(message) {
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="error">
                <h2>Something went wrong</h2>
                <p>${message}</p>
                <button onclick="fetchProducts()">Try Again</button>
            </div>
        `;
    }
}


document.addEventListener('DOMContentLoaded', init);
