from django.core.management.base import BaseCommand
from radiocms.config.storage import configure_s3_bucket

class Command(BaseCommand):
    help = 'Configure S3 bucket with proper permissions and CORS'

    def handle(self, *args, **options):
        self.stdout.write('Configuring S3 bucket...')
        if configure_s3_bucket():
            self.stdout.write(self.style.SUCCESS('Successfully configured S3 bucket'))
        else:
            self.stdout.write(self.style.ERROR('Failed to configure S3 bucket')) 