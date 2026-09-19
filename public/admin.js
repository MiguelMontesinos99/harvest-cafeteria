const $ = id => document.getElementById(id);
const money = value => `S/ ${Number(value || 0).toFixed(2)}`;
let db, profile, page = 'resumen', products = [];
const pages = { superadmin: { resumen: 'Resumen', ventas: 'Ventas', productos: 'Productos', inventario: 'Inventario', proveedores: 'Proveedores', trabajadores: 'Trabajadores', sueldos: 'Sueldos', finanzas: 'Finanzas' }, cajero: { resumen: 'Mi turno', ventas: 'Registrar venta', productos: 'Stock y productos' } };

async function load() {
  let result = await db.from('perfiles').select('*').single(); if (result.error) throw result.error; profile = result.data;
  result = await db.from('productos').select('*').order('nombre'); if (result.error) throw result.error; products = result.data;
  $('auth').hidden = true; $('app').hidden = false; $('who').textContent = profile.nombre || profile.email; $('role-label').textContent = profile.rol.toUpperCase(); nav(); render();
}
function nav() {
  $('nav').innerHTML = Object.entries(pages[profile.rol]).map(([key, label]) => `<button class="${key === page ? 'active' : ''}" data-page="${key}">${label}</button>`).join('');
  $('nav').onclick = event => { if (event.target.dataset.page) { page = event.target.dataset.page; nav(); render(); } };
}
function render() {
  $('title').textContent = pages[profile.rol][page];
  if (['productos', 'inventario'].includes(page)) {
    $('new').hidden = profile.rol !== 'superadmin';
    $('content').innerHTML = `<section class="panel"><table><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th></tr>${products.map(product => `<tr><td>${product.nombre}</td><td>${money(product.precio)}</td><td>${product.stock_actual}</td><td>${product.disponible ? 'Disponible' : 'Oculto'}</td></tr>`).join('')}</table></section>`; return;
  }
  $('new').hidden = true;
  $('content').innerHTML = `<div class="metrics"><article class="metric"><span>Productos activos</span><strong>${products.filter(product => product.disponible).length}</strong></article><article class="metric"><span>Stock bajo</span><strong>${products.filter(product => product.stock_actual <= product.stock_minimo).length}</strong></article><article class="metric"><span>Ventas del día</span><strong>—</strong></article><article class="metric"><span>${profile.rol === 'superadmin' ? 'Finanzas' : 'Pedidos'}</span><strong>—</strong></article></div><section class="panel"><h2>${profile.rol === 'superadmin' ? 'Control total de Harvest' : 'Control de caja'}</h2><p>${profile.rol === 'superadmin' ? 'Administra ventas, productos, inventario, proveedores, trabajadores, sueldos, ingresos y egresos desde el menú.' : 'Consulta productos y stock del día. El registro de venta se habilita desde Ventas.'}</p></section>`;
}
$('login').onsubmit = async event => { event.preventDefault(); try { const credentials = Object.fromEntries(new FormData(event.target)); const result = await db.auth.signInWithPassword(credentials); if (result.error) throw result.error; await load(); } catch (error) { $('auth-msg').textContent = error.message; } };
$('show-signup').onclick = () => { $('signup-msg').textContent = ''; $('signup').showModal(); };
$('close-signup').onclick = () => $('signup').close();
$('signup-form').onsubmit = async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.target)); $('signup-msg').textContent = 'Creando cuenta…'; try { const result = await db.auth.signUp({ email: data.email, password: data.password, options: { data: { nombre: data.nombre } } }); if (result.error) throw result.error; event.target.reset(); $('signup-msg').textContent = result.data.session ? 'Cuenta creada. Ya puedes ingresar.' : 'Cuenta creada. Revisa el correo para confirmar tu acceso.'; } catch (error) { $('signup-msg').textContent = error.message; } };
$('logout').onclick = async () => { await db.auth.signOut(); location.reload(); };
window.addEventListener('load', () => { if (!window.HARVEST_SUPABASE_URL) return $('auth-msg').textContent = 'Configura Supabase en config.js.'; db = window.supabase.createClient(window.HARVEST_SUPABASE_URL, window.HARVEST_SUPABASE_ANON_KEY); db.auth.getSession().then(result => result.data.session && load().catch(error => $('auth-msg').textContent = error.message)); });
