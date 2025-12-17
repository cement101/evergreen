export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  allowedBasins: string[]; // IDs of basins this user can see
}

export interface TelemetryData {
  co2Level: number;
  airTemp: number;
  humidity: number;
  soilTemp: number;
  soilMoisture: number;
  soilEC: number;
  soilPH: number;
  soilN: number;
  soilP: number;
  soilK: number;
  lux: number;
  lastSeen: number;
}

export interface PumpStatus {
  pump1: boolean;
  pump2: boolean;
  pump3: boolean;
  pump4: boolean;
}

export interface Basin {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline';
  lastUpdate: number;
  telemetry: TelemetryData;
  pumps: PumpStatus;
}

export interface HistoricalDataPoint {
  timestamp: number;
  value: number;
  key: string;
}

export type ViewState = 'OVERVIEW' | 'DETAILS' | 'EXPORT' | 'CHART' | 'USERS';
