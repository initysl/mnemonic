import requests
import os
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_voice():
    print("Voice Input with Groq Whisper\n")
    
    # Create an audio file for testing
    audio_file_path = "test_audio.wav" 
    
    if not os.path.exists(audio_file_path):
        print("No test audio file found at 'test_audio.wav'")
        print("Record a short voice memo asking about Python or APIs")
        print("Or use: https://ttsmp3.com/ to generate test audio\n")
        
        # Test with curl command instead
        print("Test manually with:")
        print(f'curl -X POST "{BASE_URL}/voice/transcribe" \\')
        print('  -H "Content-Type: multipart/form-data" \\')
        print('  -F "audio=@your_audio_file.wav"')
        return
    
    print("1. Testing transcription only...")
    with open(audio_file_path, "rb") as audio:
        files = {"audio": ("test_audio.wav", audio, "audio/wav")}
        response = requests.post(f"{BASE_URL}/voice/transcribe", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"Transcribed: '{data['transcribed_text']}'")
        else:
            print(f"Failed: {response.text}")
            return
    
    print("\n2. Testing complete voice query pipeline...")
    time.sleep(1)
    
    with open(audio_file_path, "rb") as audio:
        files = {"audio": ("test_audio.wav", audio, "audio/wav")}
        params = {"top_k": 3, "min_similarity": 0.3}
        response = requests.post(
            f"{BASE_URL}/voice/query",
            files=files,
            params=params
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Query: '{data['transcribed_text']}'")
            print(f"  Found {data['total_results']} results:")
            for result in data['results']:
                print(f"    - {result['title']} (score: {result['similarity_score']})")
        else:
            print(f"Failed: {response.text}")
    
    print("\nVoice Input Test Complete!")

if __name__ == "__main__":
    test_voice()