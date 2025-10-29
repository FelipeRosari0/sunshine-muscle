// Atualiza o botão de perfil na home conforme estado do usuário
(function(){
  function updateProfileBtn(){
    const btn = document.querySelector('.profile-btn');
    if (!btn) return;
    const isLogged = !!(window.Auth && typeof window.Auth.isLoggedIn === 'function' && window.Auth.isLoggedIn());
    if (isLogged){
      const user = window.Auth.getUser() || {};
      const initial = String(user.name || '?').slice(0,1).toUpperCase();
      btn.innerHTML = `<span style="font-weight:800;">${initial}</span>`;
      btn.setAttribute('title', user.name || 'Perfil');
      btn.href = 'profile.html';
    } else {
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.31 0-10 1.66-10 5v3h20v-3c0-3.34-6.69-5-10-5z"/>
        </svg>`;
      btn.removeAttribute('title');
      btn.href = 'login.html';
    }
  }
  document.addEventListener('DOMContentLoaded', updateProfileBtn);
})();