import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { users, tenants } from '../database/memory-db';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // ─── LOGIN ────────────────────────────
  login(email: string, password: string) {
    const user = users.find(
      (user) => user.email === email && user.password === password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tenant = tenants.find((tenant) => tenant.id === user.tenantId);

    if (user.role !== 'superadmin' && (!tenant || tenant.active === false)) {
      throw new UnauthorizedException('Tenant account has been deactivated');
    }

    const payload = {
      userId: user.id,

      role: user.role,

      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,

      user: {
        id: user.id,

        email: user.email,

        role: user.role,

        tenantId: user.tenantId,

        tenantName: tenant?.name || '',
      },
    };
  }

  // ─── GET CURRENT USER ─────────────────
  getProfile(userPayload: any) {
    const user = users.find((user) => user.id === userPayload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tenant = tenants.find((tenant) => tenant.id === user.tenantId);

    if (user.role !== 'superadmin' && (!tenant || tenant.active === false)) {
      throw new UnauthorizedException('Tenant account has been deactivated');
    }

    return {
      id: user.id,

      email: user.email,

      role: user.role,

      tenantId: user.tenantId,

      tenantName: tenant?.name || '',
    };
  }
}
