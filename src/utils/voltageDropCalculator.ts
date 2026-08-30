/**
 * Calculadora de Caída de Tensión para Strings Fotovoltaicos DC y Alimentadores AC
 * Basado en Normativa Eléctrica Chilena SEC (RIC N°03, RIC N°09 y RIC N°19 - Autoconsumo / Netbilling)
 */

export interface DcCalculationInput {
  vmpString: number;        // Tensión Vmp del string en Volts (ej. 420V)
  impString: number;        // Corriente Imp del string en Amperes (ej. 13.5A)
  lengthMeters: number;     // Distancia lineal de un sentido en metros (ej. 25m)
  conductorSectionMm2: number; // Sección del conductor en mm2 (ej. 4, 6, 10 mm2)
  operatingTempC: number;   // Temperatura de operación del conductor (ej. 20, 50, 70, 90 °C)
  conductorMaterial: 'CU' | 'AL'; // Cobre o Aluminio
}

export interface DcCalculationResult {
  deltaV: number;           // Caída de tensión en Voltios (V)
  deltaVPercent: number;    // Caída de tensión en porcentaje (%)
  vInverter: number;        // Tensión resultante en bornes del inversor (V)
  powerLossWatts: number;   // Pérdida de potencia en Watts (W)
  powerLossPercent: number; // Pérdida de potencia en %
  estimatedAnnualKwhLoss: number; // Estimación de kWh disipados al año (~1800 HSP)
  rhoUsed: number;          // Resistividad utilizada a la temperatura dada (Ohm*mm2/m)
  resistanceTotal: number;  // Resistencia total del bucle en Ohms
  complianceStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' | 'CRITICAL';
  complianceMessage: string;
  recommendedSectionMm2: number; // Sección mínima recomendada para <= 1.5%
}

export interface AcCalculationInput {
  systemType: 'MONO' | 'TRI'; // Monofásico (220V/230V) o Trifásico (380V/400V)
  nominalVoltage: number;   // 220V o 380V
  powerKw: number;          // Potencia en kW (ej. 5.0 kW)
  currentAmperes?: number;  // Corriente nominal en A (opcional si se ingresa potencia)
  powerFactor: number;      // Factor de potencia (ej. 1.0 o 0.95)
  lengthMeters: number;     // Distancia lineal en metros (ej. 15m)
  conductorSectionMm2: number; // Sección en mm2 (ej. 4, 6, 10, 16, 25, 35 mm2)
  operatingTempC: number;   // Temperatura de servicio (ej. 20, 50, 70 °C)
  conductorMaterial: 'CU' | 'AL'; // Cobre o Aluminio
}

export interface AcCalculationResult {
  nominalCurrent: number;   // Corriente nominal calculada (A)
  deltaV: number;           // Caída de tensión en Voltios (V)
  deltaVPercent: number;    // Caída de tensión en porcentaje (%)
  vAtInverterTerminals: number; // Tensión en bornes del inversor durante inyección (V)
  powerLossWatts: number;   // Pérdida de potencia en Watts (W)
  overvoltageWarning: boolean; // Alerta si supera 253V en monofásico o 437V en trifásico
  complianceStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'CRITICAL';
  complianceMessage: string;
  recommendedSection15Percent: number; // Sección mínima para <= 1.5% (Netbilling recomendada)
  recommendedSection30Percent: number; // Sección mínima para <= 3.0% (Límite RIC N°03)
}

// Resistividad base a 20°C (Ohm * mm2 / m)
export const RHO_20C_CU = 0.01784; // Cobre recocido electrolítico estándar
export const RHO_20C_AL = 0.02826; // Aluminio conductor estándar

// Coeficiente de temperatura alpha (1/°C)
export const ALPHA_CU = 0.00393;
export const ALPHA_AL = 0.00403;

// Calibres comerciales estándar normalizados en Chile (mm2)
export const STANDARD_DC_SECTIONS = [2.5, 4, 6, 10, 16, 25];
export const STANDARD_AC_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

/**
 * Calcula la resistividad del material corregida por temperatura
 * Rho_T = Rho_20 * [1 + alpha * (T - 20)]
 */
export function getResistivityAtTemp(material: 'CU' | 'AL', tempC: number): number {
  const rho20 = material === 'CU' ? RHO_20C_CU : RHO_20C_AL;
  const alpha = material === 'CU' ? ALPHA_CU : ALPHA_AL;
  return rho20 * (1 + alpha * (tempC - 20));
}

