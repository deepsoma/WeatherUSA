import urllib.request
import json

url = "https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer/8?f=pjson"
try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
        print(f"Name: {data.get('name')}")
        print(f"Time Info: {data.get('timeInfo')}")
            
except Exception as e:
    print(f"Error: {e}")
