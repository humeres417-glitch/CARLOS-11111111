import { InstallerInfo } from '../types';

export const DEFAULT_INSTALLERS_REGISTRY: InstallerInfo[] = [
  {
    name: 'FELIPE VERAGUA',
    rut: '17.849.201-K',
    secClass: 'Clase A',
    secLicenceNumber: 'SEC-84729',
    phone: '+56 9 8456 1234',
    email: 'f.veragua@servilec.cl',
    companyName: 'SERVILEC ENERGÍA SpA'
  },
  {
    name: 'SEBASTIAN LEIVA',
    rut: '18.324.512-3',
    secClass: 'Clase A',
    secLicenceNumber: 'SEC-91204',
    phone: '+56 9 7621 9845',
    email: 's.leiva@servilec.cl',
    companyName: 'SERVILEC ENERGÍA SpA'
  },
  {
    name: 'CARLOS HUMERES',
    rut: '16.745.890-2',
    secClass: 'Clase A',
    secLicenceNumber: 'SEC-76532',
    phone: '+56 9 9123 4567',
    email: 'c.humeres@servilec.cl',
    companyName: 'SERVILEC ENERGÍA SpA'
  },
  {
    name: 'XAVIER CORNEJO',
    rut: '15.932.108-7',
    secClass: 'Clase B',
    secLicenceNumber: 'SEC-65419',
    phone: '+56 9 8234 5678',
    email: 'x.cornejo@servilec.cl',
    companyName: 'SERVILEC ENERGÍA SpA'
  },
  {
    name: 'BASTIAN HIDALGO',
    rut: '19.456.789-1',
    secClass: 'Clase B',
    secLicenceNumber: 'SEC-102948',
    phone: '+56 9 6345 6789',
    email: 'b.hidalgo@servilec.cl',
    companyName: 'SERVILEC ENERGÍA SpA'
  }
];

export const INSTALLERS_STORAGE_KEY = 'te4_installers_registry_v1';

export function getStoredInstallers(): InstallerInfo[] {
  try {
    const raw = localStorage.getItem(INSTALLERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading installers from localStorage', e);
  }
  return DEFAULT_INSTALLERS_REGISTRY;
}

export function saveStoredInstallers(installers: InstallerInfo[]): void {
  try {
    localStorage.setItem(INSTALLERS_STORAGE_KEY, JSON.stringify(installers));
  } catch (e) {
    console.warn('Error saving installers to localStorage', e);
  }
}
