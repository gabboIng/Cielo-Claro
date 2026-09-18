const API_KEY = "4c0b6f3ba89ae65e0c4da57ab93a6c15";
const BASE_URL = "https://api.openweathermap.org";

// ========== REFERENCIAS AL DOM ==========
const searchInput = document.getElementById("search-input");
const locationName = document.getElementById("location-name");
const tempValue = document.getElementById("temp-value");
const weatherDescription = document.getElementById("weather-description");
const mainWeatherIcon = document.getElementById("main-weather-icon");
const humidityPercent = document.getElementById("humidity-percent");
const humidityBar = document.getElementById("humidity-bar");
const windVal = document.getElementById("wind-val");
const windDirection = document.getElementById("wind-direction");
const sunriseTime = document.getElementById("sunrise-time");
const sunsetTime = document.getElementById("sunset-time");
const currentDateSpan = document.getElementById("current-date");
const pressureValue = document.getElementById("pressure-value");
const pressureStatus = document.getElementById("pressure-status");
const pressureDesc = document.getElementById("pressure-desc");
const aqiValue = document.getElementById("aqi-value");
const rainPercent = document.getElementById("rain-percent");
const dewPointEl = document.getElementById("dew-point");
const tomorrowDay = document.getElementById("tomorrow-day");
const tomorrowDesc = document.getElementById("tomorrow-desc");
const tomorrowTemps = document.getElementById("tomorrow-temps");
const tomorrowIcon = document.getElementById("tomorrow-icon");

// ========== FECHA ACTUAL ==========
const options = { weekday: 'long', day: 'numeric', month: 'long' };
currentDateSpan.textContent = new Date().toLocaleDateString('es-ES', options);

// ========== BUSCADOR ==========
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) getWeatherData(city);
    }
});

