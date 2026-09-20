const $ = id => document.getElementById(id);
const money = value => `S/ ${Number(value).toFixed(2)}`;
const products = [
  ['1', 'Café americano', 'Café', 10, 'Espresso intenso, agua caliente y el toque que tú elijas.', true], ['2', 'Flat white', 'Café', 12, 'Espresso doble y leche texturizada.', true], ['3', 'Cold brew', 'Café', 14, 'Café de extracción lenta, fresco y suave.', true], ['4', 'Panini caprese', 'Brunch', 19, 'Pan artesanal, mozzarella y pesto.'], ['5', 'Pancakes de frutos', 'Brunch', 22, 'Fruta fresca, yogurt y miel.'], ['6', 'Keke de plátano', 'Dulces', 10, 'Horneado en casa cada día.']
].map(([id, nombre, categoria, precio, descripcion, customizable = false]) => ({ id, nombre, categoria, precio, descripcion, customizable }));
let cart = [], filter = 'Todo', selectedProduct = null;
const total = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
const details = item => item.options ? Object.values(item.options).flat().filter(Boolean).join(' · ') : '';

function paint() {
  const categories = ['Todo', ...new Set(products.map(product => product.categoria))];
  $('filters').innerHTML = categories.map(category => `<button class="${category === filter ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');
  $('menu').innerHTML = products.filter(product => filter === 'Todo' || product.categoria === filter).map(product => `<article class="product"><span class="tag">${product.categoria}</span><h3>${product.nombre}</h3><p>${product.descripcion}</p><footer><strong>${money(product.precio)}</strong><button data-add="${product.id}" aria-label="Añadir ${product.nombre}">Añadir +</button></footer></article>`).join('');
}
function paintCart() {
  const quantity = cart.reduce((sum, item) => sum + item.qty, 0);
  $('cart-count').textContent = quantity;
  $('cart-items').innerHTML = cart.map(item => `<div class="cart-row"><span><b>${item.qty} × ${item.nombre}</b>${details(item) ? `<small>${details(item)}</small>` : ''}<small>${money(item.price * item.qty)}</small></span><button data-remove="${item.key}" aria-label="Quitar ${item.nombre}">Quitar</button></div>`).join('') || '<p class="empty-cart">Aún no agregaste productos.</p>';
  $('cart-total').textContent = money(total()); $('checkout-details').hidden = !cart.length; $('send-order').disabled = !cart.length;
}
function toast(message) { const note = $('toast'); note.textContent = `✓ ${message}`; note.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { note.hidden = true; }, 3200); }
function addToCart(product, options = null) {
  const extras = options?.extras || [];
  const adjustment = options ? (options.size === 'Grande' ? 3 : 0) + (options.milk === 'Leche vegetal' ? 2 : 0) + extras.reduce((sum, extra) => sum + (extra === 'Shot extra' ? 2 : extra === 'Crema batida' ? 1.5 : 0), 0) : 0;
  const key = `${product.id}-${JSON.stringify(options || {})}`, existing = cart.find(item => item.key === key);
  if (existing) existing.qty++; else cart.push({ ...product, key, qty: 1, price: product.precio + adjustment, options });
  paintCart(); toast(`${product.nombre} se añadió al carrito`);
}
$('filters').onclick = event => { if (event.target.dataset.category) { filter = event.target.dataset.category; paint(); } };
$('menu').onclick = event => { const product = products.find(item => item.id === event.target.dataset.add); if (!product) return; if (!product.customizable) return addToCart(product); selectedProduct = product; $('customizer-title').textContent = product.nombre; $('customizer-price').textContent = `Desde ${money(product.precio)}`; $('customizer-form').reset(); $('customizer').showModal(); };
$('customizer-form').onsubmit = event => { event.preventDefault(); const form = new FormData(event.currentTarget); addToCart(selectedProduct, { temperature: form.get('temperature'), size: form.get('size'), milk: form.get('milk'), sugar: form.get('sugar'), extras: form.getAll('extras') }); $('customizer').close(); };
$('customizer-cancel').onclick = () => $('customizer').close();
$('cart-open').onclick = () => { $('cart').hidden = false; }; $('cart-close').onclick = () => { $('cart').hidden = true; };
$('cart-items').onclick = event => { const item = cart.find(entry => entry.key === event.target.dataset.remove); if (!item) return; if (item.qty > 1) item.qty--; else cart = cart.filter(entry => entry !== item); paintCart(); };
$('service-options').onchange = () => { $('table-field').hidden = document.querySelector('input[name="service"]:checked').value !== 'En mesa'; };
$('send-order').onclick = () => { const service = document.querySelector('input[name="service"]:checked').value; $('confirmation-summary').textContent = `${cart.reduce((sum, item) => sum + item.qty, 0)} productos · ${service} · ${money(total())}`; $('confirm-order').showModal(); };
$('confirmation-cancel').onclick = () => $('confirm-order').close();
$('confirmation-send').onclick = () => { const service = document.querySelector('input[name="service"]:checked').value, payment = document.querySelector('input[name="payment"]:checked').value, name = $('order-name').value.trim(), table = $('table-number').value.trim(); const lines = cart.map(item => `${item.qty} × ${item.nombre}${details(item) ? ` (${details(item)})` : ''} — ${money(item.price * item.qty)}`).join('\n'); const message = `Hola Harvest, deseo realizar un pedido.${name ? `\nCliente: ${name}` : ''}\nModalidad: ${service}${service === 'En mesa' && table ? ` · Mesa ${table}` : ''}\nPago: ${payment}\n\n${lines}\n\nTotal estimado: ${money(total())}`; $('confirm-order').close(); window.open(`https://wa.me/${window.HARVEST_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener'); };
$('booking-form').onsubmit = event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.target)); const message = `Hola Harvest, deseo reservar ${data.tipo === 'salon' ? 'el salón completo' : 'una mesa'}.\nNombre: ${data.nombre}\nCelular: ${data.telefono}\nFecha: ${data.fecha} · ${data.hora}\nPersonas: ${data.personas}\nDetalle: ${data.detalle || '—'}`; window.open(`https://wa.me/${window.HARVEST_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener'); };
paint(); paintCart();
if (!localStorage.getItem('harvest-cookie-consent')) {
  document.body.insertAdjacentHTML('beforeend', `<aside class="cookie-consent" id="cookie-consent" role="dialog" aria-label="Cookies"><h2>Tu privacidad importa</h2><p>Usamos cookies esenciales para que la carta y tu pedido funcionen correctamente. Al continuar, aceptas nuestros <a href="terminos.html">Términos y condiciones</a> y la <a href="privacidad.html">Política de privacidad</a>.</p><div><button id="accept-cookies">Aceptar y continuar</button><button class="cookie-essential" id="essential-cookies">Solo esenciales</button></div></aside>`);
  const saveConsent = value => { localStorage.setItem('harvest-cookie-consent', value); $('cookie-consent').remove(); };
  $('accept-cookies').onclick = () => saveConsent('accepted');
  $('essential-cookies').onclick = () => saveConsent('essential');
}
