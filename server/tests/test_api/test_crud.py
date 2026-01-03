import requests

BASE_URL = "http://localhost:8000"

def test_crud():
    # 1. Test server is running
    print("0. Testing server connectivity...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✓ Server: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Server not reachable: {e}")
        return
    
    # 2. Create note with error handling
    print("\n1. Creating note...")
    create_data = {
        "title": "Python Tips",
        "content": "List comprehensions are faster than loops",
        "tags": ["python", "performance"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/notes/", json=create_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text[:200]}")  # Show raw response
        
        if response.status_code == 201:
            note = response.json()
            note_id = note["id"]
            print(f"✓ Created: {note_id}")
        else:
            print(f"❌ Failed to create note")
            print(f"Response: {response.text}")
            return
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        return
    
    # 3. Get note
    print("\n2. Getting note...")
    response = requests.get(f"{BASE_URL}/notes/{note_id}")
    if response.status_code == 200:
        print(f"✓ Retrieved: {response.json()['title']}")
    else:
        print(f"❌ Failed: {response.text}")
    
    # 4. List notes
    print("\n3. Listing notes...")
    response = requests.get(f"{BASE_URL}/notes/")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Total notes: {data['total']}")
    else:
        print(f"❌ Failed: {response.text}")

if __name__ == "__main__":
    test_crud()