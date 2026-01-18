// SQLite database schema for ClockOn

export const DB_NAME = 'ClockOn.db';

export const TABLE_EMPLOYEE_RECORDS = 'employee_records';

// SQL to create the employee_records table
export const CREATE_EMPLOYEE_RECORDS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLE_EMPLOYEE_RECORDS} (
    id TEXT PRIMARY KEY NOT NULL,
    employeeId TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    clockType TEXT NOT NULL CHECK(clockType IN ('IN', 'OUT')),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    triggerMethod TEXT NOT NULL CHECK(triggerMethod IN ('AUTOMATIC_GEOFENCE', 'MANUAL_CHECK')),
    platform TEXT NOT NULL,
    appVersion TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
`;

// Indexes for common queries
export const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_employee_id ON ${TABLE_EMPLOYEE_RECORDS}(employeeId);`,
  `CREATE INDEX IF NOT EXISTS idx_timestamp ON ${TABLE_EMPLOYEE_RECORDS}(timestamp DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_clock_type ON ${TABLE_EMPLOYEE_RECORDS}(clockType);`,
  `CREATE INDEX IF NOT EXISTS idx_employee_timestamp ON ${TABLE_EMPLOYEE_RECORDS}(employeeId, timestamp DESC);`,
];

// Migration versions
export const DB_VERSION = 1;

export const migrations: Record<number, string[]> = {
  1: [CREATE_EMPLOYEE_RECORDS_TABLE, ...CREATE_INDEXES],
};
