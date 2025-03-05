from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from ..serializers import UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework import viewsets

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
