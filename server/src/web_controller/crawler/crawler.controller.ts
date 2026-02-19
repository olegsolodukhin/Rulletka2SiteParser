import { Controller, Get, Post, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('crawl')
  async crawl(@Body('url') url: string) {
    if (!url) {
      throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.crawlerService.crawlPage(url);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pages')
  async getPages() {
    const pages = await this.crawlerService.getCrawledPages();
    return {
      success: true,
      data: pages,
    };
  }

  @Get('pages/:id')
  async getPage(@Param('id') id: string) {
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) {
      throw new HttpException('Invalid page ID', HttpStatus.BAD_REQUEST);
    }

    const page = await this.crawlerService.getCrawledPage(pageId);
    if (!page) {
      throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
    }
    return {
      success: true,
      data: page,
    };
  }

  @Delete('pages/:id')
  async deletePage(@Param('id') id: string) {
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) {
      throw new HttpException('Invalid page ID', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.crawlerService.deleteCrawledPage(pageId);
      return {
        success: true,
        message: 'Page deleted successfully',
      };
    } catch (error) {
      throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('jobs')
  async getJobs() {
    const jobs = await this.crawlerService.getCrawlJobs();
    return {
      success: true,
      data: jobs,
    };
  }
}
