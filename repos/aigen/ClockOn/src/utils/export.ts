// Export utility functions for CSV and JSON

import { Share } from 'react-native';
import { EmployeeRecord } from '../types';

/**
 * Convert records to CSV format
 */
export function recordsToCSV(records: EmployeeRecord[]): string {
  if (records.length === 0) {
    return '';
  }

  const headers = [
    'ID',
    'Employee ID',
    'Timestamp',
    'Clock Type',
    'Latitude',
    'Longitude',
    'Accuracy (m)',
    'Trigger Method',
    'Platform',
    'App Version',
  ];

  const rows = records.map((record) => [
    record.id,
    record.employeeId,
    record.timestamp,
    record.clockType,
    record.location.latitude.toString(),
    record.location.longitude.toString(),
    record.location.accuracy?.toString() || '',
    record.triggerMethod,
    record.deviceInfo.platform,
    record.deviceInfo.appVersion,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSVField).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Escape CSV field if it contains special characters
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Convert records to JSON format
 */
export function recordsToJSON(records: EmployeeRecord[]): string {
  return JSON.stringify(records, null, 2);
}

/**
 * Generate filename for export
 */
export function generateExportFilename(format: 'csv' | 'json'): string {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  return `ClockOn_Export_${date}_${time}.${format}`;
}

/**
 * Save export to file (returns content for sharing)
 * Note: In a full implementation, this would save to the file system
 */
export async function saveExportFile(
  content: string,
  format: 'csv' | 'json'
): Promise<string> {
  // For now, just return the content
  // In production, you would use a file system library to save this
  return content;
}

/**
 * Share export (using React Native Share API)
 */
export async function shareExport(
  content: string,
  format: 'csv' | 'json'
): Promise<void> {
  const filename = generateExportFilename(format);

  try {
    await Share.share({
      message: content,
      title: filename,
    });
  } catch (error) {
    console.error('Failed to share export:', error);
    throw error;
  }
}

/**
 * Parse CSV import
 */
export function parseCSVImport(csv: string): Partial<EmployeeRecord>[] {
  const lines = csv.split('\n').filter((line) => line.trim());
  if (lines.length < 2) {
    return [];
  }

  // Skip header row
  const dataLines = lines.slice(1);
  const records: Partial<EmployeeRecord>[] = [];

  for (const line of dataLines) {
    const fields = parseCSVLine(line);
    if (fields.length >= 10) {
      records.push({
        id: fields[0],
        employeeId: fields[1],
        timestamp: fields[2],
        clockType: fields[3] as 'IN' | 'OUT',
        location: {
          latitude: parseFloat(fields[4]),
          longitude: parseFloat(fields[5]),
          accuracy: fields[7] ? parseFloat(fields[7]) : undefined,
        },
        triggerMethod: fields[7] as any,
        deviceInfo: {
          platform: fields[8] as any,
          appVersion: fields[9],
        },
      });
    }
  }

  return records;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

/**
 * Parse JSON import
 */
export function parseJSONImport(json: string): EmployeeRecord[] {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse JSON import:', error);
    return [];
  }
}
