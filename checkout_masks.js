document.addEventListener('DOMContentLoaded', () => {
  const form1 = document.getElementById('formStep1');
  const form2 = document.getElementById('formStep2');
  const payCard = document.getElementById('payCard');
  const finalizeBtn = document.getElementById('finalizeCard');
  const agreeTerms = document.getElementById('agreeTerms');
  const cardInfo = document.getElementById('cardInfo');

  // Helpers
  const onlyDigits = (v) => String(v).replace(/\D+/g, '');
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const formatBR = (n) => (isFinite(n) ? n : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Masks: Step 1
  const phone = form1?.querySelector('input[name="telefone"]');
  phone?.addEventListener('input', () => {
    const d = onlyDigits(phone.value).slice(0, 11);
    const p = d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    phone.value = p;
  });
  const cpf = form1?.querySelector('input[name="cpf"]');
  cpf?.addEventListener('input', () => {
    const d = onlyDigits(cpf.value).slice(0, 11);
    const p = d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    cpf.value = p;
  });

  // Masks: Step 2
  const cep = form2?.querySelector('input[name="cep"]');
  cep?.addEventListener('input', () => {
    const d = onlyDigits(cep.value).slice(0, 8);
    const p = d.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    cep.value = p;
  });

  // Card fields
  const titular = payCard?.querySelector('input[name="titular"]');
  const cvv = payCard?.querySelector('input[name="cvv"]');
  const numero = payCard?.querySelector('input[name="numero"]');
  const validade = payCard?.querySelector('input[name="validade"]');
  const cpfTitular = payCard?.querySelector('input[name="cpfTitular"]');
  const selParcelas = payCard?.querySelector('select[name="parcelas"]');

  function detectBrand(digits){
    if (/^4/.test(digits)) return 'Visa';
    if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]|[3-6]|7[01]|720))/.test(digits)) return 'MasterCard';
    if (/^3[47]/.test(digits)) return 'Amex';
    if (/^6(?:011|5)/.test(digits)) return 'Discover';
    if (/^(4011|4312|4389|4514|4576|5041|5067|509|6277|6363)/.test(digits)) return 'Elo';
    return 'Cartão';
  }

  function luhnValid(digits){
    let sum = 0; let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function expiryValid(v){
    const m = v.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return false;
    const mm = clamp(parseInt(m[1], 10), 1, 12);
    const aa = parseInt(m[2], 10);
    const now = new Date();
    const curYY = now.getFullYear() % 100;
    const curMM = now.getMonth() + 1;
    if (aa < curYY) return false;
    if (aa === curYY && mm < curMM) return false;
    return true;
  }

  function cpfValid(d){
    if (!d || d.length !== 11 || /^([0-9])\1+$/.test(d)) return false;
    let sum = 0; for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
    let r = (sum * 10) % 11; if (r === 10) r = 0; if (r !== parseInt(d[9])) return false;
    sum = 0; for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
    r = (sum * 10) % 11; if (r === 10) r = 0; return r === parseInt(d[10]);
  }

  // Masks and brand detection for numero
  numero?.addEventListener('input', () => {
    let d = onlyDigits(numero.value);
    const brand = detectBrand(d);
    const isAmex = brand === 'Amex';
    d = d.slice(0, isAmex ? 15 : 16);
    const pattern = isAmex ? /(\d{4})(\d{6})(\d{0,5})/ : /(\d{4})(\d{4})(\d{4})(\d{0,4})/;
    numero.value = d.replace(pattern, isAmex ? '$1 $2 $3' : '$1 $2 $3 $4');
    updateCardInfo();
    updateFinalizeState();
  });

  cvv?.addEventListener('input', () => {
    const d = onlyDigits(numero.value);
    const brand = detectBrand(d);
    const max = brand === 'Amex' ? 4 : 3;
    cvv.value = onlyDigits(cvv.value).slice(0, max);
    updateFinalizeState();
  });

  validade?.addEventListener('input', () => {
    let d = onlyDigits(validade.value).slice(0, 4);
    d = d.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    validade.value = d;
    updateFinalizeState();
  });

  cpfTitular?.addEventListener('input', () => {
    const d = onlyDigits(cpfTitular.value).slice(0, 11);
    cpfTitular.value = d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    updateFinalizeState();
  });

  selParcelas?.addEventListener('change', () => {
    updateCardInfo();
  });

  agreeTerms?.addEventListener('change', () => {
    updateFinalizeState();
  });

  function computeTotals(){
    if (typeof getCart !== 'function') return { subtotal: 0, discount: 0, shipping: 0, total: 0 };
    const items = getCart();
    const subtotal = items.reduce((acc,i)=> acc + i.price * i.qty, 0);
    const discount = typeof calcDiscount === 'function' ? calcDiscount(subtotal) : 0;
    const shipping = typeof calcShipping === 'function' ? calcShipping(subtotal - discount) : 0;
    const total = Math.max(0, subtotal - discount + shipping);
    return { subtotal, discount, shipping, total };
  }

  function updateCardInfo(){
    if (!cardInfo) return;
    const d = onlyDigits(numero?.value || '');
    const brand = detectBrand(d);
    const parcelas = parseInt(selParcelas?.value || '1', 10) || 1;
    const { total } = computeTotals();
    const per = total / parcelas;
    cardInfo.textContent = `${brand} • ${parcelas}x de ${formatBR(per)} (total ${formatBR(total)})`;
  }

  function updateFinalizeState(){
    if (!finalizeBtn) return;
    const dNum = onlyDigits(numero?.value || '');
    const dCvv = onlyDigits(cvv?.value || '');
    const dCpf = onlyDigits(cpfTitular?.value || '');
    const brand = detectBrand(dNum);
    const validNumber = dNum.length >= (brand === 'Amex' ? 15 : 16) && luhnValid(dNum);
    const validCvv = dCvv.length === (brand === 'Amex' ? 4 : 3);
    const validExpiry = expiryValid(validade?.value || '');
    const validCpf = cpfValid(dCpf);
    const allValid = validNumber && validCvv && validExpiry && validCpf;
    finalizeBtn.disabled = !(allValid && !!agreeTerms?.checked);
  }

  // Initial paint
  updateCardInfo();
  updateFinalizeState();
});