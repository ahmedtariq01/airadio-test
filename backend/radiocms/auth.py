from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

security = HTTPBearer()
User = get_user_model()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        logger.debug(f"Received credentials: {credentials.credentials[:10]}...")
        token = AccessToken(credentials.credentials)
        logger.debug(f"Token payload: {token.payload}")
        
        user = User.objects.get(id=token['user_id'])
        logger.debug(f"Found user: {user}")
        
        return user
    except TokenError as e:
        logger.error(f"Token error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except User.DoesNotExist as e:
        logger.error(f"User not found: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        ) 