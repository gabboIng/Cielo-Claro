const API_KEY = "4c0b6f3ba89ae65e0c4da57ab93a6c15"; 
const BASE_URL = "https://api.openweathermap.org";

const searchInput = document.getElementById("search-input");
const locationName = document.getElementById("location-name");
const tempValue = document.getElementById("temp-value");
const weatherDescription = document.getElementById("weather-description");
const mainWeatherIcon = document.getElementById("main-weather-icon");
const humidityPercent = document.getElementById("humidity-percent");
const humidityBar = document.getElementById("humidity-bar");
const windVal = document.getElementById("wind-val");
const sunriseTime = document.getElementById("sunrise-time");
const sunsetTime = document.getElementById("sunset-time");
const currentDateSpan = document.getElementById("current-date");
const aqiValue = document.getElementById("aqi-value");

// Fecha de hoy
const options = { weekday: 'long', day: 'numeric', month: 'long' };
currentDateSpan.textContent = new Date().toLocaleDateString('es-ES', options);

// Escuchar Enter en el buscador
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) getWeatherData(city);
    }
});

async function getWeatherData(city) {
    try {
        // 1. Obtener Coordenadas
        const geoUrl = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        
        // Si la respuesta del servidor no es correcta (ej: error 401 por API key inválida)
        if (!geoResponse.ok) {
            console.error(`Error del servidor: Código ${geoResponse.status}`);
            if (geoResponse.status === 401) {
                alert("Error 401: Tu API Key no es válida o aún no se ha activado. OpenWeather puede tardar hasta 2 horas en activar cuentas nuevas.");
            } else {
                alert(`Error al conectar con el servidor de mapas (Código ${geoResponse.status})`);
            }
            return;
        }

        const geoData = await geoResponse.json();

        // Si la respuesta es exitosa pero la lista viene vacía (ej: ciudad no existe)
        if (!geoData || geoData.length === 0) {
            alert(`No pudimos encontrar la ciudad "${city}". Intenta con otra.`);
            return;
        }

        console.log("¡Éxito! Datos de ubicación recibidos:", geoData[0]);

        const { lat, lon, name, country } = geoData[0];
        locationName.textContent = `${name}, ${country}`;

        // 2. Obtener clima, pronóstico y contaminación
        const [currentRes, forecastRes, airRes] = await Promise.all([
            fetch(`${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(r => r.json()),
            fetch(`${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(r => r.json()),
            fetch(`${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(r => r.json())
        ]);

        updateUI(currentRes, forecastRes, airRes);

    } catch (error) {
        console.error("Error capturado en la petición:", error);
        alert("Ocurrió un error inesperado. Revisa la consola.");
    }
}

function updateUI(current, forecast, air) {
    // Clima Actual
    tempValue.textContent = Math.round(current.main.temp);
    weatherDescription.textContent = current.weather[0].description;
    mainWeatherIcon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`;

    // Humedad
    const humidity = current.main.humidity;
    humidityPercent.textContent = humidity;
    if (humidityBar) humidityBar.style.width = `${humidity}%`;

    // Viento (convertir m/s a km/h)
    windVal.textContent = Math.round(current.wind.speed * 3.6);

    // Sol (Amanecer / Atardecer)
    sunriseTime.textContent = formatUnixTime(current.sys.sunrise, current.timezone);
    sunsetTime.textContent = formatUnixTime(current.sys.sunset, current.timezone);

    // Calidad del Aire
    const aqi = air.list[0].main.aqi;
    aqiValue.textContent = aqi * 20;
    updateAirQualityCard(aqi);

    // Pronóstico (Filtramos para obtener 1 registro por día, ya que la API gratis da cada 3 horas)
    renderForecast(forecast.list);
}

function formatUnixTime(unixTimestamp, timezoneOffset) {
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);
    let hours = date.getUTCHours();
    const minutes = date.getUTCTimeMinutes ? date.getUTCTimeMinutes().toString().padStart(2, '0') : date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

function updateAirQualityCard(aqi) {
    const badge = document.querySelector(".badge");
    const aqiTextHeader = document.querySelector(".aqi-text h4");
    const aqiTextSub = document.querySelector(".aqi-text p");
    const circle = document.querySelector(".aqi-circle");

    const aqiLevels = {
        1: { text: "Bueno", desc: "Bajo riesgo.", class: "badge-healthy", color: "#10b981" },
        2: { text: "Aceptable", desc: "Calidad aceptable.", class: "badge-healthy", color: "#84cc16" },
        3: { text: "Moderado", desc: "Pollución moderada.", class: "badge-warning", color: "#eab308" },
        4: { text: "Malo", desc: "Aire poco saludable.", class: "badge-danger", color: "#f97316" },
        5: { text: "Muy Malo", desc: "Alerta de salud.", class: "badge-danger", color: "#ef4444" }
    };

    const level = aqiLevels[aqi] || aqiLevels[1];

    if (badge) {
        badge.textContent = level.text;
        badge.className = `badge ${level.class}`;
    }
    if (aqiTextHeader) aqiTextHeader.textContent = level.text;
    if (aqiTextSub) aqiTextSub.textContent = level.desc;
    if (circle) circle.style.borderTopColor = level.color;
}

function renderForecast(forecastList) {
    const forecastContainer = document.getElementById("forecast-container");
    if (!forecastContainer) return;
    forecastContainer.innerHTML = "";

    // La API gratuita nos da datos cada 3 horas. Filtramos para tomar solo la de las 12:00 PM de cada día.
    const dailyData = forecastList.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('es-CL', { weekday: 'long' }).toUpperCase();
        const iconCode = day.weather[0].icon;
        const tempMax = Math.round(day.main.temp_max);
        const tempMin = Math.round(day.main.temp_min);
        const activeClass = index === 0 ? "active" : "";

        const forecastHTML = `
            <div class="forecast-item ${activeClass}">
                <span class="day-name">${dayName}</span>
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Icon" style="width: 40px; height: 40px;">
                <span class="temp-max">${tempMax}°</span>
                <span class="temp-min">${tempMin}°</span>
            </div>
        `;
        forecastContainer.insertAdjacentHTML("beforeend", forecastHTML);
    });
}

// Carga inicial
getWeatherData("Nacimiento, Cl");