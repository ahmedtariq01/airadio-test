from django.conf import settings
import boto3
from botocore.exceptions import ClientError
import json
import logging

logger = logging.getLogger(__name__)

def get_s3_client():
    """
    Get configured S3 client with proper credentials
    """
    return boto3.client('s3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )

def configure_s3_bucket():
    """
    Create and configure S3 bucket with proper permissions and CORS
    """
    s3 = get_s3_client()
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    
    try:
        # Check if bucket exists
        try:
            s3.head_bucket(Bucket=bucket_name)
            logger.info(f"Bucket {bucket_name} already exists")
        except ClientError as e:
            error_code = int(e.response['Error']['Code'])
            if error_code == 404:
                # Create bucket if it doesn't exist
                logger.info(f"Creating bucket {bucket_name}...")
                s3.create_bucket(Bucket=bucket_name)
                logger.info(f"Bucket {bucket_name} created successfully")
            else:
                raise

        # First, disable block public access at bucket level
        logger.info("Configuring public access settings...")
        s3.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': False,
                'IgnorePublicAcls': False,
                'BlockPublicPolicy': False,
                'RestrictPublicBuckets': False
            }
        )
        logger.info("Public access configuration set successfully")

        # Wait a moment for settings to propagate
        import time
        time.sleep(2)

        # Set bucket policy
        logger.info("Setting bucket policy...")
        bucket_policy = {
            'Version': '2012-10-17',
            'Statement': [{
                'Sid': 'PublicReadGetObject',
                'Effect': 'Allow',
                'Principal': '*',
                'Action': [
                    's3:GetObject',
                    's3:PutObject'
                ],
                'Resource': f'arn:aws:s3:::{bucket_name}/*'
            }]
        }
        s3.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(bucket_policy)
        )
        logger.info("Bucket policy set successfully")

        # Set CORS configuration
        logger.info("Setting CORS configuration...")
        cors_configuration = {
            'CORSRules': [{
                'AllowedHeaders': ['*'],
                'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                'AllowedOrigins': ['*'],
                'ExposeHeaders': ['ETag'],
                'MaxAgeSeconds': 3000
            }]
        }
        s3.put_bucket_cors(
            Bucket=bucket_name,
            CORSConfiguration=cors_configuration
        )
        logger.info("CORS configuration set successfully")

        return True
    except Exception as e:
        logger.error(f"Error configuring S3 bucket: {str(e)}")
        return False 