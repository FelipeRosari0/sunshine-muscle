// Loader overlay global
(function(){
  let overlay;
  function build(){
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'loader hidden';
    overlay.setAttribute('role','status');
    overlay.setAttribute('aria-live','polite');
    overlay.innerHTML = `
      <div class="loader__box">
        <div class="loader__spinner" aria-hidden="true"></div>
        <div class="loader__text">carregando…</div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }
  function show(){ build(); overlay.classList.remove('hidden'); }
  function hide(){ if (!overlay) return; overlay.classList.add('hidden'); }

  // Expor globalmente caso precise
  window.Loader = { show, hide };

  // Criar overlay ao carregar, e esconder logo após o conteúdo estar pronto
  document.addEventListener('DOMContentLoaded', () => {
    build();
    setTimeout(hide, 200); // breve flash ao entrar na página
  });

  // Mostrar loader em navegação por links internos
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    // Ignore anchors e externos
    if (!href || href.startsWith('#')) return;
    const isExternal = /^https?:\/\//i.test(href) && !href.includes(location.host);
    if (a.getAttribute('target') === '_blank' || isExternal) return;
    // Apenas páginas locais html
    const isHtml = /\.html(\?|#|$)/i.test(href) || (!/^https?:/i.test(href) && !href.startsWith('mailto:'));
    if (!isHtml) return;
    show();
  });

  // Mostrar loader em submissão de formulários
  document.addEventListener('submit', () => { show(); }, true);

  // Segurança extra para outras navegações (location.assign, back/forward)
  window.addEventListener('beforeunload', () => { show(); });
})();