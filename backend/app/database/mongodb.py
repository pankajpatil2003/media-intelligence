import os
import certifi
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# 🔥 Load environment variables from .env file
load_dotenv()

class MongoDB:

    _client = None
    _db: Database = None

    @classmethod
    def connect(cls):

        try:

            if cls._client is None:

                print("🔄 Connecting to MongoDB Atlas...")

                # 🔥 Fetch credentials from .env
                mongo_uri = os.getenv("MONGO_URI")
                db_name = os.getenv("MONGO_DB_NAME", "media_intelligence")

                if not mongo_uri:
                    raise ValueError("🚨 MONGO_URI environment variable not set. Check your .env file.")

                # 🔥 Connect using certifi for secure SSL/TLS and ServerApi for Atlas
                cls._client = MongoClient(
                    mongo_uri,
                    server_api=ServerApi('1'),
                    tlsCAFile=certifi.where()
                )

                cls._db = cls._client[db_name]

                # 🔥 Ping test to verify connection
                cls._client.admin.command("ping")

                print(f"✅ MongoDB Atlas Connected (Database: {db_name})")

        except Exception as e:

            print(
                "❌ MongoDB Atlas Connection Error:",
                str(e)
            )

            raise e

    @classmethod
    def get_db(cls):

        if cls._db is None:

            cls.connect()

        return cls._db

    @classmethod
    def get_collection(
        cls,
        collection_name: str
    ):

        db = cls.get_db()

        return db[collection_name]

    @classmethod
    def close(cls):

        if cls._client:

            cls._client.close()

            print(
                "🔌 MongoDB Atlas Connection Closed"
            )