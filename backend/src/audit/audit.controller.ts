import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  getLogs(
    @Req() req: any,
    @Query('action') action?: string,
    @Query('role') role?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.auditService.getLogs(req.user, {
      action,
      role,
      tenantId,
    });
  }
}
