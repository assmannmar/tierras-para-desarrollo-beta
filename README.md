# tierras-para-desarrollo-beta

Herramienta interactiva para visualización y análisis de macrolotes para desarrollo inmobiliario en la zona de Campana, Zárate y Los Cardales, provincia de Buenos Aires.

---

## 📁 Estructura del proyecto

```
/
├── index.html          # Mapa principal con sidebar de lotes
├── lote.html           # Ficha técnica detallada de cada lote
├── js/
│   ├── script.js       # Lógica del mapa (Leaflet, marcadores, filtros)
│   └── detalle.js      # Lógica de la ficha de detalle
├── data/
│   └── terrenos.json   # Base de datos de lotes (fuente única de verdad)
├── img/
│   └── lotes/          # Imágenes organizadas por ID de lote
│       ├── 1/
│       ├── 2/
│       └── ...
└── favicon.ico
```

---

## ✨ Funcionalidades

### `index.html` — Mapa principal
- Mapa interactivo con **Leaflet.js**, con capas intercambiables (calles / satélite).
- **Sidebar** con tarjetas de lotes que muestran superficie, precio total y USD/m².
- **Filtros por ciudad** (Campana, Zárate, Cardales, etc.) generados dinámicamente desde los datos.
- **Marcadores personalizados** en SVG con estado activo (rojo) e inactivo (negro).
- **Popups** al hacer clic en marcador, con acceso directo a la ficha.
- Diseño **responsive**: en móvil el sidebar se convierte en un panel deslizante desde abajo, con botón flotante para alternar entre mapa y lista.

### `lote.html` — Ficha técnica
- Carga dinámica de datos desde `terrenos.json` según el parámetro `?id=` en la URL.
- **Cabecera con KPIs**: superficie, lotes estimados, precio total y precio por m².
- Secciones estructuradas: ubicación y entorno, nomenclatura catastral, características del terreno, zonificación, galería de imágenes, análisis de potencial de desarrollo y valuación.
- **Mini-mapa satelital** con polígono del lote trazado a partir de vértices en el JSON.
- **Galería de imágenes** con lightbox integrado.
- **Footer institucional** con datos de las tres sucursales y redes sociales.
- Botón de **descarga PDF** via `window.print()`.

---

## 🗃 Estructura de `terrenos.json`

Cada objeto en el array representa un lote y contiene los siguientes bloques:

| Bloque | Descripción |
|--------|-------------|
| `id`, `nombre`, `ciudad` | Identificación básica |
| `lat`, `lng` | Centro del lote (para el marcador) |
| `lat1–lat6`, `lng1–lng6` | Vértices del polígono en el mini-mapa |
| `imagenes` | Array de rutas a imágenes del lote |
| `ubicacion` | Dirección, partido, provincia y descripción narrativa |
| `catastro` | Nomenclatura catastral y partida inmobiliaria |
| `terreno` | Superficie, frente, fondo y accesos |
| `zonificacion` | Zonificación actual, potencial y observaciones |
| `indicadores_urbanisticos` | FOS, FOT, subdivisión mínima, densidad |
| `analisis` | Uso sugerido, lotes estimados, coeficiente de ocupación |
| `valuacion` | Precio total, precio por m², fecha y notas |

---

## 🚀 Cómo usar

El proyecto es **100% estático** — no requiere backend ni proceso de build.

1. Clonar o descargar el repositorio.
2. Servir desde cualquier servidor HTTP estático (no funciona abriendo el HTML directamente por las peticiones `fetch` a `terrenos.json`).

```bash
# Con Python
python3 -m http.server 8080

# Con Node / npx
npx serve .
```

3. Abrir `http://localhost:8080` en el navegador.

---

## ➕ Agregar un nuevo lote

1. Abrir `data/terrenos.json`.
2. Agregar un nuevo objeto al array con la estructura descrita arriba. El campo `id` debe ser único y correlativo.
3. Crear la carpeta `img/lotes/{id}/` y agregar las imágenes correspondientes.
4. El lote aparecerá automáticamente en el mapa y en el sidebar.

---

## 🛠 Tecnologías utilizadas

| Tecnología | Uso |
|------------|-----|
| [Leaflet.js](https://leafletjs.com/) v1.9.4 | Mapas interactivos |
| OpenStreetMap | Capa base de calles |
| Esri World Imagery | Capa satelital |
| [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) | Tipografía display |
| [Outfit](https://fonts.google.com/specimen/Outfit) | Tipografía UI |
| HTML / CSS / JS vanilla | Sin frameworks ni dependencias de build |

---

## 🎨 Design tokens principales

```css
--red:        #C1272D   /* Acento principal */
--black:      #0A0A0A   /* Fondos oscuros */
--off-white:  #F7F4F0   /* Fondo general */
--cream:      #EDE9E3   /* Estados activos */
--gray:       #8A8680   /* Texto secundario */
```

