import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ClinicsService } from '../clinics/clinics.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private clinicsService: ClinicsService,
    private jwtService: JwtService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
    clinicName: string,
  ) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const clinic = await this.clinicsService.create(clinicName);
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      name,
      email,
      password: hashed,
      clinicId: clinic.id,
      role: 'OWNER',
    });

    const token = this.jwtService.sign({
      sub: user.id,
      clinicId: clinic.id,
      role: user.role,
    });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.jwtService.sign({
      sub: user.id,
      clinicId: user.clinicId,
      role: user.role,
    });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
