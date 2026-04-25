// ─────────────────────────────────────────────
//  MACROLOTES — detalle.js  (lógica de la ficha)
// ─────────────────────────────────────────────

// ── UTILIDADES ───────────────────────────────
function normalizar(lote) {
  lote.ubicacion.descripcion = lote.ubicacion.descripcion || '—';
  lote.ubicacion.provincia   = lote.ubicacion.provincia   || '—';
  lote.catastro.matricula    = lote.catastro.matricula    || 'S/N';
  lote.catastro.partida      = lote.catastro.partida      || '—';
  lote.catastro.titularidad  = lote.catastro.titularidad  || '—';
  lote.terreno.servicios     = Array.isArray(lote.terreno.servicios) ? lote.terreno.servicios : ['—'];
  lote.terreno.accesos       = lote.terreno.accesos   || '—';
  lote.terreno.frente_ml     = lote.terreno.frente_ml || '—';
  lote.terreno.fondo_ml      = lote.terreno.fondo_ml  || '—';
  lote.terreno.topografia    = lote.terreno.topografia || '—';
  lote.terreno.suelo         = lote.terreno.suelo      || '—';
  lote.terreno.agua          = lote.terreno.agua       || '—';
  lote.valuacion.notas       = lote.valuacion.notas    || '—';
  return lote;
}

function formatHa(m2) {
  const ha = (m2 / 10000).toFixed(2);
  return `${ha} ha`;
}

function formatM2(m2) {
  return m2.toLocaleString('es-AR') + ' m²';
}

function formatUSD(n) {
  return 'USD ' + n.toLocaleString('es-AR');
}

function formatFecha(str) {
  if (!str) return '—';
  const partes = str.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  if (partes.length === 2) {
    return `${meses[parseInt(partes[1])-1]} ${partes[0]}`;
  }
  const [a, m, d] = partes;
  return `${d} ${meses[parseInt(m)-1]} ${a}`;
}

