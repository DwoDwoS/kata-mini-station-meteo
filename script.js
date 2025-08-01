document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("cityInput");
    const button = document.querySelector("button");
    const gpsDiv = document.getElementById("gps");
    const cityName = document.getElementById("city");
    const temperatureDiv = document.getElementById("temperature");
    const details = document.getElementById("details");

    button.addEventListener("click", async () => {
        const city = cityInput.value.trim();
        if (!city) {
            gpsDiv.textContent = "Veuillez entrer une ville.";
            return;
    }

    cityName.textContent = `Recherche pour ${city}...`;
    gpsDiv.textContent = "";
    temperatureDiv.textContent = "-°C";
    details.textContent = "Chargement des données météo...";

    try {
        const coords = await fetchCoordinates(city);
        if(!coords) return;

        await fetchWeather(coords.lat, coords.lon);
    }catch (error) {
        console.error("Erreur globale :", error);
        details.textContent = "Erreur lors du chargement des données.";
    }
});

async function fetchCoordinates(city) {
    const URL = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&addressdetails=1&limit=1`;

    try {
    
        const response = await fetch(URL);
        const data = await response.json();

        if(data.length === 0) {
            gpsDiv.textContent = "Ville non trouvée.";
            cityName.textContent = "Ville non trouvée";
            return null;
        } 
        const {lat, lon, name} = data[0];

        cityName.textContent = name;
        gpsDiv.textContent = `Latitude : ${lat}, Longitude : ${lon}`;
        return {lat, lon};
    } catch (error){
        console.error("Erreur lors de la récupération des coordonnées:", error);
        gpsDiv.textContent = "Erreur lors de la récupération des données.";
        cityName.textContent = "Erreur de chargement";
        return null;
    }
}

 async function fetchWeather(lat, lon) {
    const URL2 = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,precipitation&timezone=auto`;

        try {
            const response = await fetch(URL2);
            const data = await response.json();

            if (!data || !data.current_weather) {
                temperatureDiv.textContent = "-°C";
                details.textContent = "Données météo indisponibles.";
                return;
            }
            const temperature = data.current_weather.temperature;
            const currentTime = data.current_weather.time;
            const timeIndex = data.hourly.time.indexOf(currentTime);
            const humidity = data.hourly.relative_humidity_2m[timeIndex];
            const precipitation = data.hourly.precipitation[timeIndex];
            
            temperatureDiv.textContent = `${temperature}°C`;
            details.textContent = `Humidité : ${humidity}% · Précipitation : ${precipitation} mm`;

        } catch (error) {
            console.error("Erreur lors de la récupération de la météo :", error);
            temperatureDiv.textContent = "-°C";
            details.textContent = "Erreur lors de la récupération des données météo.";
        }
    }
});