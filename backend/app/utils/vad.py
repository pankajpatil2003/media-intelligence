import webrtcvad
import numpy as np

# ==================================================
# 🔥 VAD Configuration
# ==================================================

# 0 = least aggressive
# 3 = most aggressive
VAD_AGGRESSIVENESS = 2

SAMPLE_RATE = 16000

FRAME_DURATION_MS = 30

MIN_SPEECH_RATIO = 0.30

MIN_AUDIO_ENERGY = 0.005


# ==================================================
# 🔥 Initialize WebRTC VAD
# ==================================================
vad = webrtcvad.Vad(
    VAD_AGGRESSIVENESS
)


# ==================================================
# 🔥 Audio Energy
# ==================================================
def calculate_audio_energy(
    audio_float32: np.ndarray
):

    return float(
        np.abs(audio_float32).mean()
    )


# ==================================================
# 🔥 Convert Float32 → PCM16
# ==================================================
def float32_to_pcm16(
    audio_float32: np.ndarray
):

    return (
        audio_float32 * 32767
    ).astype(np.int16)


# ==================================================
# 🔥 Split Audio Into Frames
# ==================================================
def generate_audio_frames(
    audio_bytes: bytes
):

    frame_size = int(
        SAMPLE_RATE *
        FRAME_DURATION_MS /
        1000
    )

    bytes_per_frame = (
        frame_size * 2
    )

    for i in range(
        0,
        len(audio_bytes),
        bytes_per_frame
    ):

        frame = audio_bytes[
            i:i + bytes_per_frame
        ]

        if len(frame) == bytes_per_frame:

            yield frame


# ==================================================
# 🔥 Main Speech Detection
# ==================================================
def is_speech(
    audio_float32: np.ndarray
):

    try:

        # ==========================================
        # 🔥 Empty Audio
        # ==========================================
        if len(audio_float32) == 0:

            print(
                "⚠️ Empty audio received"
            )

            return False

        # ==========================================
        # 🔥 Energy Filtering
        # ==========================================
        energy = calculate_audio_energy(
            audio_float32
        )

        print(
            f"🔊 VAD Energy: "
            f"{round(energy, 6)}"
        )

        if energy < MIN_AUDIO_ENERGY:

            print(
                "🔇 Low-energy audio skipped"
            )

            return False

        # ==========================================
        # 🔥 Convert Audio
        # ==========================================
        audio_int16 = (
            float32_to_pcm16(
                audio_float32
            )
        )

        audio_bytes = (
            audio_int16.tobytes()
        )

        # ==========================================
        # 🔥 Process Frames
        # ==========================================
        speech_frames = 0

        total_frames = 0

        for frame in generate_audio_frames(
            audio_bytes
        ):

            total_frames += 1

            try:

                if vad.is_speech(
                    frame,
                    SAMPLE_RATE
                ):

                    speech_frames += 1

            except Exception as e:

                print(
                    "⚠️ Frame Processing Error:",
                    str(e)
                )

        # ==========================================
        # 🔥 No Valid Frames
        # ==========================================
        if total_frames == 0:

            print(
                "⚠️ No valid audio frames"
            )

            return False

        # ==========================================
        # 🔥 Speech Ratio
        # ==========================================
        speech_ratio = (
            speech_frames /
            total_frames
        )

        print(
            f"🗣️ Speech Ratio: "
            f"{round(speech_ratio, 2)}"
        )

        detected = (
            speech_ratio >=
            MIN_SPEECH_RATIO
        )

        # ==========================================
        # 🔥 Result
        # ==========================================
        if detected:

            print(
                "✅ Human speech detected"
            )

        else:

            print(
                "🔇 No speech detected"
            )

        return detected

    except Exception as e:

        print(
            "⚠️ VAD ERROR:",
            str(e)
        )

        return False


# ==================================================
# 🔥 VAD Metadata
# ==================================================
def get_vad_metadata():

    return {

        "vad_aggressiveness":
            VAD_AGGRESSIVENESS,

        "sample_rate":
            SAMPLE_RATE,

        "frame_duration_ms":
            FRAME_DURATION_MS,

        "min_speech_ratio":
            MIN_SPEECH_RATIO,

        "min_audio_energy":
            MIN_AUDIO_ENERGY
    }