/**
 * Calcula la caída de tensión en un String DC Fotovoltaico
 * Fórmula 2 hilos DC: DeltaV = (2 * rho * L * I) / S
 */
export function calculateDcVoltageDrop(input: DcCalculationInput): DcCalculationResult {
  const { vmpString, impString, lengthMeters, conductorSectionMm2, operatingTempC, conductorMaterial } = input;

  const safeVmp = vmpString > 0 ? vmpString : 1;
  const safeImp = impString >= 0 ? impString : 0;
  const safeL = lengthMeters >= 0 ? lengthMeters : 0;
  const safeS = conductorSectionMm2 > 0 ? conductorSectionMm2 : 4;

  const rho = getResistivityAtTemp(conductorMaterial, operatingTempC);
  
  // Resistencia total ida y vuelta (2 * L)
  const resistanceTotal = (2 * rho * safeL) / safeS;
  
  // Caída de tensión en Voltios
  const deltaV = resistanceTotal * safeImp;
  
  // Porcentaje de caída respecto a Vmp
  const deltaVPercent = (deltaV / safeVmp) * 100;
  
  // Tensión que llega al inversor
  const vInverter = Math.max(0, safeVmp - deltaV);
  
  // Pérdidas por efecto Joule
  const powerLossWatts = deltaV * safeImp;
  const stringPowerWatts = safeVmp * safeImp;
  const powerLossPercent = stringPowerWatts > 0 ? (powerLossWatts / stringPowerWatts) * 100 : 0;
  
  // Estimación anual de pérdidas (asumiendo ~1800 horas sol pico equivalentes al año)
  const estimatedAnnualKwhLoss = (powerLossWatts * 1800) / 1000;

  // Evaluación de cumplimiento normativo SEC / Solar Best Practice
  let complianceStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' | 'CRITICAL';
  let complianceMessage = '';

  if (deltaVPercent <= 1.5) {
    complianceStatus = 'OPTIMAL';
    complianceMessage = 'Excelente: Caída ≤ 1.5%. Cumple sobradamente con las recomendaciones de máxima eficiencia en Netbilling.';
  } else if (deltaVPercent <= 2.0) {
    complianceStatus = 'ACCEPTABLE';
    complianceMessage = 'Conforme: Caída ≤ 2.0%. Cumple con el estándar de diseño fotovoltaico recomendado.';
  } else if (deltaVPercent <= 3.0) {
    complianceStatus = 'WARNING';
    complianceMessage = 'Al límite: Caída entre 2.0% y 3.0%. Dentro del límite máximo general, pero se recomienda aumentar sección para evitar pérdidas.';
  } else {
    complianceStatus = 'CRITICAL';
    complianceMessage = 'No Conforme: Caída > 3.0%. Supera el límite normativo permisible. Es obligatorio aumentar la sección del cable solar.';
  }

  // Calcular sección mínima recomendada para <= 1.5%
  // S_req = (2 * rho * L * I) / (Vmp * 0.015)
  const targetDeltaV15 = safeVmp * 0.015;
  const theoreticalS15 = targetDeltaV15 > 0 ? (2 * rho * safeL * safeImp) / targetDeltaV15 : 4;
  const recommendedSectionMm2 = STANDARD_DC_SECTIONS.find((s) => s >= theoreticalS15) || STANDARD_DC_SECTIONS[STANDARD_DC_SECTIONS.length - 1];

  return {
    deltaV,
    deltaVPercent,
    vInverter,
    powerLossWatts,
    powerLossPercent,
    estimatedAnnualKwhLoss,
    rhoUsed: rho,
    resistanceTotal,
    complianceStatus,
    complianceMessage,
    recommendedSectionMm2,
  };
}

/**
 * Calcula la caída de tensión en un Alimentador AC (Inversor a Tablero / Empalme)
 * Monofásico: DeltaV = (2 * rho * L * I * cosPhi) / S
 * Trifásico: DeltaV = (sqrt(3) * rho * L * I * cosPhi) / S
 */
