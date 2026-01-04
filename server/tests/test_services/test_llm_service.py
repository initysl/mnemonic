import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_llmReasoning():
    print("LLM Reasoning Layer")
    
    # Test queries
    queries = [
        "How can I improve Python performance?",
        "What are the best practices for building APIs?",
        "Tell me about vector databases"
    ]
    
    for query_text in queries:
        print(f"Query: '{query_text}'")
        print("-" * 60)
        
        response = requests.post(
            f"{BASE_URL}/query/text",
            json={
                "query": query_text,
                "top_k": 5,
                "min_similarity": 0.3,
                "include_follow_ups": True
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\nAnswer (Confidence: {data['confidence']}):")
            print(data['answer'])
            
            print(f"\nRetrieved {len(data['retrieved_notes'])} notes:")
            for note in data['retrieved_notes'][:3]:
                cited = "CITED" if note['id'] in data['cited_notes'] else ""
                print(f"  - {note['title']} (score: {note['similarity_score']}) {cited}")
            
            if data.get('follow_up_questions'):
                print(f"\nFollow-up questions:")
                for q in data['follow_up_questions']:
                    print(f"  - {q}")
            
            print(f"\nExecution time: {data['execution_time_ms']:.0f}ms")
        else:
            print(f"Failed: {response.text}")
        
        print("\n" + "=" * 60 + "\n")
    
    print("LLM Reasoning Complete!")

if __name__ == "__main__":
    test_llmReasoning()