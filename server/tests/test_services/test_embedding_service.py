import requests
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_embedding():
    print("Embedding & Vector Search\n")
    
    # 1. Create sample notes
    print("1. Creating sample notes with embeddings...")
    notes = [
        {"title": "Python Tips", "content": "Use list comprehensions for better performance", "tags": ["python"]},
        {"title": "FastAPI Guide", "content": "FastAPI is great for building REST APIs quickly", "tags": ["python", "api"]},
        {"title": "Database Design", "content": "PostgreSQL with pgvector enables semantic search", "tags": ["database"]},
        {"title": "Machine Learning", "content": "Embeddings represent text as numerical vectors", "tags": ["ml", "nlp"]},
        {"title": "Cooking Recipe", "content": "Add salt and pepper to taste", "tags": ["cooking"]},
    ]
    
    note_ids = []
    for note_data in notes:
        response = requests.post(f"{BASE_URL}/notes/", json=note_data)
        if response.status_code == 201:
            note_ids.append(response.json()["id"])
            print(f"Created: {note_data['title']}")
            time.sleep(1)  # Rate limit for HF API
        else:
            print(f"Failed: {note_data['title']}")
    
    print(f"\n  Total notes created: {len(note_ids)}\n")
    
    # 2. Test semantic search
    print("2. Testing semantic search...\n")
    
    queries = [
        "How to improve Python code speed?",
        "Building web APIs",
        "Vector databases",
        "Food preparation"
    ]
    
    for query in queries:
        print(f"  Query: '{query}'")
        response = requests.post(
            f"{BASE_URL}/search/",
            json={"query": query, "top_k": 3, "min_similarity": 0.3}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Found {data['total_results']} results:")
            for result in data['results']:
                print(f"    - {result['title']} (score: {result['similarity_score']})")
        else:
            print(f"Search failed: {response.text}")
        print()
    
    print("Embedding & Vector Search Test Complete!")

if __name__ == "__main__":
    test_embedding()