// ── URL PARAM ────────────────────────────────
function obtenerIdDesdURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}
// ── CONSTRUIR FICHA ──────────────────────────
function construirFicha(lote) {
  const ficha = document.getElementById('ficha');
  const hoy = new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' });
  const galeriaHTML = (lote.imagenes && lote.imagenes.length > 0) ? `
    <div class="seccion span2">
      <div class="sec-titulo">
        <span class="sec-num">📷</span>
        <span class="sec-nombre">Galería de imágenes</span>
      </div>
      <div class="galeria-grid">
        ${lote.imagenes.map(src => `<img src="${src}" alt="${lote.nombre}" loading="lazy" onclick="abrirLightbox('${src}')">`).join('')}
      </div>
    </div>
    ` : '';

  ficha.innerHTML = `

    <!-- ── CABECERA ── -->
    <div class="ficha-header">
      <div class="ficha-ref">INFORME TÉCNICO</div>
      <h1 class="ficha-titulo">${lote.nombre}</h1>
      <div class="ficha-ciudad">${lote.ciudad} &nbsp;·&nbsp; ${lote.ubicacion.partido}, Prov. Buenos Aires</div>

      <div class="ficha-kpis">
        <div class="kpi">
          <span class="kpi-label">Superficie total</span>
          <span class="kpi-value">${formatHa(lote.terreno.superficie_m2)}</span>
          <span class="kpi-sub">${formatM2(lote.terreno.superficie_m2)}</span>
        </div>
        <div class="kpi">
          <span class="kpi-label">Lotes estimados</span>
          <span class="kpi-value">${lote.analisis.lotes_estimados}</span>
          <span class="kpi-sub">${formatM2(lote.analisis.superficie_lote_promedio_m2)} c/u</span>
        </div>
        <div class="kpi highlight">
          <span class="kpi-label">Precio total</span>
          <span class="kpi-value">${formatUSD(lote.valuacion.precio_total_usd)}</span>
        </div>
        <div class="kpi">
          <span class="kpi-label">Precio por m²</span>
          <span class="kpi-value">USD ${lote.valuacion.precio_m2_usd}</span>
          <span class="kpi-sub">Al ${formatFecha(lote.valuacion.fecha_valuacion)}</span>
        </div>
      </div>
    </div>

    <!-- ── CUERPO ── -->
    <div class="ficha-body">    
    
    <!-- 01 · UBICACIÓN -->
      <div class="seccion span2">
        <div class="sec-titulo">
          <span class="sec-num">01</span>
          <span class="sec-nombre">Ubicación y entorno</span>
        </div>
        <p class="texto-desc">${lote.ubicacion.descripcion}</p>
        <div class="addr-line">
          📍 <strong>${lote.ubicacion.direccion}</strong> &nbsp;·&nbsp; ${lote.ubicacion.partido}, ${lote.ubicacion.provincia}
        </div>
        <div id="mini-mapa"></div>
      </div>

      <!-- 02 · CATASTRO -->
      <div class="seccion">
        <div class="sec-titulo">
          <span class="sec-num">02</span>
          <span class="sec-nombre">Nomenclatura catastral</span>
        </div>
        <table class="datos-tabla">
          <tr><td>Nomenclatura</td><td>${lote.catastro.nomenclatura}</td></tr>
          <tr><td>Partida inmobiliaria</td><td>${lote.catastro.partida}</td></tr>

          <!--
          <tr><td>Titularidad</td><td>${lote.catastro.titularidad}</td></tr>
          -->

        </table>
      </div>

      <!-- 03 · CARACTERÍSTICAS -->
      <div class="seccion">
        <div class="sec-titulo">
          <span class="sec-num">03</span>
          <span class="sec-nombre">Características del terreno</span>
        </div>
        <table class="datos-tabla">
          <tr><td>Superficie</td><td>${formatM2(lote.terreno.superficie_m2)} (${formatHa(lote.terreno.superficie_m2)})</td></tr>
          <tr><td>Frente</td><td>${lote.terreno.frente_ml !== '—' ? lote.terreno.frente_ml + ' ml' : '—'}</td></tr>
          <tr><td>Fondo</td><td>${lote.terreno.fondo_ml !== '—' ? lote.terreno.fondo_ml + ' ml' : '—'}</td></tr>
          
          <!--
          <tr><td>Topografía</td><td>${lote.terreno.topografia}</td></tr>
          <tr><td>Tipo de suelo</td><td>${lote.terreno.suelo}</td></tr>
          <tr><td>Agua</td><td>${lote.terreno.agua}</td></tr>
          -->

          <tr><td>Accesos</td><td>${lote.terreno.accesos}</td></tr>
        </table>
        
        <!--
        <div class="pills-wrap">
          <div class="pills-label">Servicios disponibles</div>
          <div class="pills">
            ${lote.terreno.servicios.map(s => `<span class="pill">${s}</span>`).join('')}
          </div>
        </div>
          -->

      </div>

      <!-- 04 · ZONIFICACIÓN -->
      <div class="seccion">
        <div class="sec-titulo">
          <span class="sec-num">04</span>
          <span class="sec-nombre">Zonificación</span>
        </div>
        <div class="zona-label">Estado actual</div>
        <div class="zona-badge actual">${lote.zonificacion.actual}</div>
        <div class="zona-label" style="margin-top:16px;">Potencial / Cambio posible</div>
        <div class="zona-badge potencial">${lote.zonificacion.potencial}</div>
        <p class="zona-obs">${lote.zonificacion.observaciones}</p>
      </div>  
      
      ${galeriaHTML}
      
      <!-- 05 · ANÁLISIS -->
      <div class="seccion span2">
        <div class="sec-titulo">
          <span class="sec-num">05</span>
          <span class="sec-nombre">Análisis de potencial de desarrollo</span>
        </div>
        <div class="uso-badge">${lote.analisis.uso_sugerido}</div>
        <div class="potencial-grid">
          <div class="pot-item">
            <div class="pot-label">Lotes estimados</div>
            <div class="pot-value">${lote.analisis.lotes_estimados}</div>
          </div>
          <div class="pot-item">
            <div class="pot-label">Superficie prom. por lote</div>
            <div class="pot-value">${formatM2(lote.analisis.superficie_lote_promedio_m2)}</div>
          </div>
          <div class="pot-item highlight-pot">
            <div class="pot-label">Coeficiente de ocupación</div>
            <div class="pot-value">${(lote.analisis.coeficiente_ocupacion * 100).toFixed(0)}%</div>
          </div>
        </div>
        <p class="texto-desc" style="font-size:13px; color: var(--muted);">${lote.analisis.observaciones}</p>
      </div>

      <!-- 06 · VALUACIÓN -->
      <div class="seccion span2">
        <div class="sec-titulo">
          <span class="sec-num">06</span>
          <span class="sec-nombre">Valuación</span>
        </div>
        <div class="valuacion-hero">
          <div class="val-item">
            <div class="val-label">Precio total</div>
            <div class="val-value">${formatUSD(lote.valuacion.precio_total_usd)}</div>
          </div>
          <div class="val-item">
            <div class="val-label">Precio por m²</div>
            <div class="val-value">USD ${lote.valuacion.precio_m2_usd}/m²</div>
            <div class="val-sub">Valuación al ${formatFecha(lote.valuacion.fecha_valuacion)}</div>
          </div>
        </div>
        ${lote.valuacion.notas !== '—' ? `<div class="val-nota"><strong>Nota:</strong> ${lote.valuacion.notas}</div>` : ''}
      </div>

    </div><!-- /ficha-body -->

    <!-- FICHA FOOTER note -->
    <div style="padding: 12px 0; font-family:'Outfit',sans-serif; font-size:10px; color:var(--gray); text-align:right; text-transform:uppercase; letter-spacing:2px;">
      Informe generado el <strong>${hoy}</strong>
    </div>
  `;

  inicializarMiniMapa(lote);
}

