import { Basin, User, UserRole } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'superadmin',
    role: UserRole.ADMIN,
    allowedBasins: [], // Admin sees all implicitly
  },
  {
    id: 'u2',
    username: 'grower_john',
    role: UserRole.USER,
    allowedBasins: ['basin-03'],
  },
];

export const INITIAL_BASINS: Basin[] = [
  {
    id: 'basin-03',
    name: 'Basin 03 - Tomatoes',
    ip: '192.168.1.103',
    status: 'online',
    lastUpdate: Date.now(),
    telemetry: {
      co2Level: 409,
      airTemp: 20.9,
      humidity: 59,
      soilTemp: 18.45,
      soilMoisture: 39,
      soilEC: 109,
      soilPH: 6.59,
      soilN: 19,
      soilP: 14,
      soilK: 17,
      lux: 290,
      lastSeen: Date.now(),
    },
    pumps: { pump1: false, pump2: false, pump3: true, pump4: false },
  },
  {
    id: 'basin-04',
    name: 'Basin 04 - Lettuce',
    ip: '192.168.1.104',
    status: 'online',
    lastUpdate: Date.now() - 5000,
    telemetry: {
      co2Level: 419,
      airTemp: 21.9,
      humidity: 57,
      soilTemp: 17.45,
      soilMoisture: 44,
      soilEC: 129,
      soilPH: 6.49,
      soilN: 21,
      soilP: 16,
      soilK: 18,
      lux: 358,
      lastSeen: Date.now() - 5000,
    },
    pumps: { pump1: true, pump2: false, pump3: false, pump4: false },
  },
  {
    id: 'basin-05',
    name: 'Basin 05 - Peppers',
    ip: '192.168.1.105',
    status: 'offline',
    lastUpdate: Date.now() - 3600000, // 1 hour ago
    telemetry: {
      co2Level: 380,
      airTemp: 19.5,
      humidity: 65,
      soilTemp: 16.2,
      soilMoisture: 30,
      soilEC: 90,
      soilPH: 6.8,
      soilN: 15,
      soilP: 12,
      soilK: 14,
      lux: 0,
      lastSeen: Date.now() - 3600000,
    },
    pumps: { pump1: false, pump2: false, pump3: false, pump4: false },
  },
];

export const SENSOR_KEYS = [
  'co2Level',
  'airTemp',
  'humidity',
  'soilTemp',
  'soilMoisture',
  'soilEC',
  'soilPH',
  'soilN',
  'soilP',
  'soilK',
  'lux',
] as const;
