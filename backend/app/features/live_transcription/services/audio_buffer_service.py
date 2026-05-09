import numpy as np
from datetime import datetime


class AudioBuffer:

    def __init__(

        self,

        sample_rate: int = 16000,

        chunk_duration_sec: int = 3
    ):

        # 🔥 Raw audio buffer
        self.buffer = []

        # 🔥 Audio settings
        self.sample_rate = sample_rate

        self.chunk_duration_sec = (
            chunk_duration_sec
        )

        # 🔥 Processing threshold
        self.max_buffer_size = (
            self.sample_rate *
            self.chunk_duration_sec
        )

        # 🔥 Analytics
        self.total_chunks_received = 0

        self.created_at = (
            datetime.utcnow()
        )

        self.last_updated_at = (
            datetime.utcnow()
        )

    # ==================================================
    # 🔥 Add Audio Chunk
    # ==================================================
    def add_chunk(self, chunk):

        if len(chunk) == 0:
            return

        self.buffer.extend(chunk)

        self.total_chunks_received += 1

        self.last_updated_at = (
            datetime.utcnow()
        )

    # ==================================================
    # 🔥 Check If Ready
    # ==================================================
    def should_process(self):

        return (
            len(self.buffer) >=
            self.max_buffer_size
        )

    # ==================================================
    # 🔥 Get Numpy Audio
    # ==================================================
    def get_audio(self):

        return np.array(
            self.buffer,
            dtype=np.float32
        )

    # ==================================================
    # 🔥 Buffer Duration
    # ==================================================
    def get_duration_seconds(self):

        return round(
            len(self.buffer) /
            self.sample_rate,
            2
        )

    # ==================================================
    # 🔥 Buffer Size
    # ==================================================
    def get_buffer_size(self):

        return len(self.buffer)

    # ==================================================
    # 🔥 Is Empty
    # ==================================================
    def is_empty(self):

        return len(self.buffer) == 0

    # ==================================================
    # 🔥 Clear Buffer
    # ==================================================
    def clear(self):

        self.buffer = []

    # ==================================================
    # 🔥 Reset Everything
    # ==================================================
    def reset(self):

        self.buffer = []

        self.total_chunks_received = 0

        self.last_updated_at = (
            datetime.utcnow()
        )

    # ==================================================
    # 🔥 Debug Info
    # ==================================================
    def get_stats(self):

        return {

            "buffer_size":
                self.get_buffer_size(),

            "duration_seconds":
                self.get_duration_seconds(),

            "total_chunks_received":
                self.total_chunks_received,

            "sample_rate":
                self.sample_rate,

            "chunk_duration_sec":
                self.chunk_duration_sec,

            "created_at":
                self.created_at,

            "last_updated_at":
                self.last_updated_at
        }