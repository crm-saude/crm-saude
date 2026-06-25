import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private async getClientClinicIds() {
    const adminClinics = await this.prisma.db.user.findMany({
      where: { role: 'ADMIN' },
      select: { clinicId: true },
    });
    const adminClinicIds = adminClinics.map((u) => u.clinicId);
    return adminClinicIds;
  }

  async getStats() {
    const excludeIds = await this.getClientClinicIds();

    const [totalClinics, proClinics, totalPatients, recentClinics] =
      await Promise.all([
        this.prisma.db.clinic.count({ where: { id: { notIn: excludeIds } } }),
        this.prisma.db.clinic.count({
          where: { plan: 'CLINIC', id: { notIn: excludeIds } },
        }),
        this.prisma.db.patient.count({
          where: { clinicId: { notIn: excludeIds } },
        }),
        this.prisma.db.clinic.count({
          where: {
            id: { notIn: excludeIds },
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

    return {
      totalClinics,
      proClinics,
      freeClinics: totalClinics - proClinics,
      totalPatients,
      recentClinics,
    };
  }

  async getClinics() {
    const excludeIds = await this.getClientClinicIds();

    return this.prisma.db.clinic.findMany({
      where: { id: { notIn: excludeIds } },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { patients: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePlan(clinicId: string, plan: string) {
    return this.prisma.db.clinic.update({
      where: { id: clinicId },
      data: { plan: plan as any },
    });
  }
}
