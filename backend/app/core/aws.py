import boto3
import os
import secrets
from fastapi import HTTPException, FastAPI, UploadFile, File
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
)

def generate_presigned_url():
    image_name = secrets.token_hex(16)
    key = f"images/{image_name}.jpg"
    
    url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": AWS_BUCKET_NAME, "Key": key, "ContentType": "image/jpeg"},
        ExpiresIn=300,
    )
    return {"upload_url": url, 
            "image_url": f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"}

def generate_presigned_url_profile():
    image_name = secrets.token_hex(16)
    key = f"profile/{image_name}.jpg"
    
    url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": AWS_BUCKET_NAME, "Key": key, "ContentType": "image/jpeg"},
        ExpiresIn=300,
    )
    return {"upload_url": url, 
            "image_url": f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"}