import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './presentation/modules/auth.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { WarehouseModule } from './presentation/modules/warehouse.module.js';
import { MaterialLocationModule } from './presentation/modules/updateNPL.module.js';
import { PickingOrderModule } from './presentation/modules/picking-order.module.js';
import { FabricInspectionModule } from './presentation/modules/fabric-inspection.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    WarehouseModule,
    MaterialLocationModule,
    PickingOrderModule,
    FabricInspectionModule,
  ],
})
export class AppModule {}
