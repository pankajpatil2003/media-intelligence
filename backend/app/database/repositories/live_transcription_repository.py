from datetime import datetime

from app.database.mongodb import (
    MongoDB
)

from app.features.live_transcription.models.session import (
    Session
)


# ==================================================
# 🔥 Collection
# ==================================================
COLLECTION_NAME = "live_transcriptions"


# ==================================================
# 🔥 Get Collection
# ==================================================
def get_collection():

    return MongoDB.get_collection(
        COLLECTION_NAME
    )


# ==================================================
# 🔥 Save Live Transcription
# ==================================================
def save_live_transcription(
    session: Session
):

    try:

        collection = get_collection()

        document = {

            # 🔥 Core IDs
            "session_id":
                session.session_id,

            "user_id":
                session.user_id,

            "feature":
                session.feature,

            # 🔥 Status
            "status":
                session.status,

            # 🔥 Transcript
            "transcript":
                session.transcript.strip(),

            "latest_text":
                session.latest_text,

            "chunks":
                session.chunks,

            # 🔥 Metadata
            "metadata": {

                "language":
                    session.language,

                "model_name":
                    session.model_name,

                "sample_rate":
                    session.sample_rate
            },

            # 🔥 Analytics
            "analytics": {

                "total_chunks":
                    session.total_chunks,

                "total_words":
                    session.total_words,

                "total_characters":
                    session.total_characters
            },

            # 🔥 Timestamps
            "created_at":
                session.created_at,

            "updated_at":
                session.updated_at,

            "ended_at":
                session.ended_at,

            # 🔥 System timestamps
            "saved_at":
                datetime.utcnow()
        }

        result = (
            collection.insert_one(
                document
            )
        )

        print(
            f"💾 Live transcription saved: "
            f"{result.inserted_id}"
        )

        return result.inserted_id

    except Exception as e:

        print(
            "⚠️ Save transcription error:",
            str(e)
        )

        return None


# ==================================================
# 🔥 Get By Session ID
# ==================================================
def get_transcription_by_session_id(
    session_id: str
):

    try:

        collection = get_collection()

        return collection.find_one({

            "session_id": session_id
        })

    except Exception as e:

        print(
            "⚠️ Fetch transcription error:",
            str(e)
        )

        return None


# ==================================================
# 🔥 Get User Transcriptions
# ==================================================
def get_user_transcriptions(
    user_id: str,

    limit: int = 20
):

    try:

        collection = get_collection()

        cursor = collection.find({

            "user_id": user_id

        }).sort(

            "created_at",
            -1

        ).limit(limit)

        return list(cursor)

    except Exception as e:

        print(
            "⚠️ Fetch user transcriptions error:",
            str(e)
        )

        return []


# ==================================================
# 🔥 Update Transcript
# ==================================================
def update_transcription(

    session_id: str,

    update_data: dict
):

    try:

        collection = get_collection()

        update_data["updated_at"] = (
            datetime.utcnow()
        )

        result = collection.update_one(

            {
                "session_id": session_id
            },

            {
                "$set": update_data
            }
        )

        print(
            f"🔄 Updated transcription: "
            f"{session_id}"
        )

        return result.modified_count

    except Exception as e:

        print(
            "⚠️ Update transcription error:",
            str(e)
        )

        return 0


# ==================================================
# 🔥 Delete Transcript
# ==================================================
def delete_transcription(
    session_id: str
):

    try:

        collection = get_collection()

        result = collection.delete_one({

            "session_id": session_id
        })

        print(
            f"🗑️ Deleted transcription: "
            f"{session_id}"
        )

        return result.deleted_count

    except Exception as e:

        print(
            "⚠️ Delete transcription error:",
            str(e)
        )

        return 0


# ==================================================
# 🔥 Export TXT Content
# ==================================================
def build_txt_export(document):

    content = []

    content.append(
        f"Session ID: "
        f"{document.get('session_id')}"
    )

    content.append(
        f"User ID: "
        f"{document.get('user_id')}"
    )

    content.append(
        f"Feature: "
        f"{document.get('feature')}"
    )

    content.append(
        f"Status: "
        f"{document.get('status')}"
    )

    content.append(
        f"Created At: "
        f"{document.get('created_at')}"
    )

    content.append(
        f"Ended At: "
        f"{document.get('ended_at')}"
    )

    analytics = document.get(
        "analytics",
        {}
    )

    content.append(
        f"Total Words: "
        f"{analytics.get('total_words', 0)}"
    )

    content.append(
        "\nTranscript:\n"
    )

    content.append("-" * 50)

    content.append(
        document.get(
            "transcript",
            ""
        )
    )

    return "\n".join(content)