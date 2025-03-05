from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import  WallViewSet, StationViewSet, FormatViewSet, PodcastViewSet, libraryitemViewSet,\
     PlaylistViewSet, PlaylistItemViewSet, CategoryViewSet

router = DefaultRouter()
# router.register(r'library', LibraryViewSet)
router.register(r'wall', WallViewSet)
router.register(r'stations', StationViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'formats', FormatViewSet)
router.register(r'podcasts', PodcastViewSet)
router.register(r'libraryview', libraryitemViewSet)
router.register(r'playlists', PlaylistViewSet)
router.register(r'playlist-items', PlaylistItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 