# Weather Dashboard (Clima + Calidad del Aire)

Proyecto web que muestra el clima actual, pronóstico a 5 días, y algunos “highlights” (humedad, viento, amanecer/atardecer y calidad del aire) usando la API de **OpenWeather**.

> Interfaz: HTML + CSS + JavaScript (sin framework).

---

## 🧩 ¿Qué incluye?

- Buscar una ciudad y presionar **Enter**.
- Clima actual:
  - Temperatura (°C)
  - Descripción del tiempo
  - Ícono del clima
- Humedad (%), con barra de progreso.
- Viento (convertido de m/s a km/h).
- Amanecer y atardecer.
- Calidad del aire (AQI aproximado) con badge y estilo.
- Pronóstico filtrado desde la API cada 3 horas (se toma el registro de ~**12:00** por día).
- Carga inicial con `Nacimiento, Cl`.

---

## 🚀 Cómo ejecutarlo

1. Asegúrate de tener conexión a Internet.
2. Abre `index.html` en tu navegador.
   - Ideal: usando un servidor local si tu navegador bloquea algunas peticiones.

Ejemplo rápido (opcional):
- Puedes abrir el archivo directamente con doble clic, ya que es una app estática.

---

## 🔑 API Key de OpenWeather

En `asset/js/app.js`:

```js
const API_KEY = "TU_API_KEY";
const BASE_URL = "https://api.openweathermap.org";
```


---

## 🗂️ Estructura del proyecto

- `index.html` → Estructura de la página.
- `asset/css/style.css` → Estilos del dashboard.
- `asset/js/app.js` → Lógica de búsqueda, consumo de la API y render de la UI.

---

## 📌 Notas técnicas

- Geocodificación: usa el endpoint `/geo/1.0/direct` para convertir el nombre de la ciudad a lat/lon.
- Clima actual: `/data/2.5/weather`
- Pronóstico: `/data/2.5/forecast`
- Calidad del aire: `/data/2.5/air_pollution`

---

## 🧪 Probar rápidamente

1. Escribe una ciudad en el buscador.
2. Presiona **Enter**.


---


