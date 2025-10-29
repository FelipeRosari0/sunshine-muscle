// Autenticação e pedidos
const USER_KEY = 'sunshine_user_v1';
const ORDERS_KEY = 'sunshine_orders_v1';

function getUser(){
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
}
function setUser(user){ localStorage.setItem(USER_KEY, JSON.stringify(user)); }
function logout(){ localStorage.removeItem(USER_KEY); }
function currentUserId(){ const u = getUser(); return u?.email || 'guest'; }

function getAllOrders(){
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || {}; } catch { return {}; }
}
function saveAllOrders(map){ localStorage.setItem(ORDERS_KEY, JSON.stringify(map)); }
function getOrdersByUser(uid=currentUserId()){
  const map = getAllOrders();
  return map[uid] || [];
}
function addOrder(order, uid=currentUserId()){
  const map = getAllOrders();
  if (!map[uid]) map[uid] = [];
  map[uid].push(order);
  saveAllOrders(map);
}

window.Auth = { getUser, setUser, logout, currentUserId, getOrdersByUser, addOrder };
window.Auth.isLoggedIn = function(){ return !!getUser(); };