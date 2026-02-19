import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../prisma/prisma.service';
import { CrawlerService } from '../crawler/crawler.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private crawlerService: CrawlerService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    await this.syncJobsFromDb();
  }

  /** Синхронизация cron-заданий из БД при старте */
  async syncJobsFromDb() {
    const tasks = await this.prisma.scheduledTask.findMany({
      where: { enabled: true },
    });
    for (const task of tasks) {
      this.addCronJob(task);
    }
    this.logger.log(`Loaded ${tasks.length} scheduled task(s) from DB`);
  }

  /** Добавить cron-задание в реестр (формат: секунды минуты часы день месяц день_недели) */
  addCronJob(task: { id: number; name: string; url: string; cronExpression: string }) {
    const name = this.getJobName(task.id);
    try {
      if (this.schedulerRegistry.doesExist('cron', name)) {
        this.schedulerRegistry.deleteCronJob(name);
      }
      const expression = this.normalizeCronExpression(task.cronExpression);
      const job = new CronJob(expression, () => this.runTask(task.id));
      this.schedulerRegistry.addCronJob(name, job);
      job.start();
      this.logger.debug(`Cron job "${task.name}" (id=${task.id}) registered`);
    } catch (e) {
      this.logger.warn(
        `Invalid cron "${task.cronExpression}" for task ${task.id}: ${e.message}`,
      );
    }
  }

  /** Преобразовать 5-полевой cron в 6-полевой (добавить секунды в начало) */
  private normalizeCronExpression(expr: string): string {
    const parts = expr.trim().split(/\s+/);
    if (parts.length === 5) return `0 ${expr}`;
    return expr;
  }

  /** Удалить cron-задание из реестра */
  removeCronJob(taskId: number) {
    const name = this.getJobName(taskId);
    if (this.schedulerRegistry.doesExist('cron', name)) {
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.debug(`Cron job task-${taskId} removed`);
    }
  }

  private getJobName(taskId: number) {
    return `task-${taskId}`;
  }

  /** Выполнить одно задание по id */
  async runTask(taskId: number) {
    const task = await this.prisma.scheduledTask.findUnique({
      where: { id: taskId },
    });
    if (!task || !task.enabled) return;
    this.logger.log(`Running scheduled task: ${task.name} (${task.url})`);
    try {
      await this.crawlerService.crawlPage(task.url);
      await this.prisma.scheduledTask.update({
        where: { id: taskId },
        data: { lastRunAt: new Date() },
      });
    } catch (err) {
      this.logger.error(`Scheduled task ${taskId} failed: ${err.message}`);
    }
  }
}
