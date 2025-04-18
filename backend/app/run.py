import uvicorn
from app.main import app

if __name__ == "__main__":
    # change host from 127.0.0.1 to 0.0.0.0 so that the backend is listening on all network devices
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)