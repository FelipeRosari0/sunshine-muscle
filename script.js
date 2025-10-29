// Pequena interação: mostrar um toast ao clicar em "Comprar"
const toast = document.getElementById('toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function bindBuyButtons(scope=document) {
  scope.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.getAttribute('data-item') || 'Produto';
      showToast(`${item} adicionado ao carrinho!`);
    });
  });
}
bindBuyButtons();

// ---- Busca: helpers ----
function debounce(fn, wait=250){
  let t; return function(...args){
    clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait);
  };
}
function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function highlight(text, q){
  if (!q) return text;
  const re = new RegExp(escapeRegExp(q), 'i');
  const m = text.match(re);
  if (!m) return text;
  const idx = m.index; const len = m[0].length;
  return text.slice(0, idx) + '<mark>' + text.slice(idx, idx+len) + '</mark>' + text.slice(idx+len);
}

// Abas do catálogo
const tabButtons = document.querySelectorAll('.catalog .tab');
const tabViews = document.querySelectorAll('.catalog .tabview');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const id = btn.dataset.tab;
    tabViews.forEach(v => v.classList.toggle('active', v.id === `view-${id}`));
    applyFilters();
  });
});

// Dados compartilhados
const data = window.catalogData;

function slugify(text){
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}
function parsePriceBR(priceStr){
  return parseFloat(String(priceStr).replace(/[^0-9,\.]/g,'').replace('.', '').replace(',', '.')) || 0;
}

function renderCard(item, q='') {
  const slug = slugify(item.name);
  const favActive = window.Wishlist && window.Wishlist.has(slug);
  const imgSrc = item.img || 'assets/placeholder.svg';
  const title = highlight(item.name, q);
  return `
    <article class="card">
      <button class="btn-fav ${favActive ? 'active' : ''}" aria-label="Favoritar" data-slug="${slug}">❤</button>
      <a class="card__media" href="product.html?slug=${encodeURIComponent(slug)}" aria-label="Ver ${item.name}">
        <img src="${imgSrc}" alt="${item.name}" onerror="this.src='assets/placeholder.svg'" />
        <span class="price-badge">${item.price}</span>
      </a>
      <div class="card__body">
        <h3><a href="product.html?slug=${encodeURIComponent(slug)}" style="color:inherit; text-decoration:none;">${title}</a></h3>
        <div class="card__actions">
          <button class="btn-buy" data-item="${item.name}" data-slug="${slug}" data-price="${item.price}">comprar</button>
        </div>
      </div>
    </article>`;
}

function mountGrid(id, list, q='') {
  const el = document.getElementById(id);
  if (!el) return;
  if (!list || list.length === 0){
    el.innerHTML = '<p class="muted">Nenhum resultado para sua busca.</p>';
    return;
  }
  el.innerHTML = list.map(it => renderCard(it, q)).join('');
  bindBuyButtons(el);
}

// Renderizar todas as seções
mountGrid('grid-suplementos-po', data.suplementos.po, '');
mountGrid('grid-suplementos-caps', data.suplementos.caps, '');
mountGrid('grid-produtos-garrafas', data.produtos.garrafas, '');
mountGrid('grid-produtos-luvas', data.produtos.luvas, '');
mountGrid('grid-recomendados-kits', data.recomendados.kits, '');
mountGrid('grid-recomendados-outros', data.recomendados.outros, '');
mountGrid('grid-promocoes-semana', data.promocoes.semana, '');
mountGrid('grid-promocoes-mes', data.promocoes.mes, '');
mountGrid('grid-roupas-masc', data.roupas.masc, '');
mountGrid('grid-roupas-fem', data.roupas.fem, '');
mountGrid('grid-variados', data.variados.diversos, '');

// Índice dos grids para busca e ordenação
const catalogIndex = {
  'grid-suplementos-po': data.suplementos.po,
  'grid-suplementos-caps': data.suplementos.caps,
  'grid-produtos-garrafas': data.produtos.garrafas,
  'grid-produtos-luvas': data.produtos.luvas,
  'grid-recomendados-kits': data.recomendados.kits,
  'grid-recomendados-outros': data.recomendados.outros,
  'grid-promocoes-semana': data.promocoes.semana,
  'grid-promocoes-mes': data.promocoes.mes,
  'grid-roupas-masc': data.roupas.masc,
  'grid-roupas-fem': data.roupas.fem,
  'grid-variados': data.variados.diversos,
};

function getActiveViewIds(){
  const activeView = document.querySelector('.catalog .tabview.active');
  if (!activeView) return [];
  return Array.from(activeView.querySelectorAll('.cards')).map(el => el.id);
}

function sortList(list, mode){
  if (mode === 'preco-asc'){
    return [...list].sort((a,b) => parsePriceBR(a.price) - parsePriceBR(b.price));
  } else if (mode === 'preco-desc'){
    return [...list].sort((a,b) => parsePriceBR(b.price) - parsePriceBR(a.price));
  }
  return list; // relevância (ordem original)
}

function applyFilters(){
  const q = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const sortMode = document.getElementById('sortSelect')?.value || 'relevancia';
  const ids = getActiveViewIds();
  ids.forEach(id => {
    const original = catalogIndex[id] || [];
    const filtered = q ? original.filter(it => it.name.toLowerCase().includes(q)) : original;
    const sorted = sortList(filtered, sortMode);
    mountGrid(id, sorted, q);
  });
}

// Eventos de busca e ordenação
const searchInputEl = document.getElementById('searchInput');
if (searchInputEl){
  const debounced = debounce(applyFilters, 250);
  searchInputEl.addEventListener('input', debounced);
  searchInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){ applyFilters(); }
    else if (e.key === 'Escape'){ searchInputEl.value = ''; applyFilters(); }
  });
}
const sortSelectEl = document.getElementById('sortSelect');
if (sortSelectEl){
  sortSelectEl.addEventListener('change', () => applyFilters());
}

// Atalho geral: focar busca com '/'
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && searchInputEl && document.activeElement !== searchInputEl){
    e.preventDefault(); searchInputEl.focus();
  }
});

// Inicializar com filtros padrão na aba ativa
document.addEventListener('DOMContentLoaded', applyFilters);

// Favoritos: delegação de clique
if (!window.Wishlist) window.Wishlist = {};
document.addEventListener('click', (e) => {
  const favBtn = e.target.closest('.btn-fav');
  if (!favBtn) return;
  const slug = favBtn.dataset.slug;
  if (!slug) return;
  if (window.Wishlist && typeof window.Wishlist.toggle === 'function'){
    const active = window.Wishlist.toggle(slug);
    favBtn.classList.toggle('active', active);
    showToast(active ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  }
});