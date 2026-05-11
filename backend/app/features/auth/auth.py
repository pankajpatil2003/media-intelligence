from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime

# Import models
from app.models.user import UserCreate

# Import security and DB
from app.utils.security import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM
from app.database.collections import users_collection

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# ==================================================
# 🔥 Registration Endpoint (Zero-Trust Flow)
# ==================================================
@router.post("/register")
async def register_user(user_data: UserCreate):
    
    # 1. Check if user already exists
    existing_user = users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An operator with this comm link is already registered."
        )
    
    # 2. Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # 3. Create the user document (Pending Status)
    new_user = {
        "name": user_data.name,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "role": "User",                 # 🔥 Default to base User
        "status": "Pending",            # 🔥 Enforce manual approval
        "created_at": datetime.utcnow()
    }
    
    # 4. Insert into MongoDB
    users_collection.insert_one(new_user)
    
    # 5. Return success message ONLY (no JWT)
    return {
        "success": True,
        "message": "Clearance requested. Awaiting Administrator approval."
    }

# ==================================================
# 🔥 Login Endpoint (Gatekeeper)
# ==================================================
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    
    # 1. Find user in MongoDB by email (OAuth2 uses 'username' field for the ID)
    user = users_collection.find_one({"email": form_data.username})
    
    # 2. Verify existence and password
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect comm link or access code",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 🔥 3. STRICT STATUS CHECKS
    if user.get("status") == "Pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Clearance pending Administrator approval."
        )
        
    if user.get("status") == "Suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Clearance has been revoked."
        )
    
    # 4. Build the JWT payload
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "role": user.get("role", "User")}
    )
    
    # 5. Return token and user data to React
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),         # 🔥 MongoDB ID converted to string and passed to React
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "User")
        }
    }

# ==================================================
# 🔥 Secure Route Dependency
# ==================================================
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    return payload # Returns the decoded token data (id and role)