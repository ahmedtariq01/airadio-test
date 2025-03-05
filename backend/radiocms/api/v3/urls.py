from django.urls import path
from fastapi.applications import FastAPI
from .main import app as fastapi_app
from django.http import HttpRequest, HttpResponse
from fastapi.middleware.wsgi import WSGIMiddleware

def fastapi_handler(request: HttpRequest) -> HttpResponse:
    return WSGIMiddleware(fastapi_app)(request)

urlpatterns = [
    path('api/v3/', fastapi_handler),
] 