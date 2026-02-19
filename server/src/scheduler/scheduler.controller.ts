import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerService: SchedulerService,
  ) {}

  /** Список всех периодических заданий */
  @Get('tasks')
  async getTasks() {
    const tasks = await this.prisma.scheduledTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: tasks };
  }

  /** Получить задание по id */
  @Get('tasks/:id')
  async getTask(@Param('id') id: string) {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      throw new HttpException('Invalid task ID', HttpStatus.BAD_REQUEST);
    }
    const task = await this.prisma.scheduledTask.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return { success: true, data: task };
  }

  /** Создать периодическое задание */
  @Post('tasks')
  async createTask(
    @Body() body: { name: string; url: string; cronExpression: string },
  ) {
    const { name, url, cronExpression } = body;
    if (!name || !url || !cronExpression) {
      throw new HttpException(
        'name, url and cronExpression are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const task = await this.prisma.scheduledTask.create({
      data: { name, url, cronExpression, enabled: true },
    });
    if (task.enabled) {
      this.schedulerService.addCronJob(task);
    }
    return { success: true, data: task };
  }

  /** Обновить задание */
  @Put('tasks/:id')
  async updateTask(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      url?: string;
      cronExpression?: string;
      enabled?: boolean;
    },
  ) {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      throw new HttpException('Invalid task ID', HttpStatus.BAD_REQUEST);
    }
    const existing = await this.prisma.scheduledTask.findUnique({
      where: { id: taskId },
    });
    if (!existing) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    const task = await this.prisma.scheduledTask.update({
      where: { id: taskId },
      data: body,
    });
    this.schedulerService.removeCronJob(taskId);
    if (task.enabled) {
      this.schedulerService.addCronJob(task);
    }
    return { success: true, data: task };
  }

  /** Удалить задание */
  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      throw new HttpException('Invalid task ID', HttpStatus.BAD_REQUEST);
    }
    const task = await this.prisma.scheduledTask.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    this.schedulerService.removeCronJob(taskId);
    await this.prisma.scheduledTask.delete({ where: { id: taskId } });
    return { success: true, message: 'Task deleted' };
  }

  /** Запустить задание сейчас (вручную) */
  @Post('tasks/:id/run')
  async runTaskNow(@Param('id') id: string) {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      throw new HttpException('Invalid task ID', HttpStatus.BAD_REQUEST);
    }
    const task = await this.prisma.scheduledTask.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    try {
      await this.schedulerService.runTask(taskId);
      return { success: true, message: 'Task run completed' };
    } catch (err) {
      throw new HttpException(
        { success: false, error: err.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
