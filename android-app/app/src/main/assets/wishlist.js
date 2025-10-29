// Wishlist (Favoritos)
(function(){
  const WL_KEY = 'sunshine_wishlist_v1';
  function slugify(text){
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }
  function get(){
    try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch { return []; }
  }
  function save(list){ localStorage.setItem(WL_KEY, JSON.stringify(list)); }
  function has(slug){ return get().includes(slug); }
  function add(slug){ const list = get(); if (!list.includes(slug)){ list.push(slug); save(list); } return true; }
  function remove(slug){ const list = get().filter(s => s !== slug); save(list); return false; }
  function toggle(slug){ return has(slug) ? remove(slug) : add(slug); }

  function flattenCatalog(){
    const data = window.catalogData || {};
    const sections = Object.values(data);
    const all = [];
    for (const section of sections){
      const parts = Object.values(section);
      for (const list of parts){
        for (const item of list){ all.push(item); }
      }
    }
    const bySlug = {};
    for (const item of all){ bySlug[slugify(item.name)] = item; }
    return bySlug;
  }

  function renderFavoritesPage(){
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;
    const bySlug = flattenCatalog();
    const slugs = get();
    if (!slugs.length){ grid.innerHTML = '<p class="muted">Nenhum favorito ainda.</p>'; return; }
    grid.innerHTML = slugs.map(slug => {
      const item = bySlug[slug];
      if (!item) return '';
      const price = item.price;
      const href = `product.html?slug=${encodeURIComponent(slug)}`;
      const imgSrc = item.img || 'assets/placeholder.svg';
      return `
        <article class="card card--fav">
          <a class="card__media" href="${href}" aria-label="Ver ${item.name}">
            <img src="${imgSrc}" alt="${item.name}" onerror="this.src='assets/placeholder.svg'" />
            <span class="price-badge">${price}</span>
          </a>
          <div class="card__body">
            <h3><a href="${href}" style="color:inherit; text-decoration:none;">${item.name}</a></h3>
            <div class="card__actions">
              <button class="btn-buy" data-item="${item.name}" data-slug="${slug}" data-price="${price}">comprar</button>
              <button class="btn btn-outline btn-sm" data-remove-fav="${slug}" aria-label="Remover dos favoritos">remover</button>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove-fav]');
    if (!removeBtn) return;
    const slug = removeBtn.getAttribute('data-remove-fav');
    remove(slug);
    renderFavoritesPage();
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderFavoritesPage();
    // Sincronizar ícones ativos nos cards da home
    document.querySelectorAll('.btn-fav').forEach(btn => {
      const slug = btn.dataset.slug;
      btn.classList.toggle('active', has(slug));
    });
  });

  window.Wishlist = { get, save, has, add, remove, toggle };
})();

(function(){
  function slugify(name){
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }
  const catalog = window.catalogData;
  const flat = [];
  for (const section of Object.values(catalog)){
    for (const group of Object.values(section)){
      for (const item of group){
        flat.push({ ...item, slug: slugify(item.name) });
      }
    }
  }
  const bySlug = Object.fromEntries(flat.map(it => [it.slug, it]));

  const listEl = document.getElementById('wishlist');
  function render(){
    if (!listEl) return; // Sai se elemento não existir
    const slugs = (window.Wishlist && window.Wishlist.list) ? window.Wishlist.list() : [];
    if (!slugs.length){
      listEl.innerHTML = '<p class="muted">Nenhum favorito ainda.</p>';
      return;
    }
    const cards = slugs.map(slug => {
      const it = bySlug[slug];
      if (!it) return '';
      const imgSrc = it.img || 'assets/placeholder.svg';
      return `
        <article class="card">
          <a class="card__media" href="product.html?slug=${slug}">
            <img src="${imgSrc}" alt="${it.name}" onerror="this.src='assets/placeholder.svg'" />
            <span class="price-badge">${it.price}</span>
          </a>
          <div class="card__body">
            <h3><a href="product.html?slug=${slug}" style="color:inherit;text-decoration:none;">${it.name}</a></h3>
            <div class="card__actions">
              <button class="btn-buy" data-item="${it.name}">comprar</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
    listEl.innerHTML = cards;
  }
  document.addEventListener('DOMContentLoaded', render);
})();