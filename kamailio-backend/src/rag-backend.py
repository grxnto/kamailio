from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import requests
import json

app = FastAPI()

# Enable CORS so your React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],  # Your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
embedding_model = None
print("🚀 Starting up backend...")

@app.on_event("startup")
async def startup_event():
    global embedding_model
    print("📦 Loading embedding model (this takes a moment)...")
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Embedding model loaded!")
    print("✅ Backend ready!")

# Data models for API
class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str

class QARequest(BaseModel):
    question: str
    transcript: str
    segments: List[TranscriptSegment]

class QAResponse(BaseModel):
    answer: str
    relevant_segments: Optional[List[dict]] = None

class RAGSystem:
    def __init__(self):
        self.index = None
        self.segments = []
        self.embeddings = []
    
    def build_index(self, segments: List[TranscriptSegment]):
        """Convert transcript segments into searchable vectors"""
        print(f"📊 Building index for {len(segments)} segments...")
        self.segments = segments
        
        # Convert each segment text into a vector embedding
        texts = [seg.text for seg in segments]
        self.embeddings = embedding_model.encode(texts)
        
        # Build FAISS index for fast similarity search
        dimension = self.embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(self.embeddings.astype('float32'))
        print("✅ Index built!")
    
    def retrieve_relevant_segments(self, query: str, top_k: int = 3):
        """Find the most relevant segments for a question"""
        if self.index is None or len(self.segments) == 0:
            return []
        
        print(f"🔍 Searching for: '{query}'")
        
        # Convert question to vector
        query_embedding = embedding_model.encode([query])
        
        # Find most similar segments
        distances, indices = self.index.search(query_embedding.astype('float32'), top_k)
        
        relevant = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.segments):
                segment = self.segments[idx]
                relevant.append({
                    "text": segment.text,
                    "start": segment.start,
                    "end": segment.end,
                    "relevance_score": float(1 / (1 + distance))
                })
                print(f"  ✓ Found segment at {self.format_time(segment.start)}")
        
        return relevant
    
    def generate_answer_with_llama(self, question: str, relevant_segments: List[dict]):
        """Generate answer using Llama via Ollama"""
        # Build context from relevant segments
        context = "\n\n".join([
            f"[{self.format_time(seg['start'])} - {self.format_time(seg['end'])}]: {seg['text']}"
            for seg in relevant_segments
        ])
        
        # Detect if user wants a summary
        is_summary = any(word in question.lower() for word in ['summary', 'summarize', 'overview', 'main points', 'key points'])
        
        if is_summary:
            prompt = f"""Analyze this transcript and provide a comprehensive summary of key details and events covered.

Transcript:
{context}

Question: {question}

Instructions:
- List specific details with names, numbers, locations, outcomes
- Focus on WHAT happened, WHO was involved, and KEY facts
- Omit meta-commentary about the broadcast format or correspondents
- Do not use markdown formatting
- Be thorough but avoid repetition
- Use normal text formatting

Provide a factual summary of the transcript.

Summary:"""
        else:
            prompt = f"""You are a helpful assistant answering questions about a transcript. Use the transcript segments below to answer the question accurately and in detail.

Transcript Segments:
{context}

Question: {question}

Instructions:
- Answer concisely but include key facts
- Avoid long explanations unless specifically asked
- Reference timestamps only for critical information
- Do not use markdown formatting

Answer:"""
        
        print("🤖 Asking Llama...")
        
        try:
            # Call Ollama API
            response = requests.post(
                'http://localhost:11434/api/generate',
                json={
                    "model": "llama3.1",  # Better model for detailed responses
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 700,  # Increased from 300 to allow longer responses
                        "top_p": 0.9,
                        "num_ctx": 4096  # Larger context window
                    }
                },
                timeout=60 
            )
            
            if response.status_code == 200:
                answer = response.json()['response']
                print("✅ Got answer from Llama!")
                return answer.strip()
            else:
                print(f"❌ Ollama API error: {response.status_code}")
                raise Exception(f"Ollama API error: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to Ollama!")
            return "⚠️ **Ollama is not running!**\n\nPlease start Ollama by running:\n```\nollama serve\n```\n\nThen try again."
        except Exception as e:
            print(f"❌ Error: {e}")
            # Fallback response with context
            return f"I found these relevant parts of the transcript:\n\n{context}\n\n(Note: Could not generate AI response. Error: {str(e)})"
    
    @staticmethod
    def format_time(seconds: float) -> str:
        """Convert seconds to MM:SS format"""
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins}:{secs:02d}"

# Create global RAG system
rag_system = RAGSystem()

@app.post("/api/qa", response_model=QAResponse)
async def answer_question(request: QARequest):
    """Main endpoint: receives question and transcript, returns answer"""
    print(f"\n{'='*50}")
    print(f"📥 New question: '{request.question}'")
    
    try:
        # Step 1: Build search index from transcript
        rag_system.build_index(request.segments)
        
        # Step 2: Find relevant segments (increased from 3 to 5)
        relevant_segments = rag_system.retrieve_relevant_segments(request.question, top_k=5)
        
        if not relevant_segments:
            print("⚠️ No relevant segments found")
            return QAResponse(
                answer="I couldn't find relevant information in the transcript to answer your question. Could you try rephrasing?",
                relevant_segments=[]
            )
        
        # Step 3: Generate answer with Llama
        answer = rag_system.generate_answer_with_llama(request.question, relevant_segments)
        
        print(f"✅ Response sent!")
        print(f"{'='*50}\n")
        
        return QAResponse(
            answer=answer,
            relevant_segments=relevant_segments
        )
    
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Check if backend is running"""
    return {
        "status": "healthy",
        "model": "llama3.2",
        "ollama_running": check_ollama()
    }

def check_ollama():
    """Check if Ollama is accessible"""
    try:
        response = requests.get('http://localhost:11434/api/tags', timeout=2)
        return response.status_code == 200
    except:
        return False

@app.get("/")
async def root():
    """Welcome message"""
    return {
        "message": "RAG Backend is running!",
        "ollama_status": "connected" if check_ollama() else "not connected",
        "endpoints": {
            "qa": "POST /api/qa",
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    # Use port 8001 to avoid conflict with transcription server
    port = 8001
    
    print("\n" + "="*50)
    print(f"🚀 Starting RAG Backend Server on port {port}")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=port)