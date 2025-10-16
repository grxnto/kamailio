from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import whisper
import uvicorn

app = FastAPI()

# Allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for local testing, you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the Whisper model once
model = whisper.load_model("base")  # you can use "small", "medium", "large" etc.

@app.post("/upload/")
async def upload_audio(file: UploadFile = File(...)):
    # Save uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Transcribe audio
    result = model.transcribe(tmp_path)

    return {"transcription": result["text"]}
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
