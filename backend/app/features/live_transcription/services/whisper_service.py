from faster_whisper import WhisperModel

import numpy as np
import re
import time

# ==================================================
# 🔥 Lazy Loaded Whisper Model
# ==================================================
model = None


# ==================================================
# 🔥 Model Config
# ==================================================
MODEL_NAME = "tiny"

DEVICE = "cpu"

COMPUTE_TYPE = "int8"

LANGUAGE = "en"

SAMPLE_RATE = 16000


# ==================================================
# 🔥 Hallucination Blacklist
# ==================================================
BLACKLIST_PHRASES = [

    "thank you",

    "thanks for watching",

    "subscribe",

    "bye",

    "see you next time",

    "foreign",

    "music",

    "you",

    "thank you for watching"
]


# ==================================================
# 🔥 Load Model
# ==================================================
def get_model():

    global model

    if model is None:

        print(
            f"📦 Loading Whisper Model: "
            f"{MODEL_NAME}"
        )

        start_time = time.time()

        model = WhisperModel(

            MODEL_NAME,

            device=DEVICE,

            compute_type=COMPUTE_TYPE
        )

        load_time = round(
            time.time() - start_time,
            2
        )

        print(
            f"✅ Whisper Loaded "
            f"({load_time}s)"
        )

    return model


# ==================================================
# 🔥 Audio Energy
# ==================================================
def calculate_audio_energy(
    audio_array: np.ndarray
):

    return float(
        np.abs(audio_array).mean()
    )


# ==================================================
# 🔥 Garbage Detection
# ==================================================
def is_garbage_text(text: str):

    clean = text.lower().strip()

    # 🔥 Empty text
    if not clean:
        return True

    # 🔥 Very short
    if len(clean.split()) < 2:
        return True

    # 🔥 Blacklist phrases
    for phrase in BLACKLIST_PHRASES:

        if phrase in clean:

            return True

    # 🔥 Repeated characters
    if re.fullmatch(
        r"(.)\1{4,}",
        clean
    ):

        return True

    return False


# ==================================================
# 🔥 Clean Transcript
# ==================================================
def clean_transcript(text: str):

    # Remove extra spaces
    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ==================================================
# 🔥 Whisper Transcription
# ==================================================
def transcribe_audio_array(
    audio_array: np.ndarray
):

    try:

        # ==========================================
        # 🔥 Energy Filtering
        # ==========================================
        energy = calculate_audio_energy(
            audio_array
        )

        print(
            f"🔊 Audio Energy: "
            f"{round(energy, 6)}"
        )

        # Skip silence
        if energy < 0.005:

            print(
                "🔇 Silence skipped"
            )

            return ""

        # ==========================================
        # 🔥 Load Model
        # ==========================================
        whisper_model = get_model()

        # ==========================================
        # 🔥 Start Transcription
        # ==========================================
        start_time = time.time()

        segments, info = (
            whisper_model.transcribe(

                audio_array,

                beam_size=1,

                language=LANGUAGE,

                condition_on_previous_text=False,

                temperature=0.0,

                no_speech_threshold=0.8,

                vad_filter=True,

                vad_parameters=dict(

                    min_silence_duration_ms=700,

                    speech_pad_ms=200
                )
            )
        )

        # ==========================================
        # 🔥 Build Transcript
        # ==========================================
        text_parts = []

        for segment in segments:

            if not segment.text:
                continue

            clean_text = (
                segment.text.strip()
            )

            if len(clean_text) > 1:

                text_parts.append(
                    clean_text
                )

        final_text = " ".join(
            text_parts
        )

        final_text = clean_transcript(
            final_text
        )

        # ==========================================
        # 🔥 Garbage Filtering
        # ==========================================
        if is_garbage_text(
            final_text
        ):

            print(
                "⚠️ Garbage transcript skipped"
            )

            return ""

        # ==========================================
        # 🔥 Metrics
        # ==========================================
        processing_time = round(
            time.time() - start_time,
            2
        )

        print(
            f"📝 Transcript: "
            f"{final_text}"
        )

        print(
            f"⚡ Processing Time: "
            f"{processing_time}s"
        )

        return final_text

    except Exception as e:

        print(
            "⚠️ Whisper ERROR:",
            str(e)
        )

        return ""


# ==================================================
# 🔥 Whisper Metadata
# ==================================================
def get_whisper_metadata():

    return {

        "model_name": MODEL_NAME,

        "device": DEVICE,

        "compute_type": COMPUTE_TYPE,

        "language": LANGUAGE,

        "sample_rate": SAMPLE_RATE
    }