// ── MINI MAP ─────────────────────────────────
function inicializarMiniMapa(lote) {
  const miniMap = L.map('mini-mapa', {
    center: [lote.lat, lote.lng],
    zoom: 14,
    minZoom: 13,
    maxZoom: 18,
    zoomControl: true,
    dragging: true,
    scrollWheelZoom: true
  });

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri' 
  }).addTo(miniMap);

  //  ARRAY DE COORDENADAS DEL POLÍGONO
  const coordenadas = [
    [lote.lat1, lote.lng1],
    [lote.lat2, lote.lng2],
    [lote.lat3, lote.lng3],
    [lote.lat4, lote.lng4],
    [lote.lat5, lote.lng5],
    [lote.lat6, lote.lng6]
  ];

  // CREAR POLÍGONO
  const poligono = L.polygon(coordenadas, {
    color: '#C1272D',
    fillColor: '#C1272D',
    fillOpacity: 0.3,
    weight: 2
  }).addTo(miniMap);

  //  OPCIONAL: centrar automáticamente al polígono
  miniMap.fitBounds(poligono.getBounds());
}

// ── INICIALIZAR ───────────────────────────────
function inicializar() {
  const id = obtenerIdDesdURL();
  const ficha = document.getElementById('ficha');

  if (isNaN(id)) {
    ficha.innerHTML = `<div class="error-msg">
      <p style="font-size:48px;margin-bottom:16px;">⚠️</p>
      <p style="font-family:'Cormorant Garamond',serif;font-size:22px;margin-bottom:8px;">Sin lote especificado</p>
      <p style="color:var(--muted);">Accedé a esta página desde el mapa usando el botón "Ver ficha".</p>
      <a href="index.html" style="display:inline-block;margin-top:20px;color:var(--red);font-family:'Outfit',sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:2px;">← Volver al mapa</a>
    </div>`;
    return;
  }

  fetch('data/terrenos.json')
    .then(res => res.json())
    .then(data => {
      const lote = data.find(t => t.id === id);

      if (!lote) {
        ficha.innerHTML = `<div class="error-msg">
          <p style="font-size:48px;margin-bottom:16px;">🔍</p>
          <p style="font-family:'Cormorant Garamond',serif;font-size:22px;margin-bottom:8px;">Lote no encontrado</p>
          <p style="color:var(--muted);">No existe un lote con id = ${id}.</p>
          <a href="index.html" style="display:inline-block;margin-top:20px;color:var(--red);font-family:'Outfit',sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:2px;">← Volver al mapa</a>
        </div>`;
        return;
      }

      document.title = `${lote.nombre} | CADEMA Bienes Raíces`;
      construirFicha(normalizar(lote));
    })
    .catch(err => {
      console.error(err);
      ficha.innerHTML = `<div class="error-msg">
        <p style="color:var(--red);">Error al cargar los datos del lote.</p>
        <a href="index.html" style="display:inline-block;margin-top:20px;color:var(--red);font-family:'Outfit',sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:2px;">← Volver al mapa</a>
      </div>`;
    });
}

inicializar();