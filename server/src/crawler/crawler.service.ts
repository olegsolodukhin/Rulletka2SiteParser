import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { chromium, Browser } from 'playwright';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrawlerService implements OnModuleDestroy {
  private browser: Browser;

  constructor(private prisma: PrismaService) {}

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  async crawlPage(url: string): Promise<any> {
    // Create a crawl job
    const job = await this.prisma.crawlJob.create({
      data: {
        url,
        status: 'running',
      },
    });

    let page;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();

      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle' });

      // Extract page data
      const title = await page.title();
      const content = await page.content();
      
      // Extract metadata
      const metadata = await page.evaluate(() => {
        const metaTags = Array.from(document.querySelectorAll('meta'));
        return JSON.stringify(
          metaTags.map(tag => ({
            name: tag.getAttribute('name'),
            property: tag.getAttribute('property'),
            content: tag.getAttribute('content'),
          }))
        );
      });

      // Save the crawled page
      const crawledPage = await this.prisma.crawledPage.upsert({
        where: { url },
        update: {
          title,
          content,
          metadata,
          updatedAt: new Date(),
        },
        create: {
          url,
          title,
          content,
          metadata,
        },
      });

      // Update job status
      await this.prisma.crawlJob.update({
        where: { id: job.id },
        data: { status: 'completed' },
      });

      return {
        jobId: job.id,
        pageId: crawledPage.id,
        url: crawledPage.url,
        title: crawledPage.title,
        status: 'completed',
      };
    } catch (error) {
      // Update job with error
      await this.prisma.crawlJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: error.message,
        },
      });

      throw error;
    } finally {
      // Ensure page is closed even if an error occurs
      if (page) {
        await page.close();
      }
    }
  }

  async getCrawledPages() {
    return this.prisma.crawledPage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCrawlJobs() {
    return this.prisma.crawlJob.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCrawledPage(id: number) {
    return this.prisma.crawledPage.findUnique({
      where: { id },
    });
  }

  async deleteCrawledPage(id: number) {
    return this.prisma.crawledPage.delete({
      where: { id },
    });
  }
}
