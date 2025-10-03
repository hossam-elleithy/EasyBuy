
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch (e) {
    return [];
  }
}

function renderCheckoutSummary() {
  const cart = getCart();
  const summaryList = document.getElementById('summaryList');
  const totalEl = document.getElementById('checkoutTotal');
  if (!summaryList || !totalEl) return;

  summaryList.innerHTML = '';
  if (cart.length === 0) {
    summaryList.innerHTML = '<p>Your cart is empty.</p>';
    totalEl.textContent = '0.00';
    return;
  }

  let total = 0;
  cart.forEach(item => {
    const subtotal = (item.price || 0) * (item.quantity || 1);
    total += subtotal;

    const row = document.createElement('div');
    row.className = 'checkout-row';
    row.innerHTML = `
      <div class="row-left">
        <img src="${item.image || ''}" alt="${item.name || ''}" class="cart-item-img" />
        <div class="item-meta">
          <strong>${item.name || 'Product'}</strong>
          <div>Qty: ${item.quantity}</div>
        </div>
      </div>
      <div class="row-right">$${subtotal.toFixed(2)}</div>
    `;
    summaryList.appendChild(row);
  });

  totalEl.textContent = total.toFixed(2);
}

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function showError(inputId, message) {
  const el = document.getElementById(inputId + 'Error');
  if (el) el.textContent = message || '';
}

function clearErrors() {
  ['name', 'email', 'address'].forEach(id => showError(id, ''));
}

function setControlsDisabled(form, disabled) {
  form.querySelectorAll('input, textarea, button').forEach(el => el.disabled = disabled);
}

function completeOrder(name, total, modal) {
  const message = document.getElementById('successMessage');
  if (message) message.textContent = `Thanks ${name}! Your order of $${total.toFixed(2)} has been placed.`;

  // clear cart and update header badge
  localStorage.removeItem('cart');
  if (typeof updateCartCount === 'function') updateCartCount();

  // enable modal actions
  const closeBtn = document.getElementById('closeModalBtn');
  const continueBtn = document.getElementById('continueBtn');
  if (closeBtn) {
    closeBtn.disabled = false;
    closeBtn.onclick = () => { if (modal) modal.style.display = 'none'; window.location.href = 'index.html'; };
  }
  if (continueBtn) {
    continueBtn.disabled = false;
    continueBtn.onclick = () => window.location.href = 'index.html';
  }

  // auto redirect after a short delay
  setTimeout(() => {
    if (modal) modal.style.display = 'none';
    window.location.href = 'index.html';
  }, 4500);
}

function initCheckout() {
  const form = document.getElementById('checkoutForm');
  const placeBtn = document.getElementById('placeOrderBtn');
  const modal = document.getElementById('successModal');
  if (!form || !placeBtn || !modal) return;

  let submitting = false;
  function calculateTotal(cart) {
    return cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  }

  function disableForm(form) { setControlsDisabled(form, true); }
  function enableForm(form) { setControlsDisabled(form, false); }

  function showProcessingModal(modal, text) {
    const message = document.getElementById('successMessage');
    if (message) message.textContent = text || 'Processing...';
    modal.style.display = 'flex';
  }

  function hideModal(modal) {
    if (modal) modal.style.display = 'none';
  }

  function handlePlaceOrder(e) {
    e.preventDefault();
    try { console.debug('handlePlaceOrder triggered'); } catch (err) {}
    if (submitting) return;

    clearErrors();
    const name = (document.getElementById('name') || {}).value.trim() || '';
    const email = (document.getElementById('email') || {}).value.trim() || '';
    const address = (document.getElementById('address') || {}).value.trim() || '';

    let valid = true;
    if (name.length < 2) { showError('name', 'Please enter your full name'); valid = false; }
    if (!validateEmail(email)) { showError('email', 'Please enter a valid email'); valid = false; }
    if (address.length < 6) { showError('address', 'Please enter a valid address'); valid = false; }
    if (!valid) return;

    submitting = true;
    placeBtn.disabled = true;
    placeBtn.textContent = 'Placing...';
    disableForm(form);

    showProcessingModal(modal, 'Placing your order...');
    const cart = getCart();
    const total = calculateTotal(cart);

    setTimeout(() => {
      completeOrder(name, total, modal);
      submitting = false;
      placeBtn.textContent = 'Place Order';
      enableForm(form);
    }, 1000);
  }

  function attachCheckoutListeners() {
    form.addEventListener('submit', handlePlaceOrder);
  }

  attachCheckoutListeners();
}

document.addEventListener('DOMContentLoaded', function () {
  renderCheckoutSummary();
  initCheckout();
});

