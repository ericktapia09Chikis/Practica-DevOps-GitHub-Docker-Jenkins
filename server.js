const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Base de datos en memoria con productos iniciales de ejemplo
let productos = [
    { id: 101, sku: 'TECH-01', nombre: 'Laptop Dell Latitude 5420', categoria: 'Cómputo', stock: 8, precio: 14500.00 },
    { id: 102, sku: 'PER-04', nombre: 'Mouse Inalámbrico Logitech', categoria: 'Accesorios', stock: 3, precio: 349.00 },
    { id: 103, sku: 'RED-12', nombre: 'Router Wi-Fi 6 Doble Banda', categoria: 'Redes', stock: 15, precio: 1290.00 },
    { id: 104, sku: 'MON-09', nombre: 'Monitor LED 24" Full HD', categoria: 'Monitores', stock: 2, precio: 2850.00 }
];
let nextId = 105;

app.get('/', (req, res) => {
    const totalProductos = productos.length;
    const totalUnidades = productos.reduce((acc, p) => acc + p.stock, 0);
    const valorInventario = productos.reduce((acc, p) => acc + (p.stock * p.precio), 0);
    const stockBajoCount = productos.filter(p => p.stock <= 5).length;

    const filasTabla = productos.map(p => {
        const esBajo = p.stock <= 5;
        const badgeEstado = esBajo
            ? `<span class="badge badge-warning">Stock Bajo (${p.stock})</span>`
            : `<span class="badge badge-success">Disponible (${p.stock})</span>`;

        return `
        <tr class="fila-producto">
            <td><strong>${p.sku}</strong></td>
            <td>
                <div class="prod-nombre">${p.nombre}</div>
                <div class="prod-cat">${p.categoria}</div>
            </td>
            <td>$${p.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
            <td>${badgeEstado}</td>
            <td class="acciones">
                <form method="POST" action="/vender/${p.id}" style="display:inline;">
                    <button type="submit" class="btn-sm btn-sell" ${p.stock === 0 ? 'disabled' : ''} title="Descontar 1 unidad por venta">-1 Venta</button>
                </form>
                <form method="POST" action="/reabastecer/${p.id}" style="display:inline;">
                    <button type="submit" class="btn-sm btn-add" title="Agregar 1 unidad al stock">+1</button>
                </form>
                <form method="POST" action="/eliminar/${p.id}" style="display:inline;">
                    <button type="submit" class="btn-sm btn-del" title="Eliminar producto">✕</button>
                </form>
            </td>
        </tr>`;
    }).join('');

    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexusStock Pro | Gestión de Inventario Empresarial</title>
    <style>
        :root {
            --primary: #1e3a8a;
            --primary-light: #2563eb;
            --bg: #f1f5f9;
            --surface: #ffffff;
            --text: #0f172a;
            --muted: #64748b;
            --border: #e2e8f0;
            --success-bg: #dcfce7;
            --success-text: #166534;
            --warn-bg: #fef3c7;
            --warn-text: #92400e;
            --danger: #dc2626;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
        body { background: var(--bg); color: var(--text); }
        
        /* Barra superior corporativa */
        .navbar {
            background: var(--primary);
            color: white;
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-logo {
            background: #38bdf8;
            color: #0f172a;
            font-weight: 800;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 1.1rem;
        }
        .brand h1 { font-size: 1.25rem; font-weight: 700; letter-spacing: 0.3px; }
        .brand span { font-size: 0.8rem; color: #cbd5e1; display: block; }
        .env-tag {
            background: rgba(255,255,255,0.15);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .container { max-width: 1150px; margin: 28px auto; padding: 0 20px; }

        /* Tarjetas de KPIs / Métricas */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 18px;
            margin-bottom: 26px;
        }
        .kpi-card {
            background: var(--surface);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid var(--border);
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .kpi-label { font-size: 0.82rem; color: var(--muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
        .kpi-value { font-size: 1.75rem; font-weight: 800; color: var(--text); margin-top: 6px; }
        .kpi-sub { font-size: 0.8rem; color: var(--muted); margin-top: 4px; }

        /* Contenedor principal de 2 columnas */
        .main-grid {
            display: grid;
            grid-template-columns: 320px 1fr;
            gap: 24px;
            align-items: start;
        }
        @media (max-width: 850px) { .main-grid { grid-template-columns: 1fr; } }

        .card {
            background: var(--surface);
            border-radius: 12px;
            border: 1px solid var(--border);
            padding: 22px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .card h2 { font-size: 1.05rem; margin-bottom: 16px; color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 10px; }

        .form-group { margin-bottom: 14px; }
        label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; color: #334155; }
        input, select {
            width: 100%;
            padding: 9px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 0.92rem;
            outline: none;
        }
        input:focus, select:focus { border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
        .btn-primary {
            width: 100%;
            background: var(--primary-light);
            color: white;
            border: none;
            padding: 11px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            margin-top: 6px;
        }
        .btn-primary:hover { background: var(--primary); }

        /* Tabla y buscador */
        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }
        .table-header h2 { border: none; margin: 0; padding: 0; }
        .search-box { max-width: 260px; }

        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { text-align: left; padding: 11px 10px; background: #f8fafc; color: var(--muted); font-weight: 700; border-bottom: 2px solid var(--border); font-size: 0.8rem; text-transform: uppercase; }
        td { padding: 12px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        tr:hover { background: #f8fafc; }
        .prod-nombre { font-weight: 600; color: var(--text); }
        .prod-cat { font-size: 0.78rem; color: var(--muted); }

        .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; display: inline-block; }
        .badge-success { background: var(--success-bg); color: var(--success-text); }
        .badge-warning { background: var(--warn-bg); color: var(--warn-text); }

        .acciones { white-space: nowrap; }
        .btn-sm {
            border: none;
            padding: 5px 9px;
            border-radius: 6px;
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
            margin-right: 3px;
        }
        .btn-sell { background: #e0f2fe; color: #0369a1; }
        .btn-sell:hover:not(:disabled) { background: #bae6fd; }
        .btn-sell:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-add { background: #dcfce7; color: #15803d; }
        .btn-add:hover { background: #bbf7d0; }
        .btn-del { background: #fee2e2; color: var(--danger); }
        .btn-del:hover { background: #fecaca; }

        footer { text-align: center; color: var(--muted); font-size: 0.82rem; margin: 30px 0; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="brand">
            <div class="brand-logo">NS</div>
            <div>
                <h1>NexusStock Pro</h1>
                <span>Sistema Empresarial de Inventario y Punto de Venta</span>
            </div>
        </div>
        <div class="env-tag">🚀 Desplegado vía CI/CD (Docker + Jenkins)</div>
    </nav>

    <div class="container">
        <!-- Tarjetas de Resumen Ejecutivo -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-label">Catálogo Activo</div>
                <div class="kpi-value">${totalProductos}</div>
                <div class="kpi-sub">Productos registrados</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Existencias Totales</div>
                <div class="kpi-value">${totalUnidades}</div>
                <div class="kpi-sub">Unidades en almacén</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Valor del Inventario</div>
                <div class="kpi-value">$${valorInventario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                <div class="kpi-sub">Capital total en mercancía</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Alertas de Reabasto</div>
                <div class="kpi-value" style="color: ${stockBajoCount > 0 ? '#d97706' : '#16a34a'};">${stockBajoCount}</div>
                <div class="kpi-sub">Productos con ≤ 5 unidades</div>
            </div>
        </div>

        <div class="main-grid">
            <!-- Formulario de Alta -->
            <div class="card">
                <h2>+ Nuevo Producto</h2>
                <form method="POST" action="/agregar">
                    <div class="form-group">
                        <label>Código SKU</label>
                        <input name="sku" placeholder="Ej. TECH-05" required />
                    </div>
                    <div class="form-group">
                        <label>Nombre del Producto</label>
                        <input name="nombre" placeholder="Ej. Teclado Mecánico RGB" required />
                    </div>
                    <div class="form-group">
                        <label>Categoría</label>
                        <select name="categoria">
                            <option value="Cómputo">Cómputo</option>
                            <option value="Accesorios">Accesorios</option>
                            <option value="Redes">Redes</option>
                            <option value="Monitores">Monitores</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Precio Unitario ($ MXN)</label>
                        <input type="number" step="0.01" min="1" name="precio" placeholder="0.00" required />
                    </div>
                    <div class="form-group">
                        <label>Stock Inicial</label>
                        <input type="number" min="1" name="stock" placeholder="10" required />
                    </div>
                    <button type="submit" class="btn-primary">Registrar en Inventario</button>
                </form>
            </div>

            <!-- Tabla de Inventario -->
            <div class="card">
                <div class="table-header">
                    <h2>Inventario en Tiempo Real</h2>
                    <input type="text" id="buscador" class="search-box" placeholder="🔍 Buscar por SKU o nombre..." onkeyup="filtrarTabla()" />
                </div>
                <div style="overflow-x:auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Operaciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaCuerpo">
                            ${filasTabla || '<tr><td colspan="5" style="text-align:center;color:#64748b;">No hay productos registrados.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <footer>
        NexusStock Pro v2.0 — Desarrollado por Erick Antonio Pérez Tapia | Ingeniería en Desarrollo y Gestión de Software (UTFV)
    </footer>

    <script>
        function filtrarTabla() {
            const filtro = document.getElementById('buscador').value.toLowerCase();
            const filas = document.querySelectorAll('.fila-producto');
            filas.forEach(fila => {
                const texto = fila.innerText.toLowerCase();
                fila.style.display = texto.includes(filtro) ? '' : 'none';
            });
        }
    </script>
</body>
</html>`);
});

app.post('/agregar', (req, res) => {
    const { sku, nombre, categoria, precio, stock } = req.body;
    productos.push({
        id: nextId++,
        sku: sku.toUpperCase(),
        nombre,
        categoria,
        precio: parseFloat(precio),
        stock: parseInt(stock, 10)
    });
    res.redirect('/');
});

app.post('/vender/:id', (req, res) => {
    const prod = productos.find(p => p.id === parseInt(req.params.id, 10));
    if (prod && prod.stock > 0) prod.stock -= 1;
    res.redirect('/');
});

app.post('/reabastecer/:id', (req, res) => {
    const prod = productos.find(p => p.id === parseInt(req.params.id, 10));
    if (prod) prod.stock += 1;
    res.redirect('/');
});

app.post('/eliminar/:id', (req, res) => {
    productos = productos.filter(p => p.id !== parseInt(req.params.id, 10));
    res.redirect('/');
});

app.listen(PORT, () => console.log(`NexusStock Pro corriendo en http://localhost:${PORT}`));