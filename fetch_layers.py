import urllib.request
import json

url = "https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer?f=pjson"
try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
        
        print(f"Description: {data.get('description', 'No description')}")
        print(f"Time Info: {data.get('timeInfo', 'No time info')}")
        
        # Check if specific layers have time info
        layers = data.get('layers', [])
        for layer in layers:
            if layer['id'] in [124, 1, 123]: # Check a few key layers
                print(f"Layer {layer['name']} ({layer['id']}) Time Info: {layer.get('timeInfo', 'None')}")

except Exception as e:
    print(f"Error: {e}")
