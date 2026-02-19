/**
 * TypeScript example demonstrating how to use the crawler API
 * 
 * This is a type-safe example showing API interactions
 */

interface CrawlResponse {
  success: boolean;
  data?: {
    jobId: number;
    pageId: number;
    url: string;
    title: string;
    status: string;
  };
  error?: string;
}

interface Page {
  id: number;
  url: string;
  title: string;
  content: string;
  metadata: string;
  createdAt: string;
  updatedAt: string;
}

interface PagesResponse {
  success: boolean;
  data: Page[];
}

interface Job {
  id: number;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface JobsResponse {
  success: boolean;
  data: Job[];
}

class CrawlerClient {
  constructor(private baseUrl: string = 'http://localhost:3000') {}

  async crawlWebsite(url: string): Promise<CrawlResponse> {
    const response = await fetch(`${this.baseUrl}/crawler/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    return response.json();
  }

  async getAllPages(): Promise<PagesResponse> {
    const response = await fetch(`${this.baseUrl}/crawler/pages`);
    return response.json();
  }

  async getPage(id: number): Promise<{ success: boolean; data: Page }> {
    const response = await fetch(`${this.baseUrl}/crawler/pages/${id}`);
    return response.json();
  }

  async deletePage(id: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/crawler/pages/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async getAllJobs(): Promise<JobsResponse> {
    const response = await fetch(`${this.baseUrl}/crawler/jobs`);
    return response.json();
  }
}

// Example usage
async function example() {
  const client = new CrawlerClient();

  // Crawl a website
  const crawlResult = await client.crawlWebsite('https://example.com');
  console.log('Crawl result:', crawlResult);

  // Get all pages
  const pages = await client.getAllPages();
  console.log('All pages:', pages);

  // Get a specific page
  if (pages.data.length > 0) {
    const page = await client.getPage(pages.data[0].id);
    console.log('Page details:', page);
  }

  // Get all jobs
  const jobs = await client.getAllJobs();
  console.log('All jobs:', jobs);
}

export { CrawlerClient, CrawlResponse, Page, Job };
