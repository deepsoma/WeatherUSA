// Configuration for NOAA NDFD Layers
// Source: https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer
const CONFIG = {
    mapServiceUrl: 'https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer',
    layers: {
        high: {
            1: 124, // MaxTemp_Day1
            2: 128, // MaxTemp_Day2
            3: 132  // MaxTemp_Day3
        },
        low: {
            1: 137, // MinTemp_Day1
            2: 141, // MinTemp_Day2
            3: null // Day 3 MinTemp not available in this service
        }
    }
};

// State
let state = {
    type: 'high', // 'high' or 'low'
    day: 1        // 1, 2, 3
};

// Initialize Map
const map = L.map('map', {
    center: [39.8283, -98.5795], // Center of USA
    zoom: 4,
    zoomControl: false,
    attributionControl: true
});

// Add Dark Matter Basemap (CartoDB) for vibrant contrast
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Move zoom control to top-right
L.control.zoom({
    position: 'topright'
}).addTo(map);

// Current Active Layer
let currentLayer = null;

// Function to update the map layer
function updateLayer() {
    // Remove existing layer
    if (currentLayer) {
        map.removeLayer(currentLayer);
        currentLayer = null;
    }

    // Get Layer ID
    const layerId = CONFIG.layers[state.type][state.day];

    if (layerId) {
        // Create new dynamic map layer
        currentLayer = L.esri.dynamicMapLayer({
            url: CONFIG.mapServiceUrl,
            layers: [layerId],
            opacity: 0.75,
            useCors: false, // NOAA servers sometimes have strict CORS
            f: 'image'
        }).addTo(map);

        console.log(`Loaded Layer: ${state.type.toUpperCase()} Day ${state.day} (ID: ${layerId})`);
    } else {
        console.warn(`No layer available for ${state.type} Day ${state.day}`);
        // Optional: Show a toast or alert to the user
    }

    updateUI();
}

// Function to update UI state
function updateUI() {
    // Update Type Buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === `btn-${state.type}`) {
            btn.classList.add('active');
        }
    });

    // Update Day Buttons
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.remove('active');
        const day = parseInt(btn.dataset.day);

        if (day === state.day) {
            btn.classList.add('active');
        }
    });
}

// Cities Configuration
const CITIES = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', lat: 29.7604, lng: -95.3698 },
    { name: 'Miami', lat: 25.7617, lng: -80.1918 },
    { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
    { name: 'Denver', lat: 39.7392, lng: -104.9903 },
    { name: 'Atlanta', lat: 33.7490, lng: -84.3880 }
];

// Store city markers
let cityMarkers = [];

// Function to fetch and display city temperatures
async function updateCityTemperatures() {
    // Clear existing markers
    cityMarkers.forEach(marker => map.removeLayer(marker));
    cityMarkers = [];

    const layerId = CONFIG.layers[state.type][state.day];
    if (!layerId) return;

    // Fetch temp for each city
    for (const city of CITIES) {
        try {
            const temp = await fetchTemperature(city.lat, city.lng, layerId);
            if (temp !== null) {
                const marker = L.marker([city.lat, city.lng], {
                    icon: L.divIcon({
                        className: 'city-marker',
                        html: `
                            <div class="marker-content">
                                <span class="city-temp">${Math.round(temp)}°</span>
                                <span class="city-name">${city.name}</span>
                            </div>
                        `,
                        iconSize: [60, 40],
                        iconAnchor: [30, 20]
                    })
                }).addTo(map);
                cityMarkers.push(marker);
            }
        } catch (error) {
            console.error(`Failed to fetch temp for ${city.name}:`, error);
        }
    }
}

// Helper to fetch temperature from NOAA Identify endpoint
async function fetchTemperature(lat, lng, layerId) {
    const params = new URLSearchParams({
        f: 'json',
        geometry: `${lng},${lat}`,
        geometryType: 'esriGeometryPoint',
        sr: '4326',
        layers: `all:${layerId}`, // Query specific layer
        tolerance: '2',
        mapExtent: '-125,24,-66,50', // Approx CONUS extent
        imageDisplay: '800,600,96',
        returnGeometry: 'false'
    });

    const url = `${CONFIG.mapServiceUrl}/identify?${params.toString()}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Look for the "Service Pixel Value" or "Pixel Value" in attributes
            // The API returns different attribute names sometimes
            const attributes = data.results[0].attributes;
            const pixelValue = attributes['Service Pixel Value'] || attributes['Pixel Value'];

            if (pixelValue && pixelValue !== 'NoData') {
                return parseFloat(pixelValue);
            }
        }
        return null;
    } catch (e) {
        console.error("Error fetching temp:", e);
        return null;
    }
}

// Event Listeners
document.getElementById('btn-high').addEventListener('click', () => {
    state.type = 'high';
    updateLayer();
    updateCityTemperatures();
});

document.getElementById('btn-low').addEventListener('click', () => {
    state.type = 'low';
    // If switching to Low and currently on Day 3 (which is unavailable), switch to Day 1
    if (state.day === 3) {
        state.day = 1;
    }
    updateLayer();
    updateCityTemperatures();
});

document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const day = parseInt(btn.dataset.day);

        // Prevent clicking disabled days (4-7)
        if (day > 3) return;

        // Prevent clicking unavailable days (e.g. Low Day 3)
        if (state.type === 'low' && day === 3) return;

        state.day = day;
        updateLayer();
        updateCityTemperatures();
    });
});

// Initial Load
// Initial Load
updateLayer();
updateCityTemperatures();
