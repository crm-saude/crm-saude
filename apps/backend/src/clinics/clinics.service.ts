import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.db.clinic.create({ data: { name } });
  }

  async findById(id: string) {
    return this.prisma.db.clinic.findUnique({ where: { id } });
  }
}
