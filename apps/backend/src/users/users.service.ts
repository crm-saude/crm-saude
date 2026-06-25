import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.db.user.findUnique({ where: { email } });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    clinicId: string;
    role: string;
  }) {
    return this.prisma.db.user.create({ data: data as any });
  }

  async findById(id: string) {
    return this.prisma.db.user.findUnique({ where: { id } });
  }
}
