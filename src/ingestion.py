import json
from pathlib import Path
import whisper
# from openai import OpenAI

# client = OpenAI()

def transcribe_audio(audio_path: Path, model):
    print(f"Transcribing {audio_path.name}...")
    result = model.transcribe(str(audio_path))
    return result

def extract_topics(transcript_text: str, model_name="gpt-4o-mini"):
    prompt = f"List 3–5 key topics or themes discussed in this transcript:\n\n{transcript_text[:4000]}"
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
    )
    topics = response.choices[0].message.content.split("\n")
    return [t.strip("-• ") for t in topics if t.strip()]


def pipeline(audio_dir, transcript_dir, processed_dir, whisper_model_size):
    # prepare directories
    print(f"hello")
    transcript_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)

    # load Whisper model
    model = whisper.load_model(whisper_model_size)

    for audio_file in audio_dir.glob("*.mp3"):
        # create path names 
        base_name = audio_file.stem
        transcript_path = transcript_dir / f"{base_name}.json"
        processed_path = processed_dir / f"{base_name}.json"

        # Skip if already processed
        if processed_path.exists():
            print(f"Skipping {audio_file.name} (already processed)")
            continue

        # transcript
        if transcript_path.exists():
            data = json.loads(transcript_path.read_text())
        else:
            data = transcribe_audio(audio_file, model)
            transcript_path.write_text(json.dumps(data, indent=2))
            print(f"Saved transcript: {transcript_path.name}")

        # topics
        # print(f"Extracting topics for {audio_file.name}...")
        # topics = extract_topics(data["text"])
        # data["topics"] = topics

        # Save enriched data
        #processed_path.write_text(json.dumps(data, indent=2))
        # print(f"Saved enriched transcript: {processed_path.name}\n")

def main():
    PROJECT_ROOT = Path(__file__).resolve().parent.parent
    pipeline(PROJECT_ROOT / "data/podcasts-eng", PROJECT_ROOT / "data/transcripts", PROJECT_ROOT / "data/processed", "small")

if __name__ == "__main__":
    main()
