// Processar login e redirecionar para perfil
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const nome = form.nome.value.trim();
  const email = form.email.value.trim().toLowerCase();
  if (!nome || !email) return;
  window.Auth.setUser({ name: nome, email });
  location.href = 'profile.html';
});