// ========== FUNCIÓN PRINCIPAL ==========
async function getWeatherData(city) {
    try {
        const geoUrl = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            console.error(`Error del servidor: Código ${geoResponse.status}`);
            if (geoResponse.status === 401) {
                alert("Error de autenticación. Revisa tu API Key.");
            } else {
                alert(`Error al conectar con el servidor (Código ${geoResponse.status})`);
            }
            return;
        }

        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            alert(`No pudimos encontrar la ciudad "${city}". Intenta con otra.`);
            return;
        }

        const { lat, lon, name, country } = geoData[0];
        locationName.textContent = `${name}, ${country}`;

        const [currentRes, forecastRes, airRes] = await Promise.all([
            fetch(`${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`).then(r => r.json()),
            fetch(`${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`).then(r => r.json()),
            fetch(`${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(r => r.json())
        ]);

        updateUI(currentRes, forecastRes, airRes);

    } catch (error) {
        console.error("Error capturado en la petición:", error);
        alert("Ocurrió un error inesperado. Revisa la consola.");
    }
}

// ========== ACTUALIZAR TODA LA UI ==========
function updateUI(current, forecast, air) {
    // Clima actual
    tempValue.textContent = Math.round(current.main.temp);
    weatherDescription.textContent = current.weather[0].description;
    mainWeatherIcon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`;

    // Humedad
    const humidity = current.main.humidity;
    humidityPercent.textContent = humidity;
    if (humidityBar) humidityBar.style.width = `${humidity}%`;

    // Punto de rocío (se calcula con temp y humedad)
    const dewPoint = calculateDewPoint(current.main.temp, humidity);
    if (dewPointEl) dewPointEl.textContent = `Punto de rocío: ${Math.round(dewPoint)}°`;

    // Viento (m/s → km/h) + dirección
    windVal.textContent = Math.round(current.wind.speed * 3.6);
    if (windDirection) windDirection.innerHTML = `<i class='bx bx-compass'></i> ${getWindDirection(current.wind.deg)}`;
    // Probabilidad de lluvia (del pronóstico de hoy)
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayForecast = forecast.list.filter(item => item.dt_txt.startsWith(todayStr));
    const todayRain = todayForecast.find(item => item.dt_txt.includes("12:00:00"))
        || todayForecast.reduce((max, item) => (item.pop > (max ? max.pop : 0) ? item : max), null);
    if (rainPercent && todayRain) rainPercent.textContent = `${Math.round(todayRain.pop * 100)}%`;

    // Sol
    sunriseTime.textContent = formatUnixTime(current.sys.sunrise, current.timezone);
    sunsetTime.textContent = formatUnixTime(current.sys.sunset, current.timezone);

    // Presión atmosférica
    pressureValue.textContent = current.main.pressure;
    pressureStatus.textContent = "hPa";
    pressureDesc.textContent = getPressureDescription(current.main.pressure);

    // Calidad del aire
    const aqi = air.list[0].main.aqi;
    aqiValue.textContent = aqi * 20;
    updateAirQualityCard(aqi);

    // Pronóstico 5 días
    renderForecast(forecast.list);

    // Tarjeta de mañana
    renderTomorrowCard(forecast.list);
}

// ========== FORMATEAR HORA DESDE UNIX ==========
function formatUnixTime(unixTimestamp, timezoneOffset) {
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

// ========== GRADOS A DIRECCIÓN DEL VIENTO ==========
function getWindDirection(degrees) {
    const directions = [
            "Norte", 
            "Norte-Noreste", 
            "Noreste", 
            "Este-Noreste", 
            "Este", 
            "Este-Sureste", 
            "Sureste", 
            "Sur-Sureste",
            "Sur", 
            "Sur-Suroeste", 
            "Suroeste", 
            "Oeste-Suroeste", 
            "Oeste", 
            "Oeste-Noroeste", 
            "Noroeste", 
            "Norte-Noroeste"
        ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// ========== CALCULAR PUNTO DE ROCÍO ==========
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
}

// ========== DESCRIPCIÓN DE LA PRESIÓN ==========
function getPressureDescription(pressure) {
    if (pressure < 1000) return "Baja presión (posible mal tiempo)";
    if (pressure >= 1000 && pressure <= 1020) return "Presión normal";
    return "Alta presión (posible buen tiempo)";
}

// ========== TARJETA CALIDAD DEL AIRE ==========
function updateAirQualityCard(aqi) {
    const badge = document.getElementById("aqi-badge");
    const aqiTextHeader = document.getElementById("aqi-text-title");
    const aqiTextSub = document.getElementById("aqi-text-desc");
    const circle = document.querySelector(".aqi-circle");

    const aqiLevels = {
        1: { text: "Bueno", desc: "Bajo riesgo para la salud.", class: "badge-healthy", color: "#10b981" },
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

// ========== PRONÓSTICO 5 DÍAS ==========
function renderForecast(forecastList) {
    const forecastContainer = document.getElementById("forecast-container");
    if (!forecastContainer) return;
    forecastContainer.innerHTML = "";

    const dailyData = forecastList.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('es-CL', { weekday: 'short' }).toUpperCase();
        const iconCode = day.weather[0].icon;
        const tempMax = Math.round(day.main.temp_max);
        const tempMin = Math.round(day.main.temp_min);
        const activeClass = index === 0 ? "active" : "";

        const forecastHTML = `
            <div class="forecast-item ${activeClass}">
                <span class="day-name">${dayName}</span>
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Icon" style="width: 65px; height: 65px;">
                <span class="temp-max">${tempMax}°</span>
                <span class="temp-min">${tempMin}°</span>
            </div>
        `;
        forecastContainer.insertAdjacentHTML("beforeend", forecastHTML);
    });
}

// ========== TARJETA DE MAÑANA ==========
function renderTomorrowCard(forecastList) {
    if (!tomorrowDay || !tomorrowDesc || !tomorrowTemps || !tomorrowIcon) return;

    const tomorrow = forecastList.find(item => item.dt_txt.includes("12:00:00"));

    if (!tomorrow) return;

    const date = new Date(tomorrow.dt * 1000);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const iconCode = tomorrow.weather[0].icon;
    const tempMax = Math.round(tomorrow.main.temp_max);
    const tempMin = Math.round(tomorrow.main.temp_min);

    tomorrowDay.textContent = dayName;
    tomorrowDesc.textContent = tomorrow.weather[0].description;
    tomorrowTemps.textContent = `${tempMax}° / ${tempMin}°`;
    tomorrowIcon.src = `https://openweathermap.org/img/wn/${iconCode}.png`;
}

// ========== CARGA INICIAL ==========
getWeatherData("Nacimiento, Cl");
