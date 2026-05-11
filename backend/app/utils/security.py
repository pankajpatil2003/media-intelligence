import hashlib
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from typing import Optional

# 🔥 Added FastAPI imports for standard authentication routes
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# (Keep your SECRET_KEY and ALGORITHM settings here)
SECRET_KEY = "your-super-secret-production-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# We specify bcrypt explicitly to handle potential backend mixin issues
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔥 Tell FastAPI where to look for the token when protecting standard HTTP routes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ==================================================
# 🔥 Pre-Hashing (Bypasses Bcrypt 72-byte limit)
# ==================================================
def _pre_hash(password: str) -> bytes:
    """
    Compresses any length password into SHA256 bytes.
    Using raw bytes (digest) instead of hex string (hexdigest) 
    ensures compatibility with passlib's internal handlers.
    """
    return hashlib.sha256(password.encode('utf-8')).digest()


# ==================================================
# 🔥 Password Hashing & Verification
# ==================================================
def verify_password(plain_password: str, hashed_password: str):
    # Pass raw bytes directly to prevent passlib from re-encoding strings
    return pwd_context.verify(_pre_hash(plain_password), hashed_password)

def get_password_hash(password: str):
    # Pass raw bytes directly to ensure we stay under the 72-byte limit
    return pwd_context.hash(_pre_hash(password))


# ==================================================
# 🔥 JWT Generation
# ==================================================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ==================================================
# 🔥 Current User Validation (NEW)
# ==================================================
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Decodes the JWT token for standard HTTP REST routes to verify identity.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract the secure user ID we embedded earlier
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
        # Return a dictionary of the user's basic info
        return {
            "id": user_id,
            "role": payload.get("role", "User"),
            "name": payload.get("name", "Operator")
        }
    except JWTError:
        raise credentials_exception