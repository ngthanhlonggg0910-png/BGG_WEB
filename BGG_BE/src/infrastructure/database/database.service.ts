import { Injectable, OnModuleDestroy } from '@nestjs/common';
import sql from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: sql.ConnectionPool | null = null;

  async getPool(): Promise<sql.ConnectionPool> {
    if (this.pool?.connected) {
      return this.pool;
    }

    const config: sql.config = {
      server: process.env.DB_SERVER!,
      port: Number(process.env.DB_PORT ?? 1433),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_DATABASE!,

      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
      },

      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    this.pool = await new sql.ConnectionPool(config).connect();

    console.log('SQL Server connected');

    return this.pool;
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close();
    }
  }

  async testConnection() {
    const pool = await this.getPool();

    const result = await pool.request().query(`
    SELECT GETDATE() AS ServerTime
  `);

    return result.recordset;
  }
}
