import boto3
from django.conf import settings
import uuid
import logging
from django.core.files.base import File
from botocore.exceptions import ClientError
import io

logger = logging.getLogger(__name__)

def upload_to_s3(file, folder):
    """
    Upload a file to S3 and return its URL
    """
    if not file:
        logger.warning(f"No file provided for {folder} upload")
        return None

    try:
        # Log AWS settings (without sensitive info)
        logger.info(f"AWS Settings: Region={settings.AWS_S3_REGION_NAME}, Bucket={settings.AWS_STORAGE_BUCKET_NAME}")
        logger.info(f"AWS Credentials present: Access Key={'Yes' if settings.AWS_ACCESS_KEY_ID else 'No'}, Secret Key={'Yes' if settings.AWS_SECRET_ACCESS_KEY else 'No'}")

        # Initialize S3 client
        s3 = boto3.client('s3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        # Test S3 connection and bucket permissions
        try:
            s3.head_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
            logger.info("Successfully connected to S3 bucket")
            
            # Test bucket permissions by trying to list objects
            s3.list_objects_v2(Bucket=settings.AWS_STORAGE_BUCKET_NAME, MaxKeys=1)
            logger.info("Successfully verified bucket permissions")
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            if error_code == '403':
                logger.error("Permission denied accessing bucket")
            elif error_code == '404':
                logger.error("Bucket not found")
            else:
                logger.error(f"Failed to connect to S3 bucket: {str(e)}")
            return None
        
        # Generate unique filename
        ext = file.name.split('.')[-1].lower()
        filename = f"{folder}/{uuid.uuid4()}.{ext}"
        
        logger.info(f"Uploading {file.name} to S3 as {filename}")
        logger.info(f"File type: {type(file)}")
        logger.info(f"File content type: {getattr(file, 'content_type', 'unknown')}")
        logger.info(f"File size: {file.size if hasattr(file, 'size') else 'unknown'} bytes")
        
        try:
            # Try to read the file content
            if hasattr(file, 'temporary_file_path'):
                # For TemporaryUploadedFile
                logger.info("Using TemporaryUploadedFile path")
                with open(file.temporary_file_path(), 'rb') as f:
                    file_content = f.read()
            elif hasattr(file, 'read'):
                # For InMemoryUploadedFile
                logger.info("Using InMemoryUploadedFile read")
                file_content = file.read()
                file.seek(0)
            else:
                logger.error(f"Unsupported file type: {type(file)}")
                return None

            # Create a BytesIO object
            file_obj = io.BytesIO(file_content)
            
            # Upload to S3
            logger.info(f"Starting S3 upload for {filename}")
            try:
                s3.upload_fileobj(
                    file_obj,
                    settings.AWS_STORAGE_BUCKET_NAME,
                    filename,
                    ExtraArgs={
                        'ContentType': getattr(file, 'content_type', 'application/octet-stream')
                    }
                )
                logger.info("S3 upload completed successfully")
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', '')
                logger.error(f"S3 upload failed with error code {error_code}: {str(e)}")
                return None
            
            # Generate and return the URL
            url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{filename}"
            logger.info(f"File uploaded successfully. URL: {url}")
            
            # Verify the uploaded file is accessible
            try:
                s3.head_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=filename)
                logger.info("Successfully verified uploaded file")
                return url
            except ClientError as e:
                logger.error(f"Failed to verify uploaded file: {str(e)}")
                return None

        except Exception as e:
            logger.error(f"Error reading file content: {str(e)}", exc_info=True)
            return None

    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', '')
        logger.error(f"AWS S3 error ({error_code}): {str(e)}")
        if error_code == 'NoSuchBucket':
            logger.error(f"Bucket {settings.AWS_STORAGE_BUCKET_NAME} does not exist")
        elif error_code == 'InvalidAccessKeyId':
            logger.error("Invalid AWS access key")
        elif error_code == 'SignatureDoesNotMatch':
            logger.error("Invalid AWS secret key")
        elif error_code == 'AccessDenied':
            logger.error("Access denied to S3 bucket")
        return None
    except Exception as e:
        logger.error(f"Error uploading file to S3: {str(e)}", exc_info=True)
        return None 