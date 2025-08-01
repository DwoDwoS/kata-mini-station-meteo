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
        await fetchHistoricalData(coords.lat, coords.lon);
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
            let timeIndex = data.hourly.time.indexOf(currentTime);
            if (timeIndex === -1) {
                timeIndex = data.hourly.time.length - 1;
            }
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

async function fetchHistoricalData(lat, lon) {
    const URL3 = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&past_days=3&timezone=auto`;

    try {
        const response = await fetch(URL3);
        const data = await response.json();

        if (!data.hourly || !data.hourly.time) {
            console.warn("Pas de données historiques trouvées.");
            return;
        }

        const times = data.hourly.time;
        const temperatures = data.hourly.temperature_2m;
        const precipitations = data.hourly.precipitation;
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const filteredTimes = [];
        const filteredTemperatures = [];
        const filteredPrecipitations = [];

        for (let i = 0; i < times.length; i++) {
            const timeDate = new Date(times[i]);
            if (timeDate >= threeDaysAgo && timeDate <= now) {
                filteredTimes.push(times[i]);
                filteredTemperatures.push(temperatures[i]);
                filteredPrecipitations.push(precipitations[i]);
            }
        }

        drawChart(filteredTimes, filteredTemperatures, filteredPrecipitations);

    } catch (error) {
        console.error("Erreur lors de la récupération des données historiques :", error);
    }
}

let chartInstance = null;

function drawChart(times, temperatures, precipitations) {

    const labels = times;
    const tempData = temperatures;
    const precData = precipitations;

    const ctx = document.getElementById('weatherChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Température (°C)',
                    data: tempData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    yAxisID: 'y1',
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Précipitation (mm)',
                    data: precData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    yAxisID: 'y2',
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                y1: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Température (°C)'
                    }
                },
                y2: {
                    type: 'linear',
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Précipitation (mm)'
                    }
                },
                x: {
                    ticks: {
                        maxTicksLimit: 12,
                        callback: (_, index) => {
                            const label = labels[index];
                            return label ? label.slice(5, 16).replace("T", " ") : '';
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Températures et Précipitations des trois derniers jours',
                    font: {
                        size: 18
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    },
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}