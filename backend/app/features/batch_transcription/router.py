from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
import tempfile
import os
import traceback
import uuid
from datetime import datetime

# 🔥 Import Whisper directly here
from faster_whisper import WhisperModel 
from app.utils.security import get_current_user 

# 🔥 Import our new repository
from app.database.repositories.batch_transcription_repository import BatchTranscriptionRepository

router = APIRouter()

# ==================================================
# 🔥 Lazy-Load Model (Protects Server RAM)
# ==================================================
batch_model = None

def get_whisper_model():
    global batch_model
    if batch_model is None:
        print("⏳ Loading Whisper model into memory for batch processing...")
        batch_model = WhisperModel("tiny")
        print("✅ Whisper model loaded successfully!")
    return batch_model


@router.post("/upload-audio")
async def upload_and_transcribe(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user) 
):
    allowed_types = ["audio/mpeg", "audio/wav", "audio/x-m4a", "audio/ogg", "video/mp4"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an MP3, WAV, M4A, or MP4."
        )

    temp_file_path = ""
    try:
        # 1. Read file and get initial metadata
        contents = await file.read()
        audio_size = len(contents)
        extension = file.filename.split('.')[-1].upper() if '.' in file.filename else "UNKNOWN"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(contents)
            temp_file_path = temp_audio.name

        print(f"🎙️ Processing batch file from {current_user.get('name')}")

        # 2. Transcribe
        model = get_whisper_model()
        segments, info = model.transcribe(temp_file_path, beam_size=5)
        
        full_transcript = ""
        for segment in segments:
            full_transcript += segment.text + " "
        
        full_transcript = full_transcript.strip()

        # 3. 🔥 Calculate text metadata on the backend
        text_size = len(full_transcript.encode('utf-8'))
        word_count = len(full_transcript.split())
        duration = round(info.duration, 2)
        task_id = f"TASK-{str(uuid.uuid4())[:8].upper()}"

        # 4. 🔥 Store the record in MongoDB using the Repository method!
        job_record = {
            "task_id": task_id,
            "user_id": current_user.get("id"),
            "operator_name": current_user.get("name"),
            "filename": file.filename,
            "extension": extension,
            "audio_size_bytes": audio_size,
            "text_size_bytes": text_size,
            "word_count": word_count,
            "duration_seconds": duration,
            "transcript": full_transcript,
            "timestamp": datetime.utcnow()
        }
        
        # 🔥 Just call it directly, no 'await' needed!
        BatchTranscriptionRepository.create_job(job_record)

        # 5. Return the full package to the frontend
        return {
            "success": True,
            "task_id": task_id,
            "filename": file.filename,
            "language": info.language,
            "duration": duration,
            "audioSize": audio_size,
            "extension": extension,
            "textSize": text_size,
            "wordCount": word_count,
            "transcript": full_transcript
        }

    except Exception as e:
        print("❌ Transcription Error:", str(e))
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process audio file."
        )
        
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)