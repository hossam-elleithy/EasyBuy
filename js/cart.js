// Load Cart from LocalStorage and fetch product details from API
async function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cartContainer");
  const cartTotalElement = document.getElementById("cartTotal");

  cartContainer.innerHTML = "<div class='loading'><div class='loading-spinner'></div><p>Loading cart...</p></div>";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartTotalElement.textContent = "0.00";
    updateCartCount();
    return;
  }

  // Fetch all products from API
  let products = [];
  let apiFailed = false;
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    products = await response.json();
  } catch (e) {
    apiFailed = true;
    products = [];
    console.warn('Products API fetch failed, falling back to stored cart data.', e);
  }

  // Merge cart items with product details
  let total = 0;
  cartContainer.innerHTML = "";
  cart.forEach((item, index) => {
  const product = products.find(p => p.id === item.id);
  const name = (product && product.title) ? product.title : (item.name || "Product");
  const price = (product && typeof product.price === 'number') ? product.price : (item.price || 0);
  const image = (product && product.image) ? product.image : (item.image || "");
    const quantity = item.quantity || 1;
    const subtotal = price * quantity;
    total += subtotal;

    const productDiv = document.createElement("div");
    productDiv.classList.add("cart-item");
    productDiv.innerHTML = `
      <img src="${image}" alt="${name}" class="cart-item-img">
      <div class="cart-item-info">
        <h4>${name}</h4>
        <p>Price: $${price.toFixed(2)}</p>
        <div class="quantity-control">
          <button class="decrease" data-index="${index}">-</button>
          <input type="number" min="1" value="${quantity}" data-index="${index}">
          <button class="increase" data-index="${index}">+</button>
        </div>
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <button class="remove-btn" data-index="${index}">Remove</button>
      </div>
    `;
    cartContainer.appendChild(productDiv);
  });

  cartTotalElement.textContent = total.toFixed(2);
  updateCartCount();
  addCartEvents();
}

// Add Events for buttons
function addCartEvents() {
  document.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", async function () {
      const idx = parseInt(this.dataset.index, 10);
      await updateQuantity(idx, 1);
    });
  });

  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", async function () {
      const idx = parseInt(this.dataset.index, 10);
      await updateQuantity(idx, -1);
    });
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", async function () {
      const idx = parseInt(this.dataset.index, 10);
      await removeItem(idx);
    });
  });

  document.querySelectorAll("input[type='number']").forEach(input => {
    input.addEventListener("change", async function () {
      const idx = parseInt(this.dataset.index, 10);
      const val = parseInt(this.value, 10) || 1;
      this.value = Math.max(1, val);
      await setQuantity(idx, this.value);
    });
  });
}

// Update Quantity
async function updateQuantity(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!Number.isFinite(index) || index < 0 || index >= cart.length) return;
  cart[index].quantity = (cart[index].quantity || 1) + change;
  if (cart[index].quantity < 1) cart[index].quantity = 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  await loadCart();
  if (window.location.pathname.includes('cart.html')) {
    location.reload();
  }
}

// Set Quantity
async function setQuantity(index, value) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!Number.isFinite(index) || index < 0 || index >= cart.length) return;
  cart[index].quantity = Math.max(1, parseInt(value) || 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  await loadCart();
  if (window.location.pathname.includes('cart.html')) {
    location.reload();
  }
}

// Remove Item
async function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!Number.isFinite(index) || index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  await loadCart();
  if (window.location.pathname.includes('cart.html')) {
    location.reload();
  }
}

// Update Cart Count Badge
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const countElement = document.querySelector(".cart-count");
  if (countElement) {
    countElement.textContent = totalItems > 0 ? totalItems : "";
  }
}

// Load cart on page load
document.addEventListener("DOMContentLoaded", loadCart);
