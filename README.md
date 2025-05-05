# Recepit!

Recepit is a social recipe app dedicated to revolutionize the way people discover, make, and share recipes. While there are many recipes on apps such as TikTok, YouTube, and Instagram, the process of watching the video, getting the recipe, and checking out remains fragmented. Some influencers have their recipe in the description, some have their own dedicated website, and others make you comment to receive the recipe. We address these challenges by unifying all these recipes into an app where users are shown recipes in a TikTok (infinite scroll) fashion with likes and comments. 

With a single tap, users can then add recipe ingredients to a grocery list, which they can then checkout to a delivery service like InstaCart. Users can create shared “cookbooks” with friends of the recipes they want to make, and post their own recipes to become a chefluencer.

# Backend Setup
**[→ Go to Backend documentation](./backend/README.md)**
### Backend Prerequisites
- Python 3.8+
- Oracle Database
- Apache HTTP Server

### Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/johnkimdw/recepit.git
   ```

2. Create and activate a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   ```

### Installation
1. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```


2. Create a `.env` file in the root directory to store environment variables:
   ```
      AWS_ACCESS_KEY = xxx
      AWS_SECRET_KEY = xxx
      AWS_BUCKET_NAME = xxx
      AWS_REGION = xxx

      JWT_SECRET_KEY = your-secret-key-for-jwt

      DB_USER = test_user1
      DB_PASSWORD = xxx
      DB_HOST = xxx
      DB_PORT = xxx
      DB_SERVICE = XE
   ```

### Running the Backend
1. Development server with auto-reload:
   ```bash
   uvicorn app.main:app --reload
   ```
   
2. Production server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

3. You can also cd to the backend folder and do this to run the backend
```bash
   python3 -m app.run
```

3. Access the API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

# Frontend Setup
**[→ Go to Frontend documentation](./mobile/README.md)**

