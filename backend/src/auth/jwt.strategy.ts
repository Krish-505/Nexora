import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { tenants, users } from '../database/memory-db';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: 'SUPER_SECRET_KEY',
    });
  }

  validate(payload: any) {
    const user = users.find((entry) => entry.id === payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role !== 'superadmin') {
      const tenant = tenants.find((entry) => entry.id === user.tenantId);

      if (!tenant || tenant.active === false) {
        throw new UnauthorizedException('Tenant account has been deactivated');
      }
    }

    return {
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
