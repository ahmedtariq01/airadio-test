"""
URL configuration for radiocms project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from authentication.views import CustomTokenObtainPairView
from .apps.airadio.api.views import UpdatePlaylistItemRotation
from .views.library import create_library_item, test_auth
from .views.user import UserViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()

router.register(r'users', UserViewSet, basename='user')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v3/', include('radiocms.apps.airadio.api.urls')),
    path('api/v3/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v3/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/library/items/', create_library_item, name='create_library_item'),
    path('api/library/test-auth/', test_auth, name='test_auth'),
    path('api/', include(router.urls)),
    path('api/playlist-item/<uuid:pk>/update-rotation/', UpdatePlaylistItemRotation.as_view(),
         name="update_playlist_item_rotation"),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
