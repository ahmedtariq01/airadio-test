# airadioplayer-cms

## Project Goals

Modernize existing AI Radio Player CMS while maintaining core functionality:

- Use existing Django backend and extend with new features
- Create modern UI with Next.js 14
- Host backend and frontend in same Docker container
- Use existing Neon PostgreSQL (with pgvector) on Vercel
- Maintain AWS S3 media storage
- Swagger/OpenAPI for documentation

### Frontend (Modern UI)
- shadcn/ui components
- Color scheme: teal-600 for buttons
- Font: Figtree

### Daily Development

1. Start environment: `docker-compose up`
2. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin: http://localhost:8000/admin
   - Swagger: http://localhost:8000/api/docs

## API Documentation
- All endpoints documented with Swagger/OpenAPI
- Authentication using JWT
- File upload endpoints for S3
- Scheduling endpoints for radio management

## Success Criteria

- [ ] Existing functionality preserved
- [ ] Modern UI implemented
- [ ] Hot reload working in development
- [ ] API fully documented
- [ ] S3 integration maintained
- [ ] Scheduling system operational
- [ ] Import/export functionality working
- [ ] Search with popularity ranking implemented

## New features:

1. Music Format Tags
2. Mass Import Functionality
   - Skip if item title/artist exists
   - Tidal integration for imports

# airadio-test
