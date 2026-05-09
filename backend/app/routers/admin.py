from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.database.collections import users_collection
from app.routers.auth import get_current_user

router = APIRouter()

# ==================================================
# 🔥 Strict Role Dependency
# ==================================================
def require_root_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "Root Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Unauthorized: Root Admin clearance required."
        )
    return current_user

# ==================================================
# 🔥 Get Pending Users
# ==================================================
@router.get("/pending-users")
async def get_pending_users(admin: dict = Depends(require_root_admin)):
    cursor = users_collection.find({"status": "Pending"})
    users = []
    for u in cursor:
        users.append({
            "id": str(u["_id"]),
            "name": u["name"],
            "email": u["email"],
            "requestedRole": u.get("role", "User"),
            "date": u.get("created_at").strftime("%Y-%m-%d") if u.get("created_at") else "Unknown"
        })
    return users

# ==================================================
# 🔥 Approve User
# ==================================================
@router.post("/approve-user/{user_id}")
async def approve_user(user_id: str, admin: dict = Depends(require_root_admin)):
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": "Active", "role": "Operator"}} # Promotes them to Operator
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Operator not found or already processed.")
        
    return {"success": True, "message": "Clearance granted."}