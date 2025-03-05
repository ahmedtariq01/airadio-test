from fastapi import FastAPI
from .library import router as library_router

app = FastAPI()

app.include_router(
    library_router,
    prefix="/library",
    tags=["library"]
) 