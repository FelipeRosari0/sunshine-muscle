// Renderização e interação da página de carrinho
function formatBR(v){
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderCart(){
  const items = getCart();
  const container = document.getElementById('cart-items');
  if (!container) return;
  if (items.length === 0){
    container.innerHTML = '<p class="muted">Seu carrinho está vazio.</p>';
  } else {
    container.innerHTML = items.map(i => `
      <div class="cart-item" data-slug="${i.slug}">
        <div class="cart-item__img"><img src="assets/placeholder.svg" alt="${i.name}" /></div>
        <div class="cart-item__info">
          <h3>${i.name}</h3>
          <p class="muted">${formatBR(i.price)} un.</p>
          <div class="qty">
            <button class="qty-dec">-</button>
            <input type="number" min="1" value="${i.qty}" />
            <button class="qty-inc">+</button>
            <button class="cart-item__remove">remover</button>
          </div>
        </div>
        <div class="cart-item__price">${formatBR(i.price * i.qty)}</div>
      </div>
    `).join('');
  }
  updateTotals();
}

function updateTotals(){
  const items = getCart();
  const subtotal = items.reduce((acc,i)=> acc + i.price * i.qty, 0);
  const discount = calcDiscount(subtotal);
  const shipping = calcShipping(subtotal - discount);
  document.getElementById('subtotal').textContent = formatBR(subtotal);
  document.getElementById('discount').textContent = formatBR(discount);
  document.getElementById('shipping').textContent = formatBR(shipping);
  document.getElementById('total').textContent = formatBR(Math.max(0, subtotal - discount + shipping));
}

document.addEventListener('click', (e) => {
  const itemEl = e.target.closest('.cart-item');
  if (!itemEl) return;
  const slug = itemEl.dataset.slug;
  const items = getCart();
  const idx = items.findIndex(i => i.slug === slug);
  if (idx < 0) return;
  if (e.target.classList.contains('qty-inc')){
    items[idx].qty += 1;
    saveCart(items);
    renderCart();
  } else if (e.target.classList.contains('qty-dec')){
    items[idx].qty = Math.max(1, items[idx].qty - 1);
    saveCart(items);
    renderCart();
  } else if (e.target.classList.contains('cart-item__remove')){
    items.splice(idx,1);
    saveCart(items);
    renderCart();
  }
});

document.addEventListener('input', (e) => {
  if (e.target.matches('.cart-item input[type="number"]')){
    const itemEl = e.target.closest('.cart-item');
    const slug = itemEl.dataset.slug;
    const items = getCart();
    const idx = items.findIndex(i => i.slug === slug);
    const val = Math.max(1, parseInt(e.target.value || '1', 10));
    items[idx].qty = val;
    saveCart(items);
    renderCart();
  }
});

document.addEventListener('DOMContentLoaded', renderCart);

// Cupom e frete
const COUPON_KEY = 'sunshine_coupon_v1';
let appliedCoupon = '';
function calcDiscount(subtotal){
  if (appliedCoupon === 'SUNSHINE10') return subtotal * 0.10;
  return 0;
}
function calcShipping(net){
  if (appliedCoupon === 'FRETEGRATIS') return 0;
  return net >= 200 ? 0 : (net > 0 ? 20 : 0);
}

// Aplicar cupom / Limpar carrinho
document.addEventListener('click', (e) => {
  if (e.target.id === 'applyCoupon'){
    const input = document.getElementById('coupon');
    const code = input.value.trim().toUpperCase();
    const msgEl = document.getElementById('couponMsg');
    if (['SUNSHINE10','FRETEGRATIS'].includes(code)){
      appliedCoupon = code;
      localStorage.setItem(COUPON_KEY, appliedCoupon);
      msgEl.textContent = code === 'SUNSHINE10' ? 'Cupom aplicado: 10% de desconto.' : 'Frete grátis aplicado.';
    } else {
      appliedCoupon = '';
      localStorage.removeItem(COUPON_KEY);
      msgEl.textContent = 'Cupom inválido.';
    }
    updateTotals();
  } else if (e.target.id === 'clearCart'){
    saveCart([]);
    renderCart();
  }
});

// Restaurar cupom ao carregar
document.addEventListener('DOMContentLoaded', () => {
  const saved = (localStorage.getItem(COUPON_KEY) || '').toUpperCase();
  if (saved){
    appliedCoupon = saved;
    const input = document.getElementById('coupon');
    const msgEl = document.getElementById('couponMsg');
    if (input) input.value = saved;
    if (msgEl) msgEl.textContent = saved === 'SUNSHINE10' ? 'Cupom aplicado: 10% de desconto.' : 'Frete grátis aplicado.';
    updateTotals();
  }
});
// Bloqueio global de compras nesta página também
window.PURCHASES_DISABLED = true;
// Impedir navegação para checkout
document.addEventListener('click', (e) => {
  const link = e.target.closest('a.cta[href="checkout.html"]');
  if (!link) return;
  if (window.PURCHASES_DISABLED) {
    e.preventDefault();
    alert('Compras temporariamente desativadas.');
  }
});