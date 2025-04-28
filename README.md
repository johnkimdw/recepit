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
   DATABASE_URL=oracle+cx_oracle://username:password@host:port/service_name
   SECRET_KEY=your_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
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

3. Access the API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

# Frontend Setup
**[→ Go to Frontend documentation](./mobile/README.md)**

