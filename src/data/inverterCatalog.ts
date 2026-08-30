/**
 * Catálogo y Parser de Inversores Fotovoltaicos Certificados SEC
 * Detecta automáticamente:
 * - Potencia Nominal AC (kW)
 * - Sistema Eléctrico (Monofásico 220V / Trifásico 380V)
 * - Corriente Nominal AC de salida (A)
 */

export interface InverterElectricalSpecs {
  brand: string;
  model: string;
  nominalPowerKw: number;
  systemType: 'MONO' | 'TRI';
  nominalVoltageAc: number; // 220 o 380
  nominalCurrentAc: number; // A
}

export function parseInverterSpecs(inverterStr?: string): InverterElectricalSpecs {
  if (!inverterStr || inverterStr.trim() === '') {
    return {
      brand: 'Huawei',
      model: 'SUN2000-5KTL-L1',
      nominalPowerKw: 5.0,
      systemType: 'MONO',
      nominalVoltageAc: 220,
      nominalCurrentAc: 22.73,
    };
  }

  const str = inverterStr.toLowerCase();

  // 1. Detect Phase (Trifásico vs. Monofásico)
  const isTrifasico =
    str.includes('trifásico') ||
    str.includes('trifasico') ||
    str.includes('three phase') ||
    str.includes('3-phase') ||
    str.includes('ktl-m') || // Huawei M series is three-phase
    str.includes('symo') ||  // Fronius Symo is three-phase
    str.includes('tauro') || // Fronius Tauro is three-phase
    str.includes('three') ||
    str.includes('3p');

  const systemType: 'MONO' | 'TRI' = isTrifasico ? 'TRI' : 'MONO';
  const nominalVoltageAc = isTrifasico ? 380 : 220;

  // 2. Detect Nominal Power in kW
  let powerKw = 5.0; // Default

  // Check patterns like "SUN2000-5KTL", "Primo 5.0", "Axpert 5000W", "5 kW", "5000VA"
  const kwMatch = inverterStr.match(/(\d+(?:\.\d+)?)\s*(?:kw|kva|k)\b/i);
  const wMatch = inverterStr.match(/(\d{4,6})\s*(?:w|va)\b/i);
  const ktlMatch = inverterStr.match(/(?:ktl|sun2000)[-_]?(\d+)(?:ktl)?/i);
  const primoSymoMatch = inverterStr.match(/(?:primo|symo)\s*(\d+(?:\.\d+)?)/i);
  const multiplusMatch = inverterStr.match(/(\d{4,5})\/(?:\d+)/i);

  if (kwMatch && kwMatch[1]) {
    powerKw = parseFloat(kwMatch[1]);
  } else if (ktlMatch && ktlMatch[1]) {
    powerKw = parseFloat(ktlMatch[1]);
  } else if (primoSymoMatch && primoSymoMatch[1]) {
    powerKw = parseFloat(primoSymoMatch[1]);
  } else if (wMatch && wMatch[1]) {
    powerKw = parseFloat(wMatch[1]) / 1000;
  } else if (multiplusMatch && multiplusMatch[1]) {
    powerKw = parseFloat(multiplusMatch[1]) / 1000;
  } else {
    // Search general number
    const generalNum = inverterStr.match(/\b(1|2|3|4|5|6|7|8|9|10|12|15|17|20|25|30|40|50|100)\b/);
    if (generalNum) {
      powerKw = parseFloat(generalNum[1]);
    }
  }

  // Sanity checks
  if (isNaN(powerKw) || powerKw <= 0) {
    powerKw = 5.0;
  }

  // 3. Compute Nominal Current
  // Monofásico: I = (P * 1000) / (220 * cosPhi)
  // Trifásico: I = (P * 1000) / (sqrt(3) * 380 * cosPhi)
  let nominalCurrentAc = 0;
  if (systemType === 'MONO') {
    nominalCurrentAc = Math.round(((powerKw * 1000) / 220) * 100) / 100;
  } else {
    nominalCurrentAc = Math.round(((powerKw * 1000) / (Math.sqrt(3) * 380)) * 100) / 100;
  }

  return {
    brand: inverterStr.split('-')[0]?.trim() || '',
    model: inverterStr,
    nominalPowerKw: powerKw,
    systemType,
    nominalVoltageAc,
    nominalCurrentAc,
  };
}
