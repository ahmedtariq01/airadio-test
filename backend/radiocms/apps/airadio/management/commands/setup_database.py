from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Setup database with required extensions'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Enable pgvector extension
            cursor.execute('CREATE EXTENSION IF NOT EXISTS vector;')
            self.stdout.write(self.style.SUCCESS('Successfully enabled pgvector extension')) 