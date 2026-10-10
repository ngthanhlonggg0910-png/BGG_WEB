import { Module } from '@nestjs/common';
import { AuthModule } from './presentation/modules/auth.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { ConfigModule } from '@nestjs/config';
import { WarehouseModule } from './presentation/modules/warehouse.module.js';
import { BasketLocationModule } from './presentation/modules/basket.module.js';
import { MaterialLocationModule } from './presentation/modules/MaterialToBasket.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    WarehouseModule,
    BasketLocationModule,
    MaterialLocationModule,
  ],
})
export class AppModule {}
