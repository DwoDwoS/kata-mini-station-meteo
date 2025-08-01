document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("cityInput");
    const button = document.querySelector("button");
    const gpsDiv = document.getElementById("gps");
    const cityName = document.getElementById("city");

    button.addEventListener("click", async () => {
        const city = cityInput.value.trim();
        if (!city) {
            gpsDiv.textContent = "Veuillez entrer une ville.";
            return;
    }

    cityName.textContent = `Recherche pour ${city}...`;

    const URL = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&addressdetails=1&limit=1`;

    try {
    
        const response = await fetch(URL);

        const data = await response.json();

        if(data.length === 0) {
            gpsDiv.textContent = "Ville non trouvée.";
            cityName.textContent = "Ville non trouvée";
            return;
        } 
        const {lat, lon, name} = data[0];

        cityName.textContent = name;
        gpsDiv.textContent = `Latitude : ${lat}, Longitude : ${lon}`;
    } catch (error){
        console.error("Erreur lors de la récupération des coordonnées:", error);
        gpsDiv.textContent = "Erreur lors de la récupération des données.";
        cityName.textContent = "Erreur de chargement";
    }
    });
});