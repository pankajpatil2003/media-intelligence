from datetime import datetime

from app.features.live_transcription.services.session_service import (
    update_session_transcript
)


# ==================================================
# 🔥 Append Transcript
# ==================================================
def append_transcript(

    session,

    text: str
):

    clean_text = text.strip()

    # 🔥 Skip empty text
    if not clean_text:

        print("⚠️ Empty transcript skipped")

        return False

    # 🔥 Prevent duplicate streaming text
    if clean_text == session.previous_text:

        print(
            "⚠️ Duplicate transcript skipped"
        )

        return False

    # 🔥 Prevent tiny garbage outputs
    if len(clean_text.split()) < 2:

        print(
            "⚠️ Weak transcript skipped"
        )

        return False

    # 🔥 Update previous text
    session.previous_text = clean_text

    # 🔥 Update transcript data
    update_session_transcript(

        session=session,

        text=clean_text
    )

    print(
        f"📝 Transcript Added "
        f"({session.total_chunks})"
    )

    return True


# ==================================================
# 🔥 Get Full Transcript
# ==================================================
def get_full_transcript(session):

    return session.transcript.strip()


# ==================================================
# 🔥 Get Latest Transcript
# ==================================================
def get_latest_transcript(session):

    return session.latest_text


# ==================================================
# 🔥 Get Transcript Chunks
# ==================================================
def get_transcript_chunks(session):

    return session.chunks


# ==================================================
# 🔥 Get Transcript Metadata
# ==================================================
def get_transcript_metadata(session):

    return {

        "session_id":
            session.session_id,

        "user_id":
            session.user_id,

        "feature":
            session.feature,

        "status":
            session.status,

        "language":
            session.language,

        "model_name":
            session.model_name,

        "total_chunks":
            session.total_chunks,

        "total_words":
            session.total_words,

        "total_characters":
            session.total_characters,

        "created_at":
            session.created_at.isoformat()
            if session.created_at else None,

        "updated_at":
            session.updated_at.isoformat()
            if session.updated_at else None,

        "ended_at":
            session.ended_at.isoformat()
            if session.ended_at else None
    }

# ==================================================
# 🔥 Build Complete Response
# ==================================================
def build_transcript_response(session):

    return {

        "success": True,

        "session_id":
            session.session_id,

        "user_id":
            session.user_id,

        "feature":
            session.feature,

        "status":
            session.status,

        "latest_text":
            get_latest_transcript(session),

        "full_transcript":
            get_full_transcript(session),

        "metadata":
            get_transcript_metadata(session)
    }


# ==================================================
# 🔥 Export TXT Content
# ==================================================
def build_txt_export(session):

    content = []

    content.append(
        f"Session ID: "
        f"{session.session_id}"
    )

    content.append(
        f"User ID: "
        f"{session.user_id}"
    )

    content.append(
        f"Feature: "
        f"{session.feature}"
    )

    content.append(
        f"Created At: "
        f"{session.created_at}"
    )

    content.append(
        f"Ended At: "
        f"{session.ended_at}"
    )

    content.append(
        f"Total Words: "
        f"{session.total_words}"
    )

    content.append(
        "\nTranscript:\n"
    )

    content.append(
        "-" * 50
    )

    content.append(
        get_full_transcript(session)
    )

    return "\n".join(content)