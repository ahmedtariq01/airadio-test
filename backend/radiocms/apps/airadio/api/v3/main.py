from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import music, stations, playlists

app = FastAPI(
    title="AI Radio API",
    description="API for AI Radio Player CMS",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(music.router)
app.include_router(stations.router)
app.include_router(playlists.router) 