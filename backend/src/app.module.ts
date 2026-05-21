import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';
import { CategoriesModule } from './categories/categories.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    TenantsModule,
    UsersModule,
    DashboardModule,
    RealtimeModule,
    AuditModule,
    CategoriesModule,
  ],
})
export class AppModule {}
