from datetime import timedelta
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
)
from sqlalchemy.orm import Session

from database import User
from datamodels import AuthRequest, DataRequest, ToSum
from search import get_data
from usefull import summarize ,get_session, pwd_context, create_access_token, verify_token

router = APIRouter()


# ---------- Helper utilities ---------- #

def _extract_bearer_token(authorization: Optional[str]) -> str:
    """
    Extracts the JWT token from an Authorization header of the form:
        Authorization: Bearer <token>
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    return parts[1]


def _get_user_from_token(token: str, db: Session) -> User:
    """
    Decodes the JWT and returns the corresponding user from DB.
    Raises HTTPException on any error.
    """
    try:
        payload = verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    username = payload.get("username")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ---------- Auth endpoints ---------- #

@router.post("/auth_user", status_code=201)
def auth_user(
    data: AuthRequest,
    db: Session = Depends(get_session),
):
    """
    type = 1  -> register new user
    type = 0  -> login existing user
    """
    if data.type == 1:
        return _create_user(db, data)
    elif data.type == 0:
        return _login_user(db, data)

    raise HTTPException(status_code=400, detail="Invalid 'type' field. Use 1 for signup, 0 for login.")


def _create_user(db: Session, user: AuthRequest):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, password=hashed_password, email=user.email)

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        # Optional: log error properly instead of print
        print("Error creating user:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Error creating the user.")

    jwt = create_access_token(
        {"id": db_user.id, "username": db_user.username},
        timedelta(hours=1),
    )
    return {"jwt": jwt}


def _login_user(db: Session, user: AuthRequest):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="Could not find a user with that email.")

        if not pwd_context.verify(user.password, db_user.password):
            raise HTTPException(status_code=400, detail="Wrong password.")

        jwt = create_access_token(
            {"id": db_user.id, "username": db_user.username},
            timedelta(hours=1),
        )
        return {"jwt": jwt}

    except HTTPException:
        # rethrow cleanly
        raise
    except Exception as e:
        print("Error during login:", e)
        raise HTTPException(status_code=500, detail="Login error")


# ---------- Business endpoints ---------- #

@router.post("/get_reports", status_code=200)
def get_reports(
    data: DataRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_session),
):
    """
    Returns filtered ES results based on DataRequest.
    Frontend expects response of shape: { "deals": [...] }.
    """
    token = _extract_bearer_token(authorization)
    _ = _get_user_from_token(token, db)  # we don't use the user yet, but we validate it

    deals = get_data(
        size=data.size,
        sort_by=data.sort_by,
        order=data.order,
        cpv=data.cpv,
        minvalue=data.minvalue,
        maxvalue=data.maxvalue,
        keywords=data.keywords,
        date=data.date,
    )
    
    
    return {"deals": deals}


@router.post("/verify_jwt", status_code=202)
def verify_jwt(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_session),
):
    """
    Verifies that a JWT is valid and belongs to an existing user.
    """
    token = _extract_bearer_token(authorization)
    _ = _get_user_from_token(token, db)
    return {"msg": "ok"}


@router.post("/refresh_jwt", status_code=200)
def refresh_token(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_session),
):
    """
    Refreshes an existing valid JWT with a new one (extends expiry).
    """
    token = _extract_bearer_token(authorization)
    user = _get_user_from_token(token, db)

    new_jwt = create_access_token(
        {"id": user.id, "username": user.username},
        timedelta(hours=1),
    )
    return {"jwt": new_jwt}

@router.post("/summarize",status_code= 200)
def summarize_data(data: ToSum):
    
    title_sum = summarize(ToSum.title,"titlu")
    description_sum = summarize(ToSum.description, "descriere")
    
    
    return {"title": title_sum, "description": description_sum}