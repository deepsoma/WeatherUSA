import urllib.request
import urllib.parse
import json
import os

# Base URL for the NDFD Temperature MapServer
BASE_URL = "https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer"

def get_layer_ids():
    """Fetches metadata to find the current IDs for 7-day forecast layers."""
    meta_url = f"{BASE_URL}?f=pjson"
    print(f"Fetching metadata from: {meta_url}...")
    
    try:
        with urllib.request.urlopen(meta_url) as response:
            data = json.loads(response.read().decode())
            
            layers = data.get('layers', [])
            forecast_layers = {}

            # Loop through layers to find MaxTemp_Day1 through MaxTemp_Day7
            print("\n--- Identifying 7-Day Forecast Layers ---")
            for layer in layers:
                name = layer['name']
                # Search for specific 7-day max temp layers
                if "MaxTemp_Day" in name:
                    # Extract the day number (e.g., "MaxTemp_Day1" -> "Day 1")
                    day_num = name.replace("MaxTemp_Day", "")
                    forecast_layers[f"Day {day_num}"] = layer['id']
                    print(f"Found: {name} -> ID {layer['id']}")

            return forecast_layers

    except Exception as e:
        print(f"Error fetching metadata: {e}")
        return {}

def fetch_forecast_image(day_name, layer_id):
    """Fetches the actual map image for a specific forecast day."""
    
    # Define the bounding box (Contiguous US approx)
    bbox = "-125.0,24.0,-66.0,50.0"
    
    # Construct the query parameters for the 'export' endpoint
    # This is the URL structure you would use in your web map
    params = {
        "layers": f"show:{layer_id}",  # Show specific layer
        "bbox": bbox,
        "bboxSR": 4326,                # Coordinate system (Lat/Lon)
        "size": "800,600",             # Image size
        "format": "png",               # Image format
        "transparent": "true",
        "f": "image"                   # Return binary image data
    }
    
    query_string = urllib.parse.urlencode(params)
    image_url = f"{BASE_URL}/export?{query_string}"
    
    print(f"\n--- Fetching Data for {day_name} ---")
    print(f"Generated URL: {image_url}")
    
    try:
        output_filename = f"forecast_{day_name.lower().replace(' ', '')}.png"
        with urllib.request.urlopen(image_url) as response:
            with open(output_filename, 'wb') as out_file:
                out_file.write(response.read())
        print(f"Success! Saved map image to: {os.path.abspath(output_filename)}")
        
    except Exception as e:
        print(f"Error downloading image: {e}")

# --- Main Execution ---
if __name__ == "__main__":
    # 1. Get the dynamic IDs for Days 1-7
    daily_layers = get_layer_ids()
    
    if daily_layers:
        # 2. Example: Fetch the forecast for Day 7 specifically
        if "Day 7" in daily_layers:
            fetch_forecast_image("Day 7", daily_layers["Day 7"])
        else:
            print("Day 7 layer not found in metadata.")
            
        # 3. Print the WMS URLs for your web frontend (e.g., Leaflet)
        print("\n--- Frontend Configuration (Use these IDs in Leaflet/OpenLayers) ---")
        for day, lid in daily_layers.items():
            print(f"{day} Max Temp Layer ID: {lid}")