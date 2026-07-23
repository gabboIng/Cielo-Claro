# Cielo Claro ☁️

Dashboard de clima en tiempo real con pronóstico a 5 días,
calidad del aire, presión atmosférica y más.

> Interfaz: HTML + CSS + JavaScript (sin framework).
> Iconos: Boxicons
> API: OpenWeatherMap

---

## 🧩 ¿Qué incluye?

- Buscar una ciudad y presionar **Enter**
- Clima actual:
  - Temperatura (°C)
  - Descripción del tiempo
  - Ícono dinámico del clima
- Pronóstico filtrado a 5 días (registro de ~12:00 PM por día)
- Tarjeta de pronóstico de mañana
- Humedad (%) con barra de progreso
- Punto de rocío calculado
- Viento en km/h con dirección (Norte, Sur, Este, Oeste...)
- Presión atmosférica con descripción
- Amanecer y atardecer (formato 12h)
- Calidad del aire (AQI 1-5) con badge y color
- Probabilidad de lluvia
- Carga automática con `Nacimiento, Cl`

---

## 🛠️ Tecnologías

- **HTML5** — Estructura semántica
- **CSS3** — Grid, Flexbox, Variables CSS, Responsive
- **JavaScript ES6+** — async/await, fetch, DOM
- **Boxicons** — Iconos vectoriales
- **OpenWeatherMap API** — Datos del clima

---

## 🚀 Cómo ejecutarlo

### Requisitos
- Conexión a Internet
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### Pasos
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/cielo-claro.git
   ```
2. Abre `index.html` en tu navegador

Opcional: Usa un servidor local (Live Server de VS Code).

---

## 🔑 API Key de OpenWeather

1. Ve a [https://openweathermap.org/api](https://openweathermap.org/api)
2. Regístrate gratis
3. Ve a "My API Keys"
4. Copia tu key
5. Pégala en `asset/js/app.js` línea 1:
   ```js
   const API_KEY = "TU_API_KEY_AQUI";
   ```

> La key puede tardar hasta 2 horas en activarse.

---

## 🗂️ Estructura del proyecto

```
├── index.html              → Estructura de la página
├── asset/
│   ├── css/style.css       → Estilos del dashboard
│   └── js/app.js           → Lógica y consumo de API
└── readme.md               → Este archivo
```

---

## 📌 Notas técnicas

### Endpoints usados
| Endpoint | Uso |
|---|---|
| `/geo/1.0/direct` | Convertir ciudad → coordenadas |
| `/data/2.5/weather` | Clima actual |
| `/data/2.5/forecast` | Pronóstico 5 días |
| `/data/2.5/air_pollution` | Calidad del aire |

### Funciones principales
| Función | Descripción |
|---|---|
| `getWeatherData(city)` | Función principal, coordina las peticiones |
| `updateUI(current, forecast, air)` | Actualiza todos los elementos del HTML |
| `renderForecast(list)` | Genera HTML del pronóstico 5 días |
| `renderTomorrowCard(list)` | Muestra el pronóstico de mañana |
| `formatUnixTime(unix, offset)` | Convierte timestamp Unix a hora legible |
| `getWindDirection(degrees)` | Convierte grados a punto cardinal |
| `calculateDewPoint(temp, hum)` | Calcula punto de rocío con fórmula de Magnus |
| `getPressureDescription(pressure)` | Describe la presión atmosférica |
| `updateAirQualityCard(aqi)` | Actualiza badge y color de calidad del aire |

---

## ⚠️ Limitaciones conocidas

- **UV Index** no está disponible en la API gratuita (requiere One Call 3.0 de pago)
- El pronóstico usa registros de **12:00 PM** como representativo del día
- La API gratuita tiene límite de **60 llamadas/minuto**

---

## 📱 Responsive

El diseño se adapta a:
- Escritorio (grid de 2 columnas)
- Tablet (1 columna)
- Móvil (stack vertical)

---

## 🔮 Mejoras futuras

- [ ] Modo oscuro
- [ ] Historial de búsquedas
- [ ] Ciudades favoritas
- [ ] Loading spinner
- [ ] Manejo offline
- [ ] UV Index (con API de pago)

---

## 👤 Autor

**gabboIng** — [GitHub](https://github.com/gabboIng)

---
