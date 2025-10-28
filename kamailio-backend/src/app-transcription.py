from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import whisper
import tempfile
import shutil
from typing import Dict, List

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model at startup (keeps it in memory)
model = None

@app.on_event("startup")
async def load_model():
    global model
    print("Loading Whisper model...")
    model = whisper.load_model("small")
    print("Model loaded successfully!")

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)) -> Dict:
    """
    Transcribe an uploaded audio file and return text with timestamps
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Check file extension
    allowed_extensions = [".mp3", ".wav", ".m4a", ".mp4", ".webm", ".ogg"]
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type {file_ext} not supported. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Save uploaded file to temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
        try:
            # Copy uploaded file to temp file
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
            
            print(f"Transcribing {file.filename}...")
            
            # Transcribe with timestamps
            result = model.transcribe(
                temp_path,
                verbose=False,
                word_timestamps=True
            )
            
            # Format segments with timestamps
            segments = []
            for segment in result["segments"]:
                segments.append({
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": segment["text"].strip()
                })
            
            return {
                "text": result["text"],
                "segments": segments,
                "language": result.get("language", "unknown")
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
        
        finally:
            # Clean up temp file
            try:
                Path(temp_path).unlink()
            except:
                pass

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)