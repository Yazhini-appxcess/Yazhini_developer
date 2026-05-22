import requests
import json

try:
    response = requests.get("http://localhost:8000/api/settings")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
        
        print("\n--- Verification ---")
        print(f"show_iot_hub: {data.get('show_iot_hub')}")
        print(f"show_microsoft_hub: {data.get('show_microsoft_hub')}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
