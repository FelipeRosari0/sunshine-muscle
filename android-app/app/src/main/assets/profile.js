// Exibir dados do usuário e pedidos
function formatBR(v){
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function render(){
  const user = window.Auth.getUser();
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const loginLink = document.getElementById('login-link');
  const logoutBtn = document.getElementById('logout-btn');

  if (user){
    nameEl.textContent = user.name;
    emailEl.textContent = user.email;
    loginLink.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    nameEl.textContent = 'Perfil';
    emailEl.textContent = 'Entre para ver seus pedidos';
  }

  const ordersEl = document.getElementById('orders');
  const orders = window.Auth.getOrdersByUser(window.Auth.currentUserId());
  if (!orders.length){
    ordersEl.innerHTML = '<p class="muted">Nenhum pedido encontrado.</p>';
    return;
  }
  ordersEl.innerHTML = orders.map(ord => {
    const total = formatBR(ord.total || 0);
    const date = new Date(ord.date).toLocaleString('pt-BR');
    const itemsHtml = ord.items.map(it => `<div class="order__item"><span>${it.name} x${it.qty}</span><span class="order__item-price">${formatBR(it.price * it.qty)}</span></div>`).join('');
    return `
      <div class="order">
        <div class="order__meta">
          <span class="order__id">${ord.id}</span>
          <span class="order__date">${date} <span class="order__method">${ord.method.toUpperCase()}</span></span>
          <span class="order__total">${total}</span>
        </div>
        <div class="order__items">${itemsHtml}</div>
      </div>`;
  }).join('');
}

document.getElementById('logout-btn').addEventListener('click', () => {
  window.Auth.logout();
  render();
});

document.addEventListener('DOMContentLoaded', render);