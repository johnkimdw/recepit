import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Import all models first
from app.models.user import User, follows
from app.models.recipe import Recipe
from app.models.category import Category
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.favorite import Favorite
from app.models.review import Review

from app.core.database import get_db, Base
from app.core.security import get_password_hash, create_access_token
from app.core.config import settings

# Create database engine for testing
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import app after model imports to avoid circular dependencies
from app.main import app

@pytest.fixture(scope="function")
def db():
    # Create a new session for each test
    connection = engine.connect()
    # Start a transaction - this won't commit to the real database
    transaction = connection.begin()
    
    # Create a session bound to this connection
    session = TestingSessionLocal(bind=connection)
    
    try:
        yield session
    finally:
        session.close()
        # Roll back the transaction - this undoes any changes
        transaction.rollback()
        connection.close()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == "test@example.com").first()
    if existing_user:
        return existing_user
    
    # Get the next value from the user_id sequence
    user_id_query = db.execute(text("SELECT USER_ID_SEQ.NEXTVAL FROM DUAL")).scalar()
    
    user = User(
        user_id=user_id_query,
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("password123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_user2(db):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == "test2@example.com").first()
    if existing_user:
        return existing_user
    
    # Get the next value from the user_id sequence
    user_id_query = db.execute(text("SELECT USER_ID_SEQ.NEXTVAL FROM DUAL")).scalar()
    
    user = User(
        user_id=user_id_query,
        username="testuser2",
        email="test2@example.com",
        password_hash=get_password_hash("password123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def token(test_user):
    return create_access_token(subject=test_user.user_id)

@pytest.fixture
def test_headers(token):
    return {"Authorization": f"Bearer {token}"}

# Import the user crud functions directly for creating UserWithFollow objects
from app.crud.user import get_follow_stats
from app.schemas.user import UserWithFollow, User as UserSchema

def test_read_users(client, test_user):
    response = client.get(f"{settings.API_V1_STR}/users/")
    assert response.status_code == 200
    users = response.json()
    assert len(users) >= 1
    assert any(user["username"] == "testuser" for user in users)

def test_read_user(client, test_user, db):
    # Call endpoint
    response = client.get(f"{settings.API_V1_STR}/users/{test_user.user_id}")
    assert response.status_code == 200
    data = response.json()
    
    # Basic assertions
    assert data["username"] == test_user.username
    assert data["email"] == test_user.email
    assert "followers_count" in data
    assert "following_count" in data

def test_read_user_not_found(client):
    response = client.get(f"{settings.API_V1_STR}/users/999")
    assert response.status_code == 404

def test_read_user_me(client, test_headers):
    response = client.get(
        f"{settings.API_V1_STR}/users/me",
        headers=test_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "followers_count" in data
    assert "following_count" in data

def test_update_user_me(client, test_headers):
    response = client.put(
        f"{settings.API_V1_STR}/users/me",
        headers=test_headers,
        json={"username": "newusername"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newusername"

def test_follow_user(client, test_user, test_user2, test_headers, db):
    response = client.post(
        f"{settings.API_V1_STR}/users/follow/{test_user2.user_id}",
        headers=test_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User followed successfully"
    
    # Check follow relationship exists in DB
    follow = db.query(follows).filter(
        follows.c.follower_id == test_user.user_id,
        follows.c.following_id == test_user2.user_id
    ).first()
    assert follow is not None

def test_follow_user_already_following(client, test_user, test_user2, test_headers, db):
    # Create follow relationship
    db.execute(
        follows.insert().values(
            follower_id=test_user.user_id,
            following_id=test_user2.user_id
        )
    )
    db.commit()
    
    # Try to follow again
    response = client.post(
        f"{settings.API_V1_STR}/users/follow/{test_user2.user_id}",
        headers=test_headers
    )
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Already following this user"

def test_follow_self(client, test_user, test_headers):
    response = client.post(
        f"{settings.API_V1_STR}/users/follow/{test_user.user_id}",
        headers=test_headers
    )
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Cannot follow yourself"

def test_unfollow_user(client, test_user, test_user2, test_headers, db):
    # Create follow relationship
    db.execute(
        follows.insert().values(
            follower_id=test_user.user_id,
            following_id=test_user2.user_id
        )
    )
    db.commit()
    
    response = client.post(
        f"{settings.API_V1_STR}/users/unfollow/{test_user2.user_id}",
        headers=test_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User unfollowed successfully"
    
    # Check follow relationship no longer exists
    follow = db.query(follows).filter(
        follows.c.follower_id == test_user.user_id,
        follows.c.following_id == test_user2.user_id
    ).first()
    assert follow is None

def test_unfollow_user_not_following(client, test_user, test_user2, test_headers):
    response = client.post(
        f"{settings.API_V1_STR}/users/unfollow/{test_user2.user_id}",
        headers=test_headers
    )
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not following this user"

def test_unfollow_self(client, test_user, test_headers):
    response = client.post(
        f"{settings.API_V1_STR}/users/unfollow/{test_user.user_id}",
        headers=test_headers
    )
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Cannot unfollow yourself"