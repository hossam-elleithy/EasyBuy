// Utility: get favorites from localStorage
function getFavoritesFromStorage() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

// Utility: save favorites back to localStorage
function saveFavoritesToStorage(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Render favorites page
function renderFavoritesPage() {
  const favoritesContainer = document.getElementById("favorites-container"); // add this div in HTML
  favoritesContainer.innerHTML = "";

  const favorites = getFavoritesFromStorage();

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = `
      <p class="empty-message">No favorites yet ❤️</p>
    `;
    return;
  }

  favorites.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}" />
      <h3>${product.title}</h3>
      <p class="price">$${product.price}</p>
      <button class="remove-fav-btn" data-id="${product.id}">
        Remove from Favorites
      </button>
    `;
    favoritesContainer.appendChild(card);
  });

  // Attach remove buttons
  document.querySelectorAll(".remove-fav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      removeFromFavorites(id);
      renderFavoritesPage(); // re-render after removal
    });
  });
}

// Remove product from favorites
function removeFromFavorites(id) {
  let favorites = getFavoritesFromStorage();
  favorites = favorites.filter(item => item.id !== id);
  saveFavoritesToStorage(favorites);
}
