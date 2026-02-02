// Configuration for Hybrid Weather Data
// Map Layer Source: NOAA MapServer (Reliable 1-3 days)

const CONFIG = {
    // Original MapServer used for Days 1-3 (Proven reliable)
    // https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer
    mapServiceUrl: 'https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer',

    // Layer IDs from MapServer investigation
    layers: {
        high: {
            1: 124, // Day 1 Max
            2: 128, // Day 2 Max
            3: 132  // Day 3 Max
        },
        low: {
            1: 137, // Day 1 Min
            2: 141, // Day 2 Min
            3: null // Not available
        }
    },
    // Data availability for MAP LAYER ONLY
    mapAvailability: {
        high: [1, 2, 3],
        low: [1, 2]
    }
};

// State
let state = {
    type: 'high', // 'high' or 'low'
    day: 1        // 1-7
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

// Current Active NOAA Layer
let currentLayer = null;

// Function to update the map layer
function updateLayer() {
    // Remove existing layer
    if (currentLayer) {
        map.removeLayer(currentLayer);
        currentLayer = null;
    }

    // Determine if map data is available for this specific Day + Type
    const layerId = CONFIG.layers[state.type][state.day];

    if (layerId) {
        console.log(`Loading MapServer Layer ID: ${layerId} for Day ${state.day} ${state.type}`);

        // Use Esri Leaflet for MapServer
        currentLayer = L.esri.dynamicMapLayer({
            url: CONFIG.mapServiceUrl,
            layers: [layerId],
            opacity: 0.6,
            useCors: false
        }).addTo(map);

        // Hide "No Data" message
        document.getElementById('no-data-message').style.display = 'none';

    } else {
        console.log(`No Map Layer available for Day ${state.day} ${state.type}`);

        // Show "No Data" overlay
        const noDataMsg = document.getElementById('no-data-message');
        if (noDataMsg) {
            noDataMsg.querySelector('h3').textContent = 'Map Unavailable';
            noDataMsg.querySelector('p').textContent = 'Regional heatmap is only available for Days 1-3. City forecasts are removed per request.';
            noDataMsg.style.display = 'flex';
        }
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
        btn.classList.remove('active', 'disabled');
        const day = parseInt(btn.dataset.day);

        // Highlight active day
        if (day === state.day) {
            btn.classList.add('active');
        }
    });
}

// Event Listeners
document.getElementById('btn-high').addEventListener('click', () => {
    state.type = 'high';
    updateLayer();
});

document.getElementById('btn-low').addEventListener('click', () => {
    state.type = 'low';
    updateLayer();
});

document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const day = parseInt(btn.dataset.day);
        state.day = day;
        updateLayer();
        updateDateDisplay(); // Update visual active state
    });
});

// Update forecast dates on buttons
function updateForecastDates() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const today = new Date();

    document.querySelectorAll('.day-btn').forEach(btn => {
        const dayOffset = parseInt(btn.dataset.day) - 1;
        const date = new Date(today);
        date.setDate(today.getDate() + dayOffset);

        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const dayNum = date.getDate();

        const label = btn.querySelector('.day-label');
        if (label) label.textContent = `${monthName} ${dayNum}`;

        const sub = btn.querySelector('.day-sub');
        if (sub) {
            if (dayOffset === 0) sub.textContent = 'Today';
            else if (dayOffset === 1) sub.textContent = 'Tomorrow';
            else sub.textContent = dayName;
        }
    });
}

function updateDateDisplay() {
    // Just refresh classes
    updateUI();
}

// Initial Load
updateForecastDates();
updateLayer();
