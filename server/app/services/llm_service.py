import os
from groq import Groq
from typing import List, Dict, Any
from tenacity import retry, wait_exponential, stop_after_attempt


class LLMService:
    """Generate intelligent responses using llama"""
    
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set in environment")
        
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.1-8b-instant"  
    
    @retry(wait=wait_exponential(min=1, max=10), stop=stop_after_attempt(3))
    def reason_over_notes(
        self,
        query: str,
        retrieved_notes: List[Dict[str, Any]],
        max_tokens: int = 500
    ) -> Dict[str, Any]:
        """
        Generate synthesized answer from retrieved notes
        Args:
            query: User's original question
            retrieved_notes: List of note dicts with title, content, similarity
            max_tokens: Maximum response length
        Returns:
            Dict with 'answer' and 'cited_notes' (list of note IDs used)
        """
        if not retrieved_notes:
            return {
                "answer": "I couldn't find any relevant notes to answer your question. Try adding more notes or rephrasing your query.",
                "cited_notes": []
            }
        
        # Format context from retrieved notes
        context_parts = []
        for i, note in enumerate(retrieved_notes, 1):
            context_parts.append(
                f"Note {i} (Similarity: {note['similarity_score']}):\n"
                f"Title: {note['title']}\n"
                f"Content: {note['content']}\n"
                f"Tags: {', '.join(note['tags'])}"
            )
        
        context = "\n\n".join(context_parts)
        
        # Prompt
        prompt = f"""You are a helpful assistant that synthesizes information from personal notes.

            Retrieved Notes:
            {context}

            User Question: {query}

            Instructions:
            1. Answer the question using ONLY information from the notes above
            2. Cite specific notes by their TITLE when making claims (e.g., "According to 'Python Tips'..." or "'Database Design' mentions...")
            3. If notes don't fully answer the question, acknowledge limitations
            4. Keep the answer concise and well-organized
            5. Do not mention internal IDs or system metadata
            6. Use a friendly, conversational tone

            Answer:"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a personal knowledge assistant that helps users understand their own notes."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.4,
                max_tokens=max_tokens,
                top_p=0.2
            )
            
            answer = response.choices[0].message.content.strip() if response.choices[0].message.content else "Sorry, I couldn't generate a response."
            
            # Extract cited note IDs (simple heuristic: look for "Note X" patterns)
            cited_notes = []
            for i, note in enumerate(retrieved_notes, 1):
                if f"Note {i}" in answer:
                    cited_notes.append(str(note['id']))
            
            return {
                "answer": answer,
                "cited_notes": cited_notes
            }
        
        except Exception as e:
            raise Exception(f"LLM reasoning failed: {str(e)}")
    
    # def generate_follow_up_questions(
    #     self,
    #     query: str,
    #     answer: str,
    #     retrieved_notes: List[Dict[str, Any]]
    # ) -> List[str]:
    #     """
    #     Generate relevant follow-up questions based on the conversation
    #     Args:
    #         query: Original query
    #         answer: Generated answer
    #         retrieved_notes: Notes used
    #     Returns:
    #         List of 3 follow-up questions
    #     """
    #     note_titles = [note['title'] for note in retrieved_notes[:3]]
        
    #     prompt = f"""Based on this Q&A exchange, suggest 3 relevant follow-up questions the user might ask.

    #         Question: {query}
    #         Answer: {answer}
    #         Related Notes: {', '.join(note_titles)}

    #         Generate exactly 3 brief, specific follow-up questions (one per line, no numbering):"""

    #     try:
    #         response = self.client.chat.completions.create(
    #             model=self.model,
    #             messages=[{"role": "user", "content": prompt}],
    #             temperature=0.8,
    #             max_tokens=150
    #         )
            
    #         questions = response.choices[0].message.content.strip().split('\n') if response.choices[0].message.content else "Sorry, I couldn't generate a response."
    #         # Clean up and return first 3
    #         return [q.strip('- ').strip() for q in questions if q.strip()][:3]
        
    #     except Exception:
            return []  # Fail gracefully


# Singleton instance
llm_service = LLMService()
