from fastapi import APIRouter
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from fastapi import status  # 🔥 Added for WebSocket error codes

from jose import jwt, JWTError  # 🔥 Added for JWT decoding

import json
import numpy as np
import traceback

from app.utils.vad import (
    is_speech
)

# 🔥 Added security utilities
from app.utils.security import (
    SECRET_KEY, 
    ALGORITHM
)

from app.features.live_transcription.services.whisper_service import (
    transcribe_audio_array
)

from app.features.live_transcription.services.session_service import (
    create_session,
    remove_session,
    update_session_status,
    end_session
)

from app.features.live_transcription.services.transcript_service import (
    append_transcript,
    build_transcript_response
)

from app.features.live_transcription.services.audio_buffer_service import (
    AudioBuffer
)

from app.database.repositories.live_transcription_repository import (
    save_live_transcription
)

router = APIRouter()

@router.websocket("/ws/transcribe")
async def websocket_transcribe(
    websocket: WebSocket,
    token: str = None  # 🔥 Automatically extracts ?token=... from the URL
):
    # ==================================================
    # 🔥 SECURITY GATEKEEPER: Validate JWT Token
    # ==================================================
    if not token:
        print("🚫 WebSocket Rejected: No access token provided.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        # Decode the JWT to verify authenticity
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        secure_user_id = payload.get("sub")
        
        if not secure_user_id:
            print("🚫 WebSocket Rejected: Invalid token payload.")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
    except JWTError as e:
        print(f"🚫 WebSocket Rejected: JWT Error ({str(e)})")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # ==================================================
    # 🔥 Accept Connection
    # ==================================================
    await websocket.accept()
    print(f"✅ Secure Client Connected (Operator ID: OP-{secure_user_id[-6:].upper()})")

    # ==================================================
    # 🔥 Create Session
    # ==================================================
    session = create_session()
    
    # 🔥 ENFORCE SECURE ID: Ignore whatever the client sends and use the verified ID from the token
    session.user_id = secure_user_id

    # ==================================================
    # 🔥 Audio Buffer
    # ==================================================
    audio_buffer = AudioBuffer()

    # ==================================================
    # 🔥 Processing Lock
    # ==================================================
    processing = False

    try:
        while True:
            # ==========================================
            # 🔥 Receive WebSocket Message
            # ==========================================
            try:
                message = await websocket.receive()
            except RuntimeError:
                print("🔌 WebSocket disconnected safely")
                break

            # ==========================================
            # 🔥 TEXT MESSAGE
            # ==========================================
            if "text" in message:
                text_data = message["text"]

                try:
                    payload = json.loads(text_data)
                    message_type = payload.get("type")

                    # ----------------------------------
                    # 🔥 Session Start
                    # ----------------------------------
                    if message_type == "session_start":
                        
                        update_session_status(
                            session,
                            "connected"
                        )

                        print(f"👤 Session Initialized for User: {session.user_id}")

                        await websocket.send_json({
                            "success": True,
                            "status": session.status,
                            "session_id": session.session_id,
                            "user_id": session.user_id
                        })

                    # ----------------------------------
                    # 🔥 Stop Session
                    # ----------------------------------
                    elif message_type == "stop_session":
                        print("🛑 Stop session requested")

                        update_session_status(
                            session,
                            "stopping"
                        )

                        await websocket.send_json({
                            "success": True,
                            "status": "stopping"
                        })
                        break

                except Exception as e:
                    print("⚠️ Invalid text message:", str(e))
                continue

            # ==========================================
            # 🔥 AUDIO BYTES
            # ==========================================
            if "bytes" in message:
                data = message["bytes"]

                chunk = np.frombuffer(
                    data,
                    dtype=np.float32
                )

                # Skip empty chunks
                if len(chunk) == 0:
                    continue

                # Add chunk
                audio_buffer.add_chunk(chunk)

                # ======================================
                # 🔥 Process Buffer
                # ======================================
                if audio_buffer.should_process() and not processing:
                    processing = True

                    try:
                        update_session_status(session, "processing")
                        audio_np = audio_buffer.get_audio()

                        # ----------------------------------
                        # 🔥 Voice Activity Detection
                        # ----------------------------------
                        speech_detected = is_speech(audio_np)

                        if not speech_detected:
                            audio_buffer.clear()
                            processing = False
                            continue

                        # ----------------------------------
                        # 🔥 Whisper Transcription
                        # ----------------------------------
                        text = transcribe_audio_array(audio_np)

                        if not text.strip():
                            audio_buffer.clear()
                            processing = False
                            continue

                        # ----------------------------------
                        # 🔥 Append Transcript
                        # ----------------------------------
                        transcript_added = append_transcript(session, text)

                        if not transcript_added:
                            audio_buffer.clear()
                            processing = False
                            continue

                        # ----------------------------------
                        # 🔥 Update Status
                        # ----------------------------------
                        update_session_status(session, "recording")

                        # ----------------------------------
                        # 🔥 Send Response
                        # ----------------------------------
                        response = build_transcript_response(session)
                        await websocket.send_json(response)

                        # ----------------------------------
                        # 🔥 Clear Buffer
                        # ----------------------------------
                        audio_buffer.clear()

                    except Exception as e:
                        print("⚠️ Processing Error:", str(e))
                        traceback.print_exc()

                    finally:
                        processing = False

    except WebSocketDisconnect:
        print("🔌 Client disconnected")
    except Exception as e:
        print("⚠️ WebSocket Error:", str(e))
        traceback.print_exc()
    finally:
        # ==============================================
        # 🔥 Finalize Session
        # ==============================================
        try:
            end_session(session)

            # Save only if transcript exists
            if session.transcript.strip():
                save_live_transcription(session)

        except Exception as e:
            print("⚠️ Session Save Error:", str(e))

        # ==============================================
        # 🔥 Remove Active Session
        # ==============================================
        remove_session(session.session_id)
        print(f"❌ Session Closed: {session.session_id}")