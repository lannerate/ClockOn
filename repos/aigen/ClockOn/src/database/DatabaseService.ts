// SQLite database service for attendance records

import { open } from 'react-native-quick-sqlite';
import { EmployeeRecord } from '../types';
import {
  DB_NAME,
  DB_VERSION,
  TABLE_EMPLOYEE_RECORDS,
  migrations,
} from './schema';

class DatabaseService {
  private dbInitialized = false;
  private db: any = null;

  async initialize(): Promise<void> {
    if (this.dbInitialized) {
      return;
    }

    try {
      // Open database
      this.db = open({ name: DB_NAME, location: '~' });

      // Run migrations
      await this.runMigrations();

      this.dbInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    try {
      const statements = migrations[DB_VERSION];
      if (!statements) {
        throw new Error(`No migration found for version ${DB_VERSION}`);
      }

      for (const statement of statements) {
        // Execute each SQL statement
        try {
          this.db.execute(statement);
        } catch (e) {
          console.log('Migration statement note:', e);
        }
      }

      console.log(`Migrations run successfully (version ${DB_VERSION})`);
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  private executeSQL(sql: string, params: any[] = []): any {
    try {
      const result = this.db.execute(sql, params);
      return result;
    } catch (error) {
      console.error('SQL execution failed:', error, sql);
      throw error;
    }
  }

  async insertRecord(record: EmployeeRecord): Promise<void> {
    try {
      const sql = `
        INSERT INTO ${TABLE_EMPLOYEE_RECORDS} (
          id, employeeId, timestamp, clockType,
          latitude, longitude, accuracy,
          triggerMethod, platform, appVersion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.executeSQL(sql, [
        record.id,
        record.employeeId,
        record.timestamp,
        record.clockType,
        record.location.latitude,
        record.location.longitude,
        record.location.accuracy || null,
        record.triggerMethod,
        record.deviceInfo.platform,
        record.deviceInfo.appVersion,
      ]);

      console.log('Record inserted:', record.id);
    } catch (error) {
      console.error('Failed to insert record:', error);
      throw error;
    }
  }

  async getAllRecords(employeeId?: string): Promise<EmployeeRecord[]> {
    try {
      let sql = `SELECT * FROM ${TABLE_EMPLOYEE_RECORDS}`;
      const params: any[] = [];

      if (employeeId) {
        sql += ' WHERE employeeId = ?';
        params.push(employeeId);
      }

      sql += ' ORDER BY timestamp DESC';

      const result = this.executeSQL(sql, params);
      return this.mapRowsToRecords(result?.rows?._array || []);
    } catch (error) {
      console.error('Failed to get records:', error);
      throw error;
    }
  }

  async getTodayRecords(employeeId: string): Promise<EmployeeRecord[]> {
    try {
      const sql = `
        SELECT * FROM ${TABLE_EMPLOYEE_RECORDS}
        WHERE employeeId = ?
          AND strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now', 'localtime')
        ORDER BY timestamp DESC
      `;

      const result = this.executeSQL(sql, [employeeId]);
      return this.mapRowsToRecords(result?.rows?._array || []);
    } catch (error) {
      console.error('Failed to get today records:', error);
      throw error;
    }
  }

  async getLastRecord(employeeId: string): Promise<EmployeeRecord | null> {
    try {
      const sql = `
        SELECT * FROM ${TABLE_EMPLOYEE_RECORDS}
        WHERE employeeId = ?
        ORDER BY timestamp DESC
        LIMIT 1
      `;

      const result = this.executeSQL(sql, [employeeId]);
      const records = this.mapRowsToRecords(result?.rows?._array || []);
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('Failed to get last record:', error);
      throw error;
    }
  }

  async getLastClockIn(employeeId: string): Promise<EmployeeRecord | null> {
    try {
      const sql = `
        SELECT * FROM ${TABLE_EMPLOYEE_RECORDS}
        WHERE employeeId = ? AND clockType = 'IN'
        ORDER BY timestamp DESC
        LIMIT 1
      `;

      const result = this.executeSQL(sql, [employeeId]);
      const records = this.mapRowsToRecords(result?.rows?._array || []);
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('Failed to get last clock in:', error);
      throw error;
    }
  }

  async getLastClockOut(employeeId: string): Promise<EmployeeRecord | null> {
    try {
      const sql = `
        SELECT * FROM ${TABLE_EMPLOYEE_RECORDS}
        WHERE employeeId = ? AND clockType = 'OUT'
        ORDER BY timestamp DESC
        LIMIT 1
      `;

      const result = this.executeSQL(sql, [employeeId]);
      const records = this.mapRowsToRecords(result?.rows?._array || []);
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('Failed to get last clock out:', error);
      throw error;
    }
  }

  async deleteRecord(id: string): Promise<void> {
    try {
      const sql = `DELETE FROM ${TABLE_EMPLOYEE_RECORDS} WHERE id = ?`;
      this.executeSQL(sql, [id]);
      console.log('Record deleted:', id);
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw error;
    }
  }

  async deleteAllRecords(employeeId: string): Promise<void> {
    try {
      const sql = `DELETE FROM ${TABLE_EMPLOYEE_RECORDS} WHERE employeeId = ?`;
      this.executeSQL(sql, [employeeId]);
      console.log('All records deleted for employee:', employeeId);
    } catch (error) {
      console.error('Failed to delete all records:', error);
      throw error;
    }
  }

  async getRecordsByMonth(
    employeeId: string,
    year: number,
    month: number
  ): Promise<EmployeeRecord[]> {
    try {
      // month is 1-12, need to format as YYYY-MM
      const monthStr = String(month).padStart(2, '0');
      const sql = `
        SELECT * FROM ${TABLE_EMPLOYEE_RECORDS}
        WHERE employeeId = ?
          AND strftime('%Y-%m', timestamp) = ?
        ORDER BY timestamp ASC
      `;

      const result = this.executeSQL(sql, [employeeId, `${year}-${monthStr}`]);
      return this.mapRowsToRecords(result?.rows?._array || []);
    } catch (error) {
      console.error('Failed to get records by month:', error);
      throw error;
    }
  }

  async getMonthsRecords(employeeId: string): Promise<
    Array<{ year: number; month: number }>
  > {
    try {
      const sql = `
        SELECT DISTINCT
          strftime('%Y', timestamp) as year,
          strftime('%m', timestamp) as month
        FROM ${TABLE_EMPLOYEE_RECORDS}
        WHERE employeeId = ?
        ORDER BY year DESC, month DESC
      `;

      const result = this.executeSQL(sql, [employeeId]);
      const rows = result?.rows?._array || [];

      return rows.map((row) => ({
        year: parseInt(row.year, 10),
        month: parseInt(row.month, 10),
      }));
    } catch (error) {
      console.error('Failed to get months with records:', error);
      throw error;
    }
  }

  async getRecordsCount(employeeId: string): Promise<number> {
    try {
      const sql = `
        SELECT COUNT(*) as count FROM ${TABLE_EMPLOYEE_RECORDS}
        WHERE employeeId = ?
      `;

      const result = this.executeSQL(sql, [employeeId]);
      const rows = result?.rows?._array || [];
      return rows[0]?.count || 0;
    } catch (error) {
      console.error('Failed to get records count:', error);
      throw error;
    }
  }

  private mapRowsToRecords(rows: any[]): EmployeeRecord[] {
    if (!rows || !Array.isArray(rows)) {
      return [];
    }

    return rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      timestamp: row.timestamp,
      clockType: row.clockType,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        accuracy: row.accuracy,
      },
      triggerMethod: row.triggerMethod,
      deviceInfo: {
        platform: row.platform,
        appVersion: row.appVersion,
      },
    }));
  }

  async close(): Promise<void> {
    if (this.db) {
      try {
        this.db.close();
      } catch (e) {
        console.log('DB close note:', e);
      }
      this.dbInitialized = false;
      console.log('Database closed');
    }
  }
}

export default new DatabaseService();
