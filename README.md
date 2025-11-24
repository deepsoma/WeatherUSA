# Vibe Weather Map

A vibrant, modern weather map application that visualizes NOAA NDFD temperature forecasts (Highs and Lows) for the next few days.

## Features
- **Interactive Map**: Built with Leaflet and Esri Leaflet.
- **Vibrant UI**: Glassmorphism design with neon accents.
- **Forecast Layers**: Toggle between High (Max) and Low (Min) temperatures.
- **City Temperatures**: Real-time temperature markers for major US cities.

## How to Run

### Option 1: Open Directly (Simplest)
Simply double-click the `index.html` file to open it in your default web browser.
*Note: Some features might be restricted by browser security policies when opening files directly.*

### Option 2: Local Server (Recommended)
For the best experience, run the app using a local development server.

**Using Python:**
If you have Python installed, run this command in the project directory:
```bash
python3 -m http.server
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

**Using VS Code:**
If you are using VS Code, you can install the "Live Server" extension and click "Go Live" at the bottom right.

**Using Node.js:**
```bash
npx serve .
```

## Dependencies
This project uses the following libraries via CDN (no installation required):
- [Leaflet.js](https://leafletjs.com/)
- [Esri Leaflet](https://developers.arcgis.com/esri-leaflet/)
- [Google Fonts](https://fonts.google.com/) (Outfit)
