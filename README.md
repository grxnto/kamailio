### Kamaʻilio Project
## Purpose
This project uses AI + LLMs to transform podcasts into searchable transcripts, reports, and Q&A experiences.
- Goal A (primary): Build a working pipeline for English podcasts → transcription → reports → Q&A.

- Goal B (stretch): Extend the pipeline for Hawaiian podcasts, including transcription, translation, and bilingual analysis.



## Key Concepts
ASR (Automatic Speech Recognition): Converts speech to text (e.g., Whisper).

ACR (Audio Content Recognition): Broader concept that includes identifying speakers, topics, or content type.

LLM Q&A / RAG (Retrieval-Augmented Generation): Use LLMs to answer questions by pulling relevant transcript passages.

WER (Word Error Rate) – measures transcription accuracy in English.

CER (Character Error Rate) – important for Hawaiian because of ʻokina and kahakō.

MT Metrics (COMET/BLEU) – evaluate translation quality.





## Deliverables
1. Data Ingestion & Processing
2. Transcription Pipeline
3. Transcript Storage & Indexing
4. Reporting Features
    a. Generate an auto-summary of each episode.

    b .Produce chapter markers (topics/themes with timestamps).

    c. Extract highlighted quotes and keywords.

    d.Deliver example reports for at least 2 English podcasts.
5. Q&A System (Goal A)
    a. Implement a retrieval-augmented Q&A prototype:

    b. Users ask questions.

    c. Relevant transcript chunks are retrieved.

    d. LLM answers, citing transcript + timestamps.

    e. Demo with at least 3 English podcast episodes.
6. Evaluation

## Running the app locally
1. Start the virtual environment for the backend (enter kamailio-backend/src) and use command:
    uvicorn transcription:app --reload
2. Start another terminal to load the frontend (enter kamailio-app/my-app) and use command:
    npm run dev