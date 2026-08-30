export type SecClass = 'Clase A' | 'Clase B' | 'Clase C' | 'Clase D';

export type SystemType = 'On-Grid (Netbilling)' | 'Off-Grid (Aislado)' | 'Híbrido (Con Baterías)';

export type ItemStatus = 'C' | 'NC' | 'NA' | 'PENDIENTE';

export interface PhotoItem {
  id: string;
  url: string; // base64 or blob URL
  name: string;
  timestamp: string;
  location?: string;
  note?: string;
  driveFileId?: string;
  driveViewLink?: string;
}

export interface ChecklistItem {
  id: string;
  code: string;
  title: string;
  normaSec: string;
  description: string;
  photoGuide: string;
  status: ItemStatus;
  observation: string;
  photos: PhotoItem[];
}

export interface ChecklistCategory {
  id: string;
  title: string;
  iconName: string;
  items: ChecklistItem[];
}

export interface InstallerInfo {
  name: string;
  rut: string;
  secClass: SecClass;
  secLicenceNumber: string;
  phone: string;
  email: string;
  companyName: string;
}

export interface ClientInfo {
  name: string;
  rut: string;
  address: string;
  comuna: string;
  region: string;
  phone: string;
  email: string;
}

export interface StringConfigItem {
  stringIndex: number;
  panelsCount: number;
  panelBrand?: string;
  panelModel?: string;
  panelWatts?: number;
  // Module electrical specs (from datasheet)
  vmpModule?: number;       // Vmp individual del módulo en Volts (ej. 41.9V)
  impModule?: number;       // Imp individual del módulo en Amperes (ej. 13.12A)
  vocModule?: number;       // Voc individual del módulo en Volts (ej. 49.8V)
  iscModule?: number;       // Isc individual del módulo en Amperes (ej. 13.98A)
  // Cable solar y canalización
  cableSectionMm2?: number; // Sección cable solar H1Z2Z2-K (ej. 4, 6, 10 mm2)
  cableDistanceMeters?: number; // Distancia lineal del string al inversor en metros (ej. 25m)
  operatingTempC?: number;  // Temp de operación (ej. 70°C en techo)
  // Resultados del cálculo de caída de tensión DC
  deltaV?: number;          // Caída de tensión en Voltios (V)
  deltaVPercent?: number;   // Caída de tensión en porcentaje (%)
  vmpString?: number;       // Tensión nominal total del string Vmp (V)
  vInverter?: number;       // Tensión en bornes MPPT del inversor (V)
  powerLossWatts?: number;  // Pérdida de potencia en Watts
  complianceStatus?: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' | 'CRITICAL';
}

export interface TechnicalInfo {
  systemType: SystemType;
  installedPowerKwp: string;
  inverterBrandModel: string;
  inverterSerialNumber: string;
  panelsCountAndPower: string;
  batteryInfo?: string;
  batteryBrand?: string;
  batteryModel?: string;
  batteryCount?: number;
  batteryTotalKwh?: string;
  groundingResistanceOhm: string;
  gpsCoordinates?: string;
  inspectionDate: string;
  distributionCompany?: string;
  mpptCount?: string;
  stringsCount?: string;
  panelsPerString?: string;
  stringPanelCounts?: number[];
  stringConfigs?: StringConfigItem[];
  // Parámetros y resultados del alimentador AC (Inversor -> TDFV / Empalme)
  inverterAcDistanceMeters?: number; // Distancia Inversor -> TDFV en metros (ej. 15m)
  inverterAcCableSectionMm2?: number; // Sección cable AC en mm2 (ej. 4, 6, 10, 16 mm2)
  inverterAcSystemType?: 'MONO' | 'TRI'; // Monofásico 220V o Trifásico 380V
  inverterNominalPowerKw?: number; // Potencia nominal en kW
  inverterAcDeltaV?: number; // Caída de tensión AC en Voltios
  inverterAcDeltaVPercent?: number; // Caída de tensión AC en %
  inverterAcCurrent?: number; // Corriente nominal AC en Amperes
  inverterAcVoltageAtTerminals?: number; // Tensión en bornes durante inyección (V)
  inverterAcComplianceStatus?: 'OPTIMAL' | 'ACCEPTABLE' | 'CRITICAL';
}

export interface Inspection {
  id: string;
  createdAt: string;
  updatedAt: string;
  installer: InstallerInfo;
  client: ClientInfo;
  technical: TechnicalInfo;
  categories: ChecklistCategory[];
  generalNotes: string;
  signatureDataUrl?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  status: 'Borrador' | 'Completado' | 'Subido a Drive';
}

export interface UploadProgress {
  currentStep: string;
  totalFiles: number;
  completedFiles: number;
  currentFileName: string;
  isComplete: boolean;
  error?: string;
  driveFolderUrl?: string;
}
