import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(clinicId: string, status?: string) {
    return this.prisma.db.patient.findMany({
      where: {
        clinicId,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, clinicId: string) {
    return this.prisma.db.patient.findFirst({
      where: { id, clinicId },
      include: {
        interactions: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(clinicId: string, userId: string, data: any) {
    const clinic = await this.prisma.db.clinic.findUnique({
      where: { id: clinicId },
    });

    if (clinic?.plan === 'SOLO') {
      const count = await this.prisma.db.patient.count({ where: { clinicId } });
      if (count >= 10) {
        throw new Error('LIMIT_REACHED');
      }
    }

    return this.prisma.db.patient.create({
      data: { ...data, clinicId },
    });
  }

  async update(id: string, clinicId: string, data: any) {
    return this.prisma.db.patient.updateMany({
      where: { id, clinicId },
      data,
    });
  }

  async remove(id: string, clinicId: string) {
    return this.prisma.db.patient.deleteMany({
      where: { id, clinicId },
    });
  }

  async getKanban(clinicId: string) {
    const patients = await this.prisma.db.patient.findMany({
      where: { clinicId },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      LEAD: patients.filter((p) => p.status === 'LEAD'),
      CONTACT: patients.filter((p) => p.status === 'CONTACT'),
      SCHEDULED: patients.filter((p) => p.status === 'SCHEDULED'),
      IN_TREATMENT: patients.filter((p) => p.status === 'IN_TREATMENT'),
      INACTIVE: patients.filter((p) => p.status === 'INACTIVE'),
    };
  }
}
