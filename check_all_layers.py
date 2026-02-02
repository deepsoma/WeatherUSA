import urllib.request
import json

# Base URL for the NDFD Temperature MapServer
BASE_URL = "https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer"

def get_all_layers():
    """Fetches and displays all available layers."""
    meta_url = f"{BASE_URL}?f=pjson"
    print(f"Fetching metadata from: {meta_url}...\n")
    
    try:
        with urllib.request.urlopen(meta_url) as response:
            data = json.loads(response.read().decode())
            
            layers = data.get('layers', [])
            
            print(f"Total layers found: {len(layers)}\n")
            print("="*70)
            
            # Categorize layers
            max_temp_layers = []
            min_temp_layers = []
            other_layers = []
            
            for layer in layers:
                name = layer['name']
                layer_id = layer['id']
                
                if "MaxTemp" in name:
                    max_temp_layers.append((name, layer_id))
                elif "MinTemp" in name:
                    min_temp_layers.append((name, layer_id))
                else:
                    other_layers.append((name, layer_id))
            
            print("\n📈 MAX TEMPERATURE LAYERS:")
            print("-" * 70)
            for name, lid in sorted(max_temp_layers):
                print(f"  {name:<40} ID: {lid}")
            
            print("\n📉 MIN TEMPERATURE LAYERS:")
            print("-" * 70)
            for name, lid in sorted(min_temp_layers):
                print(f"  {name:<40} ID: {lid}")
            
            if other_layers:
                print("\n📊 OTHER LAYERS:")
                print("-" * 70)
                for name, lid in sorted(other_layers):
                    print(f"  {name:<40} ID: {lid}")
            
            print("\n" + "="*70)

    except Exception as e:
        print(f"Error fetching metadata: {e}")

if __name__ == "__main__":
    get_all_layers()
