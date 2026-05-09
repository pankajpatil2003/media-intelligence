from dataclasses import dataclass
from dataclasses import field

from datetime import datetime
from typing import List
from typing import Dict
from typing import Optional


@dataclass
class Session:

    # 🔥 Core IDs
    session_id: str

    user_id: str = ""

    feature: str = "live_transcription"

    # 🔥 Session Status
    status: str = "connected"

    # 🔥 Transcript Data
    transcript: str = ""

    latest_text: str = ""

    previous_text: str = ""

    # 🔥 Store transcript chunks
    chunks: List[Dict] = field(
        default_factory=list
    )

    # 🔥 Metadata
    language: str = "en"

    model_name: str = "tiny"

    sample_rate: int = 16000

    # 🔥 Session Timestamps
    created_at: datetime = field(
        default_factory=datetime.utcnow
    )

    updated_at: datetime = field(
        default_factory=datetime.utcnow
    )

    ended_at: Optional[datetime] = None

    # 🔥 Session Analytics
    total_chunks: int = 0

    total_characters: int = 0

    total_words: int = 0

    # 🔥 Convert session → Mongo document
    def to_dict(self):

        return {

            "session_id": self.session_id,

            "user_id": self.user_id,

            "feature": self.feature,

            "status": self.status,

            "transcript": self.transcript,

            "latest_text": self.latest_text,

            "chunks": self.chunks,

            "language": self.language,

            "model_name": self.model_name,

            "sample_rate": self.sample_rate,

            "created_at": self.created_at,

            "updated_at": self.updated_at,

            "ended_at": self.ended_at,

            "total_chunks": self.total_chunks,

            "total_characters":
                self.total_characters,

            "total_words":
                self.total_words
        }