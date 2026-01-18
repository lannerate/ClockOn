// Monthly statistics service for attendance tracking

import DatabaseService from '../database/DatabaseService';
import { MonthlyStats, EmployeeRecord } from '../types';

class MonthlyStatsService {
  /**
   * Get working days for a month (excluding weekends)
   * Default: Monday-Friday are working days
   */
  private getWorkingDaysInMonth(year: number, month: number): number {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();
    let workingDays = 0;

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      // Count Monday-Friday (1-5) as working days
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      }
    }

    return workingDays;
  }

  /**
   * Get unique days with clock-in records for a month
   */
  private getUniqueDaysClocked(records: EmployeeRecord[]): number {
    const uniqueDays = new Set<string>();

    records.forEach((record) => {
      const date = new Date(record.timestamp);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      uniqueDays.add(dateKey);
    });

    return uniqueDays.size;
  }

  /**
   * Calculate total hours worked from records
   */
  private calculateTotalHours(records: EmployeeRecord[]): number {
    let totalMilliseconds = 0;
    let clockInTime: Date | null = null;

    // Sort records by timestamp
    const sortedRecords = [...records].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const record of sortedRecords) {
      if (record.clockType === 'IN') {
        clockInTime = new Date(record.timestamp);
      } else if (record.clockType === 'OUT' && clockInTime) {
        const clockOutTime = new Date(record.timestamp);
        totalMilliseconds += clockOutTime.getTime() - clockInTime.getTime();
        clockInTime = null;
      }
    }

    // Convert to hours
    return totalMilliseconds / (1000 * 60 * 60);
  }

  /**
   * Get monthly statistics for a specific month
   */
  async getMonthlyStats(
    employeeId: string,
    year: number,
    month: number
  ): Promise<MonthlyStats> {
    try {
      // Get all records for the month
      const records = await DatabaseService.getRecordsByMonth(
        employeeId,
        year,
        month
      );

      // Calculate statistics
      const totalWorkingDays = this.getWorkingDaysInMonth(year, month);
      const daysClockedIn = this.getUniqueDaysClocked(records);
      const attendanceRate =
        totalWorkingDays > 0 ? (daysClockedIn / totalWorkingDays) * 100 : 0;
      const totalHours = this.calculateTotalHours(records);

      return {
        year,
        month,
        totalWorkingDays,
        daysClockedIn,
        attendanceRate: Math.round(attendanceRate * 100) / 100, // Round to 2 decimal places
        totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
        records,
      };
    } catch (error) {
      console.error('Failed to get monthly stats:', error);
      throw error;
    }
  }

  /**
   * Get all months with records
   */
  async getAvailableMonths(employeeId: string): Promise<
    Array<{ year: number; month: number; monthName: string }>
  > {
    try {
      const months = await DatabaseService.getMonthsRecords(employeeId);

      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      return months.map((m) => ({
        year: m.year,
        month: m.month,
        monthName: monthNames[m.month - 1],
      }));
    } catch (error) {
      console.error('Failed to get available months:', error);
      throw error;
    }
  }

  /**
   * Get statistics for all available months
   */
  async getAllMonthlyStats(
    employeeId: string
  ): Promise<MonthlyStats[]> {
    try {
      const months = await DatabaseService.getMonthsRecords(employeeId);

      const statsPromises = months.map((m) =>
        this.getMonthlyStats(employeeId, m.year, m.month)
      );

      return await Promise.all(statsPromises);
    } catch (error) {
      console.error('Failed to get all monthly stats:', error);
      throw error;
    }
  }
}

export default new MonthlyStatsService();
