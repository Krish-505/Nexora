import {
  Body,
  Controller,
  Delete,
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
import { UpdateTenantThemeDto } from './dto/update-tenant-theme.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get()
  getTenants(@Req() req: any) {
    return this.tenantsService.getTenants(req.user);
  }

  @Post()
  createTenant(
    @Body()
    body: CreateTenantDto,

    @Req() req: any,
  ) {
    return this.tenantsService.createTenant(body, req.user);
  }

  @Patch(':id/theme')
  updateTenantTheme(
    @Param('id')
    id: string,

    @Body()
    body: UpdateTenantThemeDto,

    @Req() req: any,
  ) {
    return this.tenantsService.updateTenantTheme(id, body, req.user);
  }

  @Patch(':id/toggle')
  toggleTenant(
    @Param('id')
    id: string,

    @Req() req: any,
  ) {
    return this.tenantsService.toggleTenant(id, req.user);
  }

  @Delete(':id')
  deleteTenant(
    @Param('id')
    id: string,

    @Req() req: any,
  ) {
    return this.tenantsService.deleteTenant(id, req.user);
  }
}
