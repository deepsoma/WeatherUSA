import urllib.request
import json
import time
import os

# From app.js
CITIES = [
    { "name": 'Montgomery', "lat": 32.3792, "lng": -86.3077 },
    { "name": 'Juneau', "lat": 58.3019, "lng": -134.4197 },
    { "name": 'Phoenix', "lat": 33.4484, "lng": -112.0740 },
    { "name": 'Little Rock', "lat": 34.7465, "lng": -92.2896 },
    { "name": 'Sacramento', "lat": 38.5816, "lng": -121.4944 },
    { "name": 'Denver', "lat": 39.7392, "lng": -104.9903 },
    { "name": 'Hartford', "lat": 41.7658, "lng": -72.6734 },
    { "name": 'Dover', "lat": 39.1582, "lng": -75.5244 },
    { "name": 'Tallahassee', "lat": 30.4383, "lng": -84.2807 },
    { "name": 'Atlanta', "lat": 33.7490, "lng": -84.3880 },
    { "name": 'Honolulu', "lat": 21.3069, "lng": -157.8583 },
    { "name": 'Boise', "lat": 43.6150, "lng": -116.2023 },
    { "name": 'Springfield', "lat": 39.7817, "lng": -89.6501 },
    { "name": 'Indianapolis', "lat": 39.7684, "lng": -86.1581 },
    { "name": 'Des Moines', "lat": 41.6195, "lng": -93.5911 },
    { "name": 'Topeka', "lat": 39.0473, "lng": -95.6752 },
    { "name": 'Frankfort', "lat": 38.2009, "lng": -84.8733 },
    { "name": 'Baton Rouge', "lat": 30.4515, "lng": -91.1871 },
    { "name": 'Augusta', "lat": 44.3106, "lng": -69.7795 },
    { "name": 'Annapolis', "lat": 38.9784, "lng": -76.4922 },
    { "name": 'Boston', "lat": 42.3601, "lng": -71.0589 },
    { "name": 'Lansing', "lat": 42.7325, "lng": -84.5555 },
    { "name": 'St. Paul', "lat": 44.9537, "lng": -93.0900 },
    { "name": 'Jackson', "lat": 32.2988, "lng": -90.1848 },
    { "name": 'Jefferson City', "lat": 38.5767, "lng": -92.1735 },
    { "name": 'Helena', "lat": 46.5891, "lng": -112.0391 },
    { "name": 'Lincoln', "lat": 40.8136, "lng": -96.7026 },
    { "name": 'Carson City', "lat": 39.1638, "lng": -119.7674 },
    { "name": 'Concord', "lat": 43.2081, "lng": -71.5375 },
    { "name": 'Trenton', "lat": 40.2206, "lng": -74.7597 },
    { "name": 'Santa Fe', "lat": 35.6870, "lng": -105.9378 },
    { "name": 'Albany', "lat": 42.6526, "lng": -73.7562 },
    { "name": 'Raleigh', "lat": 35.7796, "lng": -78.6382 },
    { "name": 'Bismarck', "lat": 46.8083, "lng": -100.7837 },
    { "name": 'Columbus', "lat": 39.9612, "lng": -82.9988 },
    { "name": 'Oklahoma City', "lat": 35.4676, "lng": -97.5164 },
    { "name": 'Salem', "lat": 44.9429, "lng": -123.0351 },
    { "name": 'Harrisburg', "lat": 40.2732, "lng": -76.8867 },
    { "name": 'Providence', "lat": 41.8240, "lng": -71.4128 },
    { "name": 'Columbia', "lat": 34.0007, "lng": -81.0348 },
    { "name": 'Pierre', "lat": 44.3683, "lng": -100.3510 },
    { "name": 'Nashville', "lat": 36.1627, "lng": -86.7816 },
    { "name": 'Austin', "lat": 30.2672, "lng": -97.7431 },
    { "name": 'Salt Lake City', "lat": 40.7608, "lng": -111.8910 },
    { "name": 'Montpelier', "lat": 44.2601, "lng": -72.5754 },
    { "name": 'Richmond', "lat": 37.5407, "lng": -77.4360 },
    { "name": 'Olympia', "lat": 47.0379, "lng": -122.9007 },
    { "name": 'Charleston', "lat": 38.3498, "lng": -81.6326 },
    { "name": 'Madison', "lat": 43.0731, "lng": -89.4012 },
    { "name": 'Cheyenne', "lat": 41.1400, "lng": -104.8202 }
]

def fetch_grid_data():
    results = []
    
    print(f"Fetching grid data for {len(CITIES)} cities using urllib...")
    
    for i, city in enumerate(CITIES):
        try:
            url = f"https://api.weather.gov/points/{city['lat']},{city['lng']}"
            req = urllib.request.Request(url)
            req.add_header('User-Agent', '(myweatherapp.com, contact@example.com)')
            
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                props = data.get('properties', {})
                
                city_data = city.copy()
                city_data['gridId'] = props.get('gridId')
                city_data['gridX'] = props.get('gridX')
                city_data['gridY'] = props.get('gridY')
                
                results.append(city_data)
                print(f"[{i+1}/{len(CITIES)}] Success: {city['name']} -> {city_data['gridId']}/{city_data['gridX']},{city_data['gridY']}")
                
        except Exception as e:
            print(f"[{i+1}/{len(CITIES)}] Error: {city['name']} ({str(e)})")
            results.append(city)
            
        # Be nice to the API
        time.sleep(0.2)

    # Save to file
    with open('nws_cities.json', 'w') as f:
        json.dump(results, f, indent=4)
        
    print(f"\nSaved {len(results)} cities to nws_cities.json")

if __name__ == "__main__":
    fetch_grid_data()
