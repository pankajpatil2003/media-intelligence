from app.database.collections import batch_transcriptions_collection
from typing import List, Dict

class BatchTranscriptionRepository:
    
    @staticmethod
    def create_job(job_data: dict) -> dict:
        """
        Saves a new batch transcription metadata record to MongoDB.
        """
        # 🔥 Removed 'await' because pymongo is synchronous
        result = batch_transcriptions_collection.insert_one(job_data)
        
        # Return the inserted ID just in case the router needs it
        job_data["_id"] = str(result.inserted_id)
        return job_data

    @staticmethod
    def get_jobs_by_user(user_id: str) -> List[Dict]:
        """
        Fetches all transcription jobs for a specific user.
        (Useful for a future 'History' tab!)
        """
        # 🔥 Synchronous cursor handling
        cursor = batch_transcriptions_collection.find({"user_id": user_id}).sort("timestamp", -1).limit(100)
        jobs = list(cursor)
        
        # Format the ObjectIds to strings
        for job in jobs:
            job["_id"] = str(job["_id"])
            
        return jobs