export function calculateAcVoltageDrop(input: AcCalculationInput): AcCalculationResult {
  const { systemType, nominalVoltage, powerKw, currentAmperes, powerFactor, lengthMeters, conductorSectionMm2, operatingTempC, conductorMaterial } = input;

  const safeVn = nominalVoltage > 0 ? nominalVoltage : (systemType === 'MONO' ? 220 : 380);
  const safeCosPhi = powerFactor > 0 && powerFactor <= 1 ? powerFactor : 1.0;
  const safeL = lengthMeters >= 0 ? lengthMeters : 0;
  const safeS = conductorSectionMm2 > 0 ? conductorSectionMm2 : 4;
  const rho = getResistivityAtTemp(conductorMaterial, operatingTempC);

  // Calcular corriente si no viene explícita
  let nominalCurrent = 0;
  if (currentAmperes !== undefined && currentAmperes > 0) {
    nominalCurrent = currentAmperes;
  } else {
    const powerWatts = (powerKw > 0 ? powerKw : 1) * 1000;
    if (systemType === 'MONO') {
      nominalCurrent = powerWatts / (safeVn * safeCosPhi);
    } else {
      nominalCurrent = powerWatts / (Math.sqrt(3) * safeVn * safeCosPhi);
    }
  }

  // Caída de tensión
  let deltaV = 0;
  if (systemType === 'MONO') {
    deltaV = (2 * rho * safeL * nominalCurrent * safeCosPhi) / safeS;
  } else {
    deltaV = (Math.sqrt(3) * rho * safeL * nominalCurrent * safeCosPhi) / safeS;
  }

  const deltaVPercent = (deltaV / safeVn) * 100;
  
  // Tensión que debe entregar el inversor para inyectar hacia la red (V_inv = V_red + DeltaV)
  const vAtInverterTerminals = safeVn + deltaV;

  // Pérdida de potencia en los cables AC
  let powerLossWatts = 0;
  if (systemType === 'MONO') {
    powerLossWatts = 2 * ((rho * safeL) / safeS) * Math.pow(nominalCurrent, 2);
  } else {
    powerLossWatts = 3 * ((rho * safeL) / safeS) * Math.pow(nominalCurrent, 2);
  }

  // Alerta de sobretensión: Norma chilena estipula tolerancia +10% / +7% en red eléctrica
  // Si en 220V la tensión en bornes del inversor supera 242V o 253V, puede disparar corte por protecciones
  const maxSafeGridV = systemType === 'MONO' ? 245 : 420;
  const overvoltageWarning = vAtInverterTerminals > maxSafeGridV;

  // Cumplimiento normativo según RIC N°03 y RIC N°19 SEC
  let complianceStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'CRITICAL';
  let complianceMessage = '';

  if (deltaVPercent <= 1.5) {
    complianceStatus = 'OPTIMAL';
    complianceMessage = 'Óptimo (≤ 1.5%): Excelente para inyección Netbilling. Minimiza el riesgo de desconexión del inversor por sobrevoltaje de red.';
  } else if (deltaVPercent <= 3.0) {
    complianceStatus = 'ACCEPTABLE';
    complianceMessage = 'Conforme SEC RIC N°03 (≤ 3.0%): Cumple con el límite máximo reglamentario para alimentadores.';
  } else {
    complianceStatus = 'CRITICAL';
    complianceMessage = 'No Conforme SEC (Excede 3.0%): Incumple el pliego técnico RIC N°03. Debe aumentar la sección del conductor.';
  }

  // Secciones mínimas recomendadas
  // Monofásico: S = (2 * rho * L * I * cosPhi) / (Vn * targetPercent)
  // Trifásico: S = (sqrt(3) * rho * L * I * cosPhi) / (Vn * targetPercent)
  const factor = systemType === 'MONO' ? 2 : Math.sqrt(3);
  
  const target15V = safeVn * 0.015;
  const theoreticalS15 = target15V > 0 ? (factor * rho * safeL * nominalCurrent * safeCosPhi) / target15V : 4;
  const recommendedSection15Percent = STANDARD_AC_SECTIONS.find((s) => s >= theoreticalS15) || STANDARD_AC_SECTIONS[STANDARD_AC_SECTIONS.length - 1];

  const target30V = safeVn * 0.03;
  const theoreticalS30 = target30V > 0 ? (factor * rho * safeL * nominalCurrent * safeCosPhi) / target30V : 2.5;
  const recommendedSection30Percent = STANDARD_AC_SECTIONS.find((s) => s >= theoreticalS30) || STANDARD_AC_SECTIONS[STANDARD_AC_SECTIONS.length - 1];

  return {
    nominalCurrent,
    deltaV,
    deltaVPercent,
    vAtInverterTerminals,
    powerLossWatts,
    overvoltageWarning,
    complianceStatus,
    complianceMessage,
    recommendedSection15Percent,
    recommendedSection30Percent,
  };
}
