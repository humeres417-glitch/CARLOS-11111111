import { StringConfigItem, TechnicalInfo } from '../types';
import { getPvModuleSpecs, PvModuleElectricalSpecs } from '../data/pvModuleCatalog';
import { parseInverterSpecs, InverterElectricalSpecs } from '../data/inverterCatalog';
import {
  calculateDcVoltageDrop,
  calculateAcVoltageDrop,
  DcCalculationResult,
  AcCalculationResult,
} from './voltageDropCalculator';

/**
 * Calcula y completa automáticamente todos los parámetros eléctricos y caída de tensión DC para un string
 */
export function computeStringElectricals(item: StringConfigItem): StringConfigItem {
  const specs = getPvModuleSpecs(item.panelBrand, item.panelModel, item.panelWatts);
  const pCount = item.panelsCount || 0;
  const vmpMod = item.vmpModule || specs.vmp;
  const impMod = item.impModule || specs.imp;
  const vocMod = item.vocModule || specs.voc;
  const iscMod = item.iscModule || specs.isc;

  const cableDist = item.cableDistanceMeters !== undefined ? item.cableDistanceMeters : 25;
  const cableSec = item.cableSectionMm2 !== undefined ? item.cableSectionMm2 : 4;
  const tempC = item.operatingTempC !== undefined ? item.operatingTempC : 70;

  const vmpStr = Math.round(pCount * vmpMod * 10) / 10;
  const impStr = pCount > 0 ? impMod : 0;

  const dropRes: DcCalculationResult = calculateDcVoltageDrop({
    vmpString: vmpStr > 0 ? vmpStr : 1,
    impString: impStr,
    lengthMeters: cableDist,
    conductorSectionMm2: cableSec,
    operatingTempC: tempC,
    conductorMaterial: 'CU',
  });

  return {
    ...item,
    panelWatts: specs.pMaxWatts,
    vmpModule: vmpMod,
    impModule: impMod,
    vocModule: vocMod,
    iscModule: iscMod,
    cableSectionMm2: cableSec,
    cableDistanceMeters: cableDist,
    operatingTempC: tempC,
    deltaV: pCount > 0 ? Math.round(dropRes.deltaV * 100) / 100 : 0,
    deltaVPercent: pCount > 0 ? Math.round(dropRes.deltaVPercent * 100) / 100 : 0,
    vmpString: vmpStr,
    vInverter: pCount > 0 ? Math.round(dropRes.vInverter * 10) / 10 : 0,
    powerLossWatts: pCount > 0 ? Math.round(dropRes.powerLossWatts * 10) / 10 : 0,
    complianceStatus: pCount > 0 ? dropRes.complianceStatus : 'OPTIMAL',
  };
}

export interface AcFeederSummary {
  nominalPowerKw: number;
  systemType: 'MONO' | 'TRI';
  nominalVoltage: number;
  currentAmperes: number;
  distanceMeters: number;
  sectionMm2: number;
  deltaV: number;
  deltaVPercent: number;
  vAtTerminals: number;
  powerLossWatts: number;
  complianceStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'CRITICAL';
  complianceMessage: string;
}

/**
 * Calcula y completa los parámetros del alimentador AC desde el Inversor hasta el TDFV / Empalme
 */
export function computeAcFeederElectricals(technical: TechnicalInfo): AcFeederSummary {
  const invSpecs = parseInverterSpecs(technical.inverterBrandModel);
  const sysType = technical.inverterAcSystemType || invSpecs.systemType;
  const nomVoltage = sysType === 'TRI' ? 380 : 220;

  let powerKw = technical.inverterNominalPowerKw || invSpecs.nominalPowerKw;
  if (!powerKw || powerKw <= 0) {
    const pKwp = parseFloat(technical.installedPowerKwp?.replace(',', '.') || '5');
    if (!isNaN(pKwp) && pKwp > 0) powerKw = pKwp;
  }

  const distance = technical.inverterAcDistanceMeters !== undefined ? technical.inverterAcDistanceMeters : 15;
  const section = technical.inverterAcCableSectionMm2 !== undefined ? technical.inverterAcCableSectionMm2 : 6;

  const acRes: AcCalculationResult = calculateAcVoltageDrop({
    systemType: sysType,
    nominalVoltage: nomVoltage,
    powerKw: powerKw,
    powerFactor: 1.0,
    lengthMeters: distance,
    conductorSectionMm2: section,
    operatingTempC: 70,
    conductorMaterial: 'CU',
  });

  return {
    nominalPowerKw: powerKw,
    systemType: sysType,
    nominalVoltage: nomVoltage,
    currentAmperes: Math.round(acRes.nominalCurrent * 10) / 10,
    distanceMeters: distance,
    sectionMm2: section,
    deltaV: Math.round(acRes.deltaV * 100) / 100,
    deltaVPercent: Math.round(acRes.deltaVPercent * 100) / 100,
    vAtTerminals: Math.round(acRes.vAtInverterTerminals * 10) / 10,
    powerLossWatts: Math.round(acRes.powerLossWatts * 10) / 10,
    complianceStatus: acRes.complianceStatus,
    complianceMessage: acRes.complianceMessage,
  };
}
