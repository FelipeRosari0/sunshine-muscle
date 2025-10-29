const toast = document.getElementById('toast');
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}
// Bloqueio global de compras
window.PURCHASES_DISABLED = true;

// Stepper state
let currentStep = 1;
updateTrack();

const form1 = document.getElementById('formStep1');
const form2 = document.getElementById('formStep2');
const section3 = document.getElementById('formStep3');

form1.addEventListener('submit', (e) => {
  e.preventDefault();
  currentStep = 2; updateTrack();
  form1.classList.add('hidden');
  form2.classList.remove('hidden');
});

document.getElementById('backTo1').addEventListener('click', () => {
  currentStep = 1; updateTrack();
  form2.classList.add('hidden');
  form1.classList.remove('hidden');
});

form2.addEventListener('submit', (e) => {
  e.preventDefault();
  currentStep = 3; updateTrack();
  form2.classList.add('hidden');
  section3.classList.remove('hidden');
});

// Tabs pagamento (Card/Pix)
const tabs = document.querySelectorAll('.paytab');
const payCard = document.getElementById('payCard');
const payPix = document.getElementById('payPix');

tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  const id = t.dataset.tab;
  payCard.classList.toggle('hidden', id !== 'card');
  payPix.classList.toggle('hidden', id !== 'pix');
}));

document.getElementById('backTo2').addEventListener('click', () => {
  currentStep = 2; updateTrack();
  section3.classList.add('hidden');
  form2.classList.remove('hidden');
});

// Confirmação
// Card finalize only when agreed
const finalizeBtn = document.getElementById('finalizeCard');
const agreeTerms = document.getElementById('agreeTerms');
agreeTerms.addEventListener('change', () => {
  finalizeBtn.disabled = !agreeTerms.checked || window.PURCHASES_DISABLED;
});
// Se compras desativadas, manter desabilitado
if (window.PURCHASES_DISABLED && finalizeBtn) finalizeBtn.disabled = true;
payCard.addEventListener('submit', (e) => {
  e.preventDefault();
  if (window.PURCHASES_DISABLED) {
    showToast('Compras temporariamente desativadas.');
    return;
  }
  if (!agreeTerms.checked) {
    showToast('Confirme o aceite dos termos para finalizar.');
    return;
  }
  createOrder('card');
  showToast('Pagamento com cartão confirmado!');
});

// Pix copy
const copyPix = document.getElementById('copyPix');
const pixCode = document.getElementById('pixCode');
const pixUpload = document.getElementById('pixUpload');
const pixQrImg = document.getElementById('pixQrImg');
const confirmPix = document.getElementById('confirmPix');
copyPix.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(pixCode.value);
    showToast('Código Pix copiado!');
  } catch (e) {
    showToast('Não foi possível copiar.');
  }
});
confirmPix?.addEventListener('click', () => {
  if (window.PURCHASES_DISABLED) {
    showToast('Compras temporariamente desativadas.');
    return;
  }
  createOrder('pix');
  showToast('Pagamento Pix confirmado!');
});

// Upload de imagem do QR
pixUpload.addEventListener('change', () => {
  const file = pixUpload.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  pixQrImg.src = url;
});

// Fallback: se a imagem padrão não existir, mostra placeholder
if (pixQrImg) {
  pixQrImg.addEventListener('error', () => {
    pixQrImg.src = 'assets/placeholder.svg';
  });
}

// Track bar update
function updateTrack() {
  const track = document.getElementById('stepsTrack');
  const segments = [33, 66, 100];
  const pos = segments[currentStep - 1];
  track.style.background = `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${pos}%, #fff ${pos}%, #fff 100%)`;
}

// Registrar pedido e limpar carrinho
let orderCreated = false;
function formatBR(v){
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Cupom e frete (alinhado com cart_page.js)
const COUPON_KEY = 'sunshine_coupon_v1';
function getAppliedCoupon(){
  return (localStorage.getItem(COUPON_KEY) || '').toUpperCase();
}
function calcDiscount(subtotal){
  const cupom = getAppliedCoupon();
  if (cupom === 'SUNSHINE10') return subtotal * 0.10;
  return 0;
}
function calcShipping(net){
  const cupom = getAppliedCoupon();
  if (cupom === 'FRETEGRATIS') return 0;
  return net >= 200 ? 0 : (net > 0 ? 20 : 0);
}

function createOrder(method){
  if (orderCreated) return;
  if (window.Auth && !window.Auth.isLoggedIn()){
    showToast('Faça login para finalizar o pedido.');
    setTimeout(()=>{ location.href = 'login.html'; }, 1200);
    return;
  }
  if (typeof getCart !== 'function') return;
  const items = getCart();
  if (!items.length) { showToast('Seu carrinho está vazio.'); return; }

  const subtotal = items.reduce((acc,i)=> acc + i.price * i.qty, 0);
  const discount = calcDiscount(subtotal);
  const shipping = calcShipping(subtotal - discount);
  const total = Math.max(0, subtotal - discount + shipping);
  const coupon = getAppliedCoupon();
  let installments = 1;
  if (method === 'card') {
    const sel = document.querySelector('#payCard select[name="parcelas"]');
    installments = parseInt(sel?.value || '1', 10) || 1;
  }

  const order = {
    id: 'ord-' + Date.now(),
    method,
    date: new Date().toISOString(),
    items,
    subtotal,
    discount,
    shipping,
    coupon,
    total,
    installments,
    status: 'em_andamento',
  };
  if (window.Auth) {
    window.Auth.addOrder(order);
  }
  // limpar carrinho
  saveCart([]);
  orderCreated = true;
}

// Exibir animação de sucesso
function showPaymentSuccess(order) {
  const overlay = document.getElementById('paySuccess');
  if (!overlay) return;
  const orderIdEl = document.getElementById('orderId');
  if (orderIdEl && order?.id) orderIdEl.textContent = String(order.id);

  // Confetes simples
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('span');
    el.className = 'confetti';
    el.style.left = Math.round(Math.random() * 100) + '%';
    el.style.background = ['#ffd000','#ff006e','#3bd56b','#00d4ff','#ffb703'][i % 5];
    el.style.animationDelay = (Math.random() * 500) + 'ms';
    overlay.appendChild(el);
  }

  overlay.hidden = false;
  overlay.classList.add('show');

  const btn = document.getElementById('goOrders');
  if (btn) {
    btn.onclick = () => {
      window.location.href = 'profile.html';
    };
  }
}

// Dentro de createOrder, após sucesso, chamar showPaymentSuccess
// Observação: este arquivo já cria pedido em confirmar Pix e em finalizar cartão.
// Vamos garantir que após definir orderCreated, chamamos a animação.

// Interceptar finalize action para cartão e Pix
(function hookSuccessOverlay(){
  const originalCreateOrder = typeof createOrder === 'function' ? createOrder : null;
  if (!originalCreateOrder) return;

  window.createOrder = async function(method) {
    const result = await originalCreateOrder(method);
    try {
      // Se o createOrder retornar informações do pedido, use; senão tente ler do storage
      const orderData = result && typeof result === 'object' ? result : null;
      showPaymentSuccess(orderData || {});
    } catch(err) {
      console.warn('Falha ao exibir overlay de sucesso:', err);
    }
    return result;
  };
})();