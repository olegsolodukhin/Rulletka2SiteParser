# Rulletka2SiteParser

A NestJS-based web crawler with Prisma and Playwright integration for crawling and storing website data.

## Features

- 🚀 NestJS framework for scalable architecture
- 🗄️ Prisma ORM for database management
- 🎭 Playwright for reliable web scraping
- 📊 SQLite database (easily switchable to PostgreSQL/MySQL)
- 🔄 REST API for crawler operations
- 📝 Job tracking for crawl operations

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/olegsolodukhin/Rulletka2SiteParser.git
cd Rulletka2SiteParser
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

4. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

## Usage

### Development mode
```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

### Production mode
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Crawl a page
```bash
POST /crawler/crawl
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Get all crawled pages
```bash
GET /crawler/pages
```

### Get a specific page
```bash
GET /crawler/pages/:id
```

### Delete a crawled page
```bash
DELETE /crawler/pages/:id
```

### Get all crawl jobs
```bash
GET /crawler/jobs
```

## Example Usage

### Using cURL:
```bash
# Crawl a website
curl -X POST http://localhost:3000/crawler/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Get all crawled pages
curl http://localhost:3000/crawler/pages

# Get crawl jobs
curl http://localhost:3000/crawler/jobs
```

### Using JavaScript (fetch):
```javascript
// Crawl a page
const response = await fetch('http://localhost:3000/crawler/crawl', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ url: 'https://example.com' }),
});
const data = await response.json();
console.log(data);
```

## Database Schema

### CrawledPage
- `id`: Unique identifier
- `url`: URL of the crawled page (unique)
- `title`: Page title
- `content`: Full HTML content
- `metadata`: JSON string of meta tags
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### CrawlJob
- `id`: Unique identifier
- `url`: URL to crawl
- `status`: Job status (pending, running, completed, failed)
- `error`: Error message if failed
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Development

### Project Structure
```
src/
├── crawler/           # Crawler module
│   ├── crawler.controller.ts
│   ├── crawler.service.ts
│   └── crawler.module.ts
├── prisma/           # Prisma module
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts     # Root module
└── main.ts           # Application entry point
```

### Database Management
```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Switching to PostgreSQL

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
}
```

2. Update `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Run migrations:
```bash
npm run prisma:migrate
```

## License

ISC
