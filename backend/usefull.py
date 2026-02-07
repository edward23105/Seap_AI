from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Generator, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from database import sessionMaker

from ollama import ChatResponse
from ollama import generate


# ─────────────────────────────────────────────────────────
# DB SESSION
# ─────────────────────────────────────────────────────────

def get_session() -> Generator:
    """
    FastAPI dependency that yields a SQLAlchemy session and
    always closes it afterwards.
    """
    session = sessionMaker()
    try:
        yield session
    finally:
        session.close()


# ─────────────────────────────────────────────────────────
# PASSWORD HASHING (ARGON2)
# ─────────────────────────────────────────────────────────

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ─────────────────────────────────────────────────────────
# JWT CONFIG
# ─────────────────────────────────────────────────────────

# For production, load from env:
#   SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
SECRET_KEY = ""
ALGORITHM = "HS256"
DEFAULT_EXPIRE_HOURS = 1


# ─────────────────────────────────────────────────────────
# JWT HELPERS
# ─────────────────────────────────────────────────────────

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT with an `exp` claim.
    Keeps your original function name for compatibility.
    """
    to_encode = data.copy()

    if expires_delta is None:
        expires_delta = timedelta(hours=DEFAULT_EXPIRE_HOURS)

    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def refresh_token(jwt_token: str) -> Optional[str]:
    """
    Try to refresh a token. If valid or expired, returns a new token
    with the same payload (id, username, etc.) but a new expiration.
    If invalid, returns None.
    """
    try:
        # We want the payload even if token expired -> disable exp check
        payload = jwt.decode(
            jwt_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_exp": False},
        )
    except JWTError:
        # Completely invalid token
        return None

    # Remove old exp if present
    payload.pop("exp", None)

    # Create a fresh token
    new_token = create_access_token(payload, timedelta(hours=DEFAULT_EXPIRE_HOURS))
    return new_token


def verify_token(jwt_token: str) -> Dict[str, Any]:
    """
    Verify a token, raising on error.
    Your routers can catch these errors and return HTTPException.
    """
    try:
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        # For you: log e somewhere if you want
        raise e


# ─────────────────────────────────────────────────────────
# SUMMARIZE HELPER
# ─────────────────────────────────────────────────────────


def summarize_func(text,type):
    prop = ""
    if(type == "titlu"):
        prop = "un titlu in max 7 cuvinte"
    elif(type == "descriere"):
        prop = "o descriere scurta in max 15 cuvinte"

    stream = generate(
        model= 'raaec/llama3.1-8b-instruct-summarize',
        prompt= f"Fa din textul urmator {prop} :\n\n{text}\n\nSummary:",
        stream= True,
        )
    summarized_data = ""
    for chunk in stream:
        part = chunk.get("response","")
        summarized_data = summarized_data + part

    return summarized_data

