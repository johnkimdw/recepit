from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings
from app.crud.user import authenticate_user, create_user
from app.schemas.user import User, UserCreate
from app.schemas.token import Token
from fastapi.responses import JSONResponse
from fastapi import Request
from jose import jwt
from typing import Annotated
from fastapi import Body

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = authenticate_user(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        user.user_id, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        user.user_id, expires_delta=refresh_token_expires
    )

    response = JSONResponse(content={
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user.user_id
    })

    # Set the refresh token as an HttpOnly cookie
    # this can be used in web
    # response.set_cookie(
    #     key="refresh_token",
    #     value=refresh_token,
    #     httponly=True,
    #     secure=True,          # Set True in production with HTTPS
    #     samesite="strict",    # "lax" or "strict" based on your use case
    #     max_age=60*60*24*30,   # 30 days
    #     path="/"
    # )

    return response

@router.post("/register", response_model=dict)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Register a new user
    """
    from app.crud.user import get_user_by_email, get_user_by_username

    print(user_in)
    
    user = get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists",
        )
    
    user = get_user_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this username already exists",
        )
    
    user = create_user(db, user_in)

    # only return the user id
    return {"user_id": user.user_id}

@router.post("/refresh")
def refresh_access_token(
    request_data: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    refresh_token = request_data.get("refresh_token")
    print("refresh_token", refresh_token)
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token", headers={"WWW-Authenticate": "Bearer"})
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found", headers={"WWW-Authenticate": "Bearer"})
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        user.user_id, expires_delta=access_token_expires
    )
    
    return {"access_token": new_access_token, "token_type": "bearer", "user_id": user.user_id}