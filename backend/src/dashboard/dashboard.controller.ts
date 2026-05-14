import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('superadmin')
  getSuperadminStats(@Req() req: any) {
    return this.dashboardService.getSuperadminStats(req.user);
  }

  @Get('tenant')
  getTenantStats(@Req() req: any) {
    return this.dashboardService.getTenantStats(req.user);
  }
}
