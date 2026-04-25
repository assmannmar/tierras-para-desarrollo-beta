// ── CAPAS BASE ──────────────────────────────
const calles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const satelite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles &copy; Esri' }
);

// ── MAPA ────────────────────────────────────
const map = L.map('map', {
  center: [-34.22, -59.01],
  zoom: 10,
  layers: [calles],
  zoomControl: true
});

L.control.layers({
  '🗺 Calles': calles,
  '🛰 Satélite': satelite
}).addTo(map);

// ── ÍCONO ───────────────────────────────────
function crearIcono(activo = false) {
  const color = activo ? '#C1272D' : '#1A1A18';
  const glow = activo ? 'filter: drop-shadow(0 2px 6px rgba(193,39,45,0.5));' : '';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" style="${glow}">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 11.2 14.4 24 16 24S32 27.2 32 16C32 7.2 24.8 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -44],
    className: ''
  });
}

// ── ESTADO ───────────────────────────────────
let todosLoLotes = [];
let marcadores = {};
let ciudadActiva = 'todas';

// ── FORMATTERS ───────────────────────────────
function formatHa(m2) {
  return (m2 / 10000).toFixed(1) + ' ha';
}
function formatUSD(n) {
  return 'USD ' + n.toLocaleString('es-AR');
}

// ── RENDER SIDEBAR ───────────────────────────
function renderSidebar(lotes) {
  const list = document.getElementById('loteList');
  const count = document.getElementById('countBar');
  list.innerHTML = '';

  if (lotes.length === 0) {
    list.innerHTML = '<p style="padding:28px 24px;color:var(--gray);font-size:13px;font-family:\'Outfit\',sans-serif;">Sin lotes para esta ciudad.</p>';
    count.textContent = '0 lotes encontrados';
    return;
  }

  lotes.forEach(t => {
    const card = document.createElement('div');
    card.className = 'lote-card';
    card.id = `card-${t.id}`;
    card.innerHTML = `
      <div class="lote-card-ciudad">${t.ciudad}</div>
      <div class="lote-card-nombre">${t.nombre}</div>
      <div class="lote-card-stats">
        <div class="stat-mini">
          <span class="stat-mini-label">Superficie</span>
          <span class="stat-mini-value">${formatHa(t.terreno.superficie_m2)}</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-label">Precio total</span>
          <span class="stat-mini-value">${formatUSD(t.valuacion.precio_total_usd)}</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-label">USD/m²</span>
          <span class="stat-mini-value">${t.valuacion.precio_m2_usd}</span>
        </div>
      </div>
      <a class="lote-card-btn" href="lote.html?id=${t.id}">Ver ficha →</a>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') return;
      centrarEnLote(t);
    });

    list.appendChild(card);
  });

  count.textContent = `${lotes.length} lote${lotes.length !== 1 ? 's' : ''} encontrado${lotes.length !== 1 ? 's' : ''}`;
}

// ── CENTRAR EN LOTE ───────────────────────────
function centrarEnLote(lote) {
  document.querySelectorAll('.lote-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`card-${lote.id}`);
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  map.flyTo([lote.lat, lote.lng], 14, { duration: 1 });
  if (marcadores[lote.id]) {
    marcadores[lote.id].openPopup();
  }
}

// ── FILTROS ───────────────────────────────────
function renderFiltros(lotes) {
  const bar = document.getElementById('filterBar');
  const ciudades = [...new Set(lotes.map(t => t.ciudad))];

  ciudades.forEach(ciudad => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.ciudad = ciudad;
    btn.textContent = ciudad;
    btn.addEventListener('click', () => aplicarFiltro(ciudad));
    bar.appendChild(btn);
  });

  bar.querySelector('[data-ciudad="todas"]').addEventListener('click', () => aplicarFiltro('todas'));
}

function aplicarFiltro(ciudad) {
  ciudadActiva = ciudad;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.ciudad === ciudad);
  });

  const filtrados = ciudad === 'todas'
    ? todosLoLotes
    : todosLoLotes.filter(t => t.ciudad === ciudad);

  renderSidebar(filtrados);

  Object.values(marcadores).forEach(m => map.removeLayer(m));
  Object.keys(marcadores).forEach(k => delete marcadores[k]);
  agregarMarcadores(filtrados);

  if (filtrados.length > 0) {
    const grupo = L.featureGroup(Object.values(marcadores));
    map.fitBounds(grupo.getBounds().pad(0.2));
  }
}

// ── MARCADORES ───────────────────────────────
function agregarMarcadores(lotes) {
  lotes.forEach(t => {
    const marker = L.marker([t.lat, t.lng], { icon: crearIcono() });

    marker.bindPopup(`
      <div class="popup-top">
        <div class="popup-ciudad">${t.ciudad}</div>
        <div class="popup-nombre">${t.nombre}</div>
      </div>
      <div class="popup-body">
        <div class="popup-sup">
          ${formatHa(t.terreno.superficie_m2)} &nbsp;·&nbsp; ${formatUSD(t.valuacion.precio_total_usd)}
        </div>
        <a class="popup-btn" href="lote.html?id=${t.id}">Ver ficha completa →</a>
      </div>
    `, { maxWidth: 270 });

    marker.on('popupopen', () => {
      marker.setIcon(crearIcono(true));
      document.querySelectorAll('.lote-card').forEach(c => c.classList.remove('active'));
      const card = document.getElementById(`card-${t.id}`);
      if (card) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    marker.on('popupclose', () => {
      marker.setIcon(crearIcono(false));
    });

    marker.addTo(map);
    marcadores[t.id] = marker;
  });
}

// ── INICIALIZAR ───────────────────────────────
fetch('data/terrenos.json')
  .then(res => res.json())
  .then(data => {
    todosLoLotes = data;
    renderFiltros(data);
    renderSidebar(data);
    agregarMarcadores(data);

    const grupo = L.featureGroup(Object.values(marcadores));
    map.fitBounds(grupo.getBounds().pad(0.25));
  })
  .catch(err => {
    console.error('Error cargando terrenos.json:', err);
    document.getElementById('countBar').textContent = 'Error al cargar los datos';
  });