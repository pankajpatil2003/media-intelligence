# app/database/collections.py

from app.database.mongodb import MongoDB

# ==================================================
# 🔥 MongoDB Atlas Collections
# ==================================================

users_collection = MongoDB.get_collection("users")

sessions_collection = MongoDB.get_collection("sessions")

live_transcriptions_collection = MongoDB.get_collection("live_transcriptions")

# 🔥 Added for the Batch Processing feature
batch_transcriptions_collection = MongoDB.get_collection("batch_transcriptions")