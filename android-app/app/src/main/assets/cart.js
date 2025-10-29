// Utilidades de carrinho (storage + badge)
const CART_KEY = 'sunshine_cart_v1';

function slugify(text){
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}
function addToCart({name, price, slug}, qty=1){
  const items = getCart();
  const existing = items.find(i => i.slug === slug);
  const unit = parseFloat(String(price).replace(/[^0-9,\.]/g,'').replace('.', '').replace(',', '.')) || 0;
  if (existing){ existing.qty += qty; }
  else { items.push({ name, slug, price: unit, qty }); }
  saveCart(items);
}
function cartCount(){ return getCart().reduce((acc,i)=>acc+i.qty,0); }
function updateCartBadge(){
  const el = document.getElementById('cart-count');
  if (el) el.textContent = String(cartCount());
}

// Inicializar badge ao carregar
document.addEventListener('DOMContentLoaded', updateCartBadge);

// Integração com botões "comprar" da home
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-buy');
  if (!btn) return;
  const name = btn.dataset.item || 'Produto';
  const slug = btn.dataset.slug || slugify(name);
  const price = btn.dataset.price || 'R$0,00';
  addToCart({ name, slug, price }, 1);
});