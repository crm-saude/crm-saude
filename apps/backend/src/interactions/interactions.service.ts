import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.db.interaction.create({
      data: { ...data, userId },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.db.interaction.findMany({
      where: { patientId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.db.interaction.delete({ where: { id } });
  }
}
