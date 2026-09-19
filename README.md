# Harvest Cafetería

Sistema de cafetería en HTML, CSS y JavaScript puro.

## Roles

- **Superadmin:** finanzas, trabajadores, sueldos, proveedores, inventario, productos, ventas y configuración.
- **Cajero:** stock y productos del día, registro de pedidos y ventas.
- **Cliente:** carta, carrito a WhatsApp y reserva de mesa o salón.

## Configuración

1. Crea un proyecto nuevo en Supabase.
2. Ejecuta `supabase/migrations/001_harvest.sql` en el SQL Editor.
3. Copia la URL y publishable key a `public/config.js`.
4. En `public/config.js`, cambia el correo de superadmin por el primer correo autorizado.
5. En Render, cambia `TU-PROYECTO.supabase.co` por tu dominio real de Supabase en la CSP de `render.yaml`.

El primer usuario cuyo correo coincida con `HARVEST_SUPERADMIN_EMAIL` obtiene el rol `superadmin`; las demás cuentas empiezan como `cajero` y el superadmin puede cambiar sus roles desde Supabase.
