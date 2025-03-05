from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import StationSerializer
from .models import Station

class StationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Station.objects.all()
    serializer_class = StationSerializer 