import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TenantsService } from './tenants.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  // ─── GET TENANTS ──────────────────────
  @Get()
  getTenants(@Req() req: any) {
    return this.tenantsService.getTenants(req.user);
  }

  // ─── CREATE TENANT ────────────────────
  @Post()
  createTenant(
    @Body()
    body: CreateTenantDto,

    @Req() req: any,
  ) {
    return this.tenantsService.createTenant(body, req.user);
  }

  // ─── TOGGLE TENANT ────────────────────
  @Patch(':id/toggle')
  toggleTenant(
    @Param('id')
    id: string,

    @Req() req: any,
  ) {
    return this.tenantsService.toggleTenant(id, req.user);
  }
}
