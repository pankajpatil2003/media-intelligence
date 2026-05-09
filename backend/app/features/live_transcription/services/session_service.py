import uuid

from datetime import datetime
from typing import Optional

from app.features.live_transcription.models.session import (
    Session
)


# ==================================================
# 🔥 In-Memory Active Sessions
# ==================================================
active_sessions = {}


# ==================================================
# 🔥 Create Session
# ==================================================
def create_session(

    user_id: str = "",

    feature: str = "live_transcription"
):

    session_id = str(uuid.uuid4())

    session = Session(

        session_id=session_id,

        user_id=user_id,

        feature=feature,

        status="connected"
    )

    active_sessions[session_id] = session

    print(
        f"🆔 Session Created: {session_id}"
    )

    return session


# ==================================================
# 🔥 Get Session
# ==================================================
def get_session(
    session_id: str
) -> Optional[Session]:

    return active_sessions.get(
        session_id
    )


# ==================================================
# 🔥 Update Session Status
# ==================================================
def update_session_status(

    session: Session,

    status: str
):

    session.status = status

    session.updated_at = (
        datetime.utcnow()
    )

    print(
        f"🔄 Session Status: "
        f"{session.session_id} → {status}"
    )


# ==================================================
# 🔥 Update Transcript Analytics
# ==================================================
def update_session_transcript(

    session: Session,

    text: str
):

    clean_text = text.strip()

    if not clean_text:
        return

    session.latest_text = clean_text

    session.transcript += (
        clean_text + " "
    )

    # 🔥 Analytics
    session.total_chunks += 1

    session.total_characters += (
        len(clean_text)
    )

    session.total_words += (
        len(clean_text.split())
    )

    # 🔥 Save transcript chunk
    session.chunks.append({

        "text": clean_text,

        "timestamp":
            datetime.utcnow().isoformat()
    })

    session.updated_at = (
        datetime.utcnow()
    )


# ==================================================
# 🔥 End Session
# ==================================================
def end_session(session: Session):

    session.status = "completed"

    session.ended_at = (
        datetime.utcnow()
    )

    session.updated_at = (
        datetime.utcnow()
    )

    print(
        f"🛑 Session Ended: "
        f"{session.session_id}"
    )


# ==================================================
# 🔥 Remove Session
# ==================================================
def remove_session(
    session_id: str
):

    if session_id in active_sessions:

        del active_sessions[
            session_id
        ]

        print(
            f"🗑️ Session Removed: "
            f"{session_id}"
        )


# ==================================================
# 🔥 Active Session Count
# ==================================================
def get_active_session_count():

    return len(active_sessions)


# ==================================================
# 🔥 Get All Sessions
# ==================================================
def get_all_sessions():

    return active_sessions