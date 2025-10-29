(function(){
  function slugify(name){
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }
  function findItemBySlug(slug){
    const data = window.catalogData || {};
    for (const section of Object.values(data)){
      for (const group of Object.values(section)){
        for (const item of group){
          if (slugify(item.name) === slug) return item;
        }
      }
    }
    return null;
  }

  function setPriceBadge(price){
    const badge = document.querySelector('.product__media .price-badge');
    if (badge) badge.textContent = price || '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug') || '';
    const item = findItemBySlug(slug);
    const titleEl = document.getElementById('product-name') || document.querySelector('.product__title');
    const priceEl = document.getElementById('product-price') || document.querySelector('.product__price');
    const imgEl = document.getElementById('product-img') || document.querySelector('.product__img');
    if (item){
      if (titleEl) titleEl.textContent = item.name;
      if (priceEl) priceEl.textContent = item.price;
      if (imgEl) {
        imgEl.src = item.img || 'assets/placeholder.svg';
        imgEl.alt = item.name;
        imgEl.onerror = () => { imgEl.src = 'assets/placeholder.svg'; };
      }
      setPriceBadge(item.price);
    }
  });
})();