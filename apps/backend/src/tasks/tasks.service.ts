import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(clinicId: string) {
    return this.prisma.db.task.findMany({
      where: { clinicId },
      include: {
        patient: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: [{ urgent: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async findToday(clinicId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.db.task.findMany({
      where: {
        clinicId,
        done: false,
        OR: [{ dueDate: { gte: today, lt: tomorrow } }, { dueDate: null }],
      },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: [{ urgent: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async create(userId: string, clinicId: string, data: any) {
    return this.prisma.db.task.create({
      data: { ...data, userId, clinicId },
    });
  }

  async toggleDone(id: string, clinicId: string) {
    const task = await this.prisma.db.task.findFirst({
      where: { id, clinicId },
    });
    if (!task) return null;
    return this.prisma.db.task.update({
      where: { id },
      data: { done: !task.done },
    });
  }

  async remove(id: string, clinicId: string) {
    return this.prisma.db.task.deleteMany({ where: { id, clinicId } });
  }
}
