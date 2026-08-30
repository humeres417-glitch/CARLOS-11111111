/**
 * Catálogo de Fichas Técnicas Eléctricas de Módulos Fotovoltaicos Certificados SEC
 * Incluye parámetros eléctricos STC (Standard Test Conditions: 1000 W/m², 25°C, AM 1.5):
 * - Pmax: Potencia Máxima (Watts)
 * - Vmp: Voltaje a Máxima Potencia (V)
 * - Imp: Corriente a Máxima Potencia (A)
 * - Voc: Voltaje de Circuito Abierto (V)
 * - Isc: Corriente de Cortocircuito (A)
 */

export interface PvModuleElectricalSpecs {
  brand: string;
  model: string;
  pMaxWatts: number;
  vmp: number;
  imp: number;
  voc: number;
  isc: number;
  technology: string;
}

export const KNOWN_PV_MODULES_CATALOG: Record<string, PvModuleElectricalSpecs> = {
  // -------------------------------------------------------------
  // Jinko Solar
  // -------------------------------------------------------------
  'JKM550M-72HL4 550W Mono PERC Half-Cell': {
    brand: 'Jinko Solar',
    model: 'JKM550M-72HL4 550W Mono PERC Half-Cell',
    pMaxWatts: 550,
    vmp: 40.90,
    imp: 13.45,
    voc: 49.62,
    isc: 14.03,
    technology: 'Mono PERC 72HL4'
  },
  'JKM555M-72HL4 555W Mono PERC Half-Cell': {
    brand: 'Jinko Solar',
    model: 'JKM555M-72HL4 555W Mono PERC Half-Cell',
    pMaxWatts: 555,
    vmp: 41.10,
    imp: 13.50,
    voc: 49.78,
    isc: 14.07,
    technology: 'Mono PERC 72HL4'
  },
  'JKM560M-72HL4 560W Mono PERC Half-Cell': {
    brand: 'Jinko Solar',
    model: 'JKM560M-72HL4 560W Mono PERC Half-Cell',
    pMaxWatts: 560,
    vmp: 41.30,
    imp: 13.56,
    voc: 49.98,
    isc: 14.13,
    technology: 'Mono PERC 72HL4'
  },
  'JKM565M-72HL4-V 565W Mono PERC 1500V': {
    brand: 'Jinko Solar',
    model: 'JKM565M-72HL4-V 565W Mono PERC 1500V',
    pMaxWatts: 565,
    vmp: 41.50,
    imp: 13.62,
    voc: 50.18,
    isc: 14.19,
    technology: 'Mono PERC 1500V'
  },
  'JKM570M-72HL4-V 570W Mono PERC 1500V': {
    brand: 'Jinko Solar',
    model: 'JKM570M-72HL4-V 570W Mono PERC 1500V',
    pMaxWatts: 570,
    vmp: 41.70,
    imp: 13.67,
    voc: 50.38,
    isc: 14.25,
    technology: 'Mono PERC 1500V'
  },
  'JKM575M-72HL4-V 575W Mono PERC 1500V': {
    brand: 'Jinko Solar',
    model: 'JKM575M-72HL4-V 575W Mono PERC 1500V',
    pMaxWatts: 575,
    vmp: 41.90,
    imp: 13.72,
    voc: 50.58,
    isc: 14.31,
    technology: 'Mono PERC 1500V'
  },
  'JKM580M-72HL4-V 580W Mono PERC 1500V': {
    brand: 'Jinko Solar',
    model: 'JKM580M-72HL4-V 580W Mono PERC 1500V',
    pMaxWatts: 580,
    vmp: 42.10,
    imp: 13.78,
    voc: 50.78,
    isc: 14.37,
    technology: 'Mono PERC 1500V'
  },
  'Tiger Neo N-type JKM585N-72HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM585N-72HL4-V',
    pMaxWatts: 585,
    vmp: 42.61,
    imp: 13.73,
    voc: 51.10,
    isc: 14.47,
    technology: 'N-Type TOPCon'
  },
  'Tiger Neo N-type JKM590N-72HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM590N-72HL4-V',
    pMaxWatts: 590,
    vmp: 42.80,
    imp: 13.79,
    voc: 51.30,
    isc: 14.53,
    technology: 'N-Type TOPCon'
  },
  'Tiger Neo N-type JKM595N-72HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM595N-72HL4-V',
    pMaxWatts: 595,
    vmp: 43.00,
    imp: 13.84,
    voc: 51.50,
    isc: 14.59,
    technology: 'N-Type TOPCon'
  },
  'Tiger Neo N-type JKM600N-72HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM600N-72HL4-V',
    pMaxWatts: 600,
    vmp: 43.20,
    imp: 13.89,
    voc: 51.70,
    isc: 14.65,
    technology: 'N-Type TOPCon'
  },
  'Tiger Neo N-type JKM615N-78HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM615N-78HL4-V',
    pMaxWatts: 615,
    vmp: 46.50,
    imp: 13.23,
    voc: 56.10,
    isc: 13.91,
    technology: 'N-Type TOPCon 78HL4'
  },
  'Tiger Neo N-type JKM620N-78HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM620N-78HL4-V',
    pMaxWatts: 620,
    vmp: 46.85,
    imp: 13.23,
    voc: 56.48,
    isc: 13.98,
    technology: 'N-Type TOPCon 78HL4'
  },
  'Tiger Neo N-type JKM625N-78HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM625N-78HL4-V',
    pMaxWatts: 625,
    vmp: 47.10,
    imp: 13.27,
    voc: 56.70,
    isc: 14.04,
    technology: 'N-Type TOPCon 78HL4'
  },
  'Tiger Neo N-type JKM630N-78HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM630N-78HL4-V',
    pMaxWatts: 630,
    vmp: 47.35,
    imp: 13.31,
    voc: 56.95,
    isc: 14.10,
    technology: 'N-Type TOPCon 78HL4'
  },

  // -------------------------------------------------------------
  // Canadian Solar
  // -------------------------------------------------------------
  'HiKu6 CS6W-545MS': {
    brand: 'Canadian Solar',
    model: 'HiKu6 CS6W-545MS',
    pMaxWatts: 545,
    vmp: 41.70,
    imp: 13.08,
    voc: 49.60,
    isc: 13.95,
    technology: 'Mono PERC HiKu6'
  },
  'HiKu6 CS6W-550MS': {
    brand: 'Canadian Solar',
    model: 'HiKu6 CS6W-550MS',
    pMaxWatts: 550,
    vmp: 41.90,
    imp: 13.13,
    voc: 49.80,
    isc: 14.00,
    technology: 'Mono PERC HiKu6'
  },
  'HiKu6 CS6W-555MS': {
    brand: 'Canadian Solar',
    model: 'HiKu6 CS6W-555MS',
    pMaxWatts: 555,
    vmp: 42.10,
    imp: 13.19,
    voc: 50.00,
    isc: 14.05,
    technology: 'Mono PERC HiKu6'
  },
  'CS6W-585T': {
    brand: 'Canadian Solar',
    model: 'CS6W-585T',
    pMaxWatts: 585,
    vmp: 43.10,
    imp: 13.58,
    voc: 51.80,
    isc: 14.35,
    technology: 'TOPBiHiKu6'
  },
  'CS6.2-66TB-615': {
    brand: 'Canadian Solar',
    model: 'CS6.2-66TB-615',
    pMaxWatts: 615,
    vmp: 40.00,
    imp: 15.38,
    voc: 48.20,
    isc: 16.25,
    technology: 'TOPCon Bifacial'
  },
  'CS6.2-66TB-620 (620W TOPCon Bifacial)': {
    brand: 'Canadian Solar',
    model: 'CS6.2-66TB-620 (620W TOPCon Bifacial)',
    pMaxWatts: 620,
    vmp: 40.20,
    imp: 15.43,
    voc: 48.40,
    isc: 16.32,
    technology: 'TOPCon Bifacial'
  },
  'HiKu7 CS7N-650MS': {
    brand: 'Canadian Solar',
    model: 'HiKu7 CS7N-650MS',
    pMaxWatts: 650,
    vmp: 38.30,
    imp: 16.98,
    voc: 45.30,
    isc: 18.39,
    technology: 'Mono PERC HiKu7'
  },
  'HiKu7 CS7N-660MS': {
    brand: 'Canadian Solar',
    model: 'HiKu7 CS7N-660MS',
    pMaxWatts: 660,
    vmp: 38.70,
    imp: 17.06,
    voc: 45.70,
    isc: 18.47,
    technology: 'Mono PERC HiKu7'
  },
  'HiKu7 CS7N-670MS': {
    brand: 'Canadian Solar',
    model: 'HiKu7 CS7N-670MS',
    pMaxWatts: 670,
    vmp: 39.10,
    imp: 17.14,
    voc: 46.10,
    isc: 18.55,
    technology: 'Mono PERC HiKu7'
  },
  'BiHiKu7 CS7N-665TB-AG': {
    brand: 'Canadian Solar',
    model: 'BiHiKu7 CS7N-665TB-AG',
    pMaxWatts: 665,
    vmp: 39.00,
    imp: 17.06,
    voc: 46.00,
    isc: 18.45,
    technology: 'Bifacial Dual Glass'
  },
  'BiHiKu7 CS7N-690TB-AG': {
    brand: 'Canadian Solar',
    model: 'BiHiKu7 CS7N-690TB-AG',
    pMaxWatts: 690,
    vmp: 39.90,
    imp: 17.30,
    voc: 46.90,
    isc: 18.72,
    technology: 'Bifacial Dual Glass'
  },

  // -------------------------------------------------------------
  // LONGi Solar
  // -------------------------------------------------------------
  'LR5-72HPH-550M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HPH-550M',
    pMaxWatts: 550,
    vmp: 41.95,
    imp: 13.12,
    voc: 49.80,
    isc: 13.98,
    technology: 'Hi-MO 5 Mono PERC'
  },
  'LR5-72HPH-555M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HPH-555M',
    pMaxWatts: 555,
    vmp: 42.10,
    imp: 13.19,
    voc: 49.95,
    isc: 14.04,
    technology: 'Hi-MO 5 Mono PERC'
  },
  'LR5-72HTH-565M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HTH-565M',
    pMaxWatts: 565,
    vmp: 43.61,
    imp: 12.96,
    voc: 51.91,
    isc: 13.88,
    technology: 'Hi-MO 6 Explorer'
  },
  'LR5-72HTH-570M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HTH-570M',
    pMaxWatts: 570,
    vmp: 43.76,
    imp: 13.03,
    voc: 52.06,
    isc: 13.95,
    technology: 'Hi-MO 6 Explorer'
  },
  'LR5-72HTH-575M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HTH-575M',
    pMaxWatts: 575,
    vmp: 43.91,
    imp: 13.10,
    voc: 52.21,
    isc: 14.02,
    technology: 'Hi-MO 6 Explorer'
  },
  'LR5-72HTH-580M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HTH-580M',
    pMaxWatts: 580,
    vmp: 44.06,
    imp: 13.17,
    voc: 52.41,
    isc: 14.09,
    technology: 'Hi-MO 6 Explorer'
  },
  'LR5-72HGB-590M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HGB-590M',
    pMaxWatts: 590,
    vmp: 44.36,
    imp: 13.30,
    voc: 52.80,
    isc: 14.25,
    technology: 'Hi-MO 7 TOPCon'
  },
  'LR5-72HGB-600M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HGB-600M',
    pMaxWatts: 600,
    vmp: 44.66,
    imp: 13.44,
    voc: 53.15,
    isc: 14.39,
    technology: 'Hi-MO 7 TOPCon'
  },
  'LR8-66HGD-615M': {
    brand: 'LONGi Solar',
    model: 'LR8-66HGD-615M',
    pMaxWatts: 615,
    vmp: 40.85,
    imp: 15.06,
    voc: 48.80,
    isc: 16.02,
    technology: 'Hi-MO X6 MAX'
  },
  'LR8-66HGD-620M': {
    brand: 'LONGi Solar',
    model: 'LR8-66HGD-620M',
    pMaxWatts: 620,
    vmp: 41.05,
    imp: 15.11,
    voc: 49.00,
    isc: 16.08,
    technology: 'Hi-MO X6 MAX'
  },
  'LR8-66HGD-625M': {
    brand: 'LONGi Solar',
    model: 'LR8-66HGD-625M',
    pMaxWatts: 625,
    vmp: 41.25,
    imp: 15.16,
    voc: 49.20,
    isc: 16.14,
    technology: 'Hi-MO X6 MAX'
  },
  'LR7-72HVH-640M': {
    brand: 'LONGi Solar',
    model: 'LR7-72HVH-640M',
    pMaxWatts: 640,
    vmp: 45.45,
    imp: 14.09,
    voc: 54.10,
    isc: 14.95,
    technology: 'Hi-MO 9 BC'
  },

  // -------------------------------------------------------------
  // JA Solar
  // -------------------------------------------------------------
  'JAM72S30-540/MR': {
    brand: 'JA Solar',
    model: 'JAM72S30-540/MR',
    pMaxWatts: 540,
    vmp: 41.64,
    imp: 12.97,
    voc: 49.60,
    isc: 13.86,
    technology: 'Mono PERC Half-Cell'
  },
  'JAM72S30-545/MR': {
    brand: 'JA Solar',
    model: 'JAM72S30-545/MR',
    pMaxWatts: 545,
    vmp: 41.80,
    imp: 13.04,
    voc: 49.75,
    isc: 13.93,
    technology: 'Mono PERC Half-Cell'
  },
  'JAM72S30-550/MR': {
    brand: 'JA Solar',
    model: 'JAM72S30-550/MR',
    pMaxWatts: 550,
    vmp: 41.96,
    imp: 13.11,
    voc: 49.90,
    isc: 14.00,
    technology: 'Mono PERC Half-Cell'
  },
  'JAM72S30-555/MR': {
    brand: 'JA Solar',
    model: 'JAM72S30-555/MR',
    pMaxWatts: 555,
    vmp: 42.11,
    imp: 13.18,
    voc: 50.05,
    isc: 14.07,
    technology: 'Mono PERC Half-Cell'
  },
  'JAM72S30-560/MR': {
    brand: 'JA Solar',
    model: 'JAM72S30-560/MR',
    pMaxWatts: 560,
    vmp: 42.27,
    imp: 13.25,
    voc: 50.20,
    isc: 14.14,
    technology: 'Mono PERC Half-Cell'
  },
  'JAM72D40-570/GB': {
    brand: 'JA Solar',
    model: 'JAM72D40-570/GB',
    pMaxWatts: 570,
    vmp: 42.60,
    imp: 13.38,
    voc: 50.90,
    isc: 14.28,
    technology: 'DeepBlue 4.0 Pro'
  },
  'JAM72D40-580/GB': {
    brand: 'JA Solar',
    model: 'JAM72D40-580/GB',
    pMaxWatts: 580,
    vmp: 43.05,
    imp: 13.48,
    voc: 51.35,
    isc: 14.38,
    technology: 'DeepBlue 4.0 Pro'
  },
  'JAM72D42-620/LB': {
    brand: 'JA Solar',
    model: 'JAM72D42-620/LB',
    pMaxWatts: 620,
    vmp: 42.80,
    imp: 14.49,
    voc: 51.10,
    isc: 15.35,
    technology: 'DeepBlue 4.0 Pro Bifacial'
  },

  // -------------------------------------------------------------
  // Risen Energy
  // -------------------------------------------------------------
  'Titan RSM110-8-535M': {
    brand: 'Risen Energy',
    model: 'Titan RSM110-8-535M',
    pMaxWatts: 535,
    vmp: 31.26,
    imp: 17.12,
    voc: 37.58,
    isc: 18.13,
    technology: 'Titan 110-cell PERC'
  },
  'Titan RSM110-8-540M': {
    brand: 'Risen Energy',
    model: 'Titan RSM110-8-540M',
    pMaxWatts: 540,
    vmp: 31.46,
    imp: 17.17,
    voc: 37.78,
    isc: 18.18,
    technology: 'Titan 110-cell PERC'
  },
  'Titan RSM110-8-545M': {
    brand: 'Risen Energy',
    model: 'Titan RSM110-8-545M',
    pMaxWatts: 545,
    vmp: 31.66,
    imp: 17.22,
    voc: 37.98,
    isc: 18.23,
    technology: 'Titan 110-cell PERC'
  },
  'Titan RSM110-8-550M': {
    brand: 'Risen Energy',
    model: 'Titan RSM110-8-550M',
    pMaxWatts: 550,
    vmp: 31.86,
    imp: 17.27,
    voc: 38.18,
    isc: 18.28,
    technology: 'Titan 110-cell PERC'
  },
  'Titan RSM130-8-650M': {
    brand: 'Risen Energy',
    model: 'Titan RSM130-8-650M',
    pMaxWatts: 650,
    vmp: 37.40,
    imp: 17.38,
    voc: 44.80,
    isc: 18.42,
    technology: 'Titan 130-cell PERC'
  },
  'Titan RSM130-8-660M': {
    brand: 'Risen Energy',
    model: 'Titan RSM130-8-660M',
    pMaxWatts: 660,
    vmp: 37.80,
    imp: 17.47,
    voc: 45.20,
    isc: 18.52,
    technology: 'Titan 130-cell PERC'
  },
  'Titan HJT Hyper-ion RSM110-8-700H': {
    brand: 'Risen Energy',
    model: 'Titan HJT Hyper-ion RSM110-8-700H',
    pMaxWatts: 700,
    vmp: 40.80,
    imp: 17.16,
    voc: 48.50,
    isc: 18.05,
    technology: 'Heterounión HJT'
  },

  // -------------------------------------------------------------
  // Astronergy (Chint)
  // -------------------------------------------------------------
  'CHSM54M-HC 410W': {
    brand: 'Astronergy (Chint)',
    model: 'CHSM54M-HC 410W',
    pMaxWatts: 410,
    vmp: 31.42,
    imp: 13.05,
    voc: 37.40,
    isc: 13.88,
    technology: 'Mono PERC 54-cell'
  },
  'CHSM72M-HC 540W': {
    brand: 'Astronergy (Chint)',
    model: 'CHSM72M-HC 540W',
    pMaxWatts: 540,
    vmp: 41.76,
    imp: 12.94,
    voc: 49.70,
    isc: 13.72,
    technology: 'AstroSemi Mono PERC'
  },
  'CHSM72M-HC 550W': {
    brand: 'Astronergy (Chint)',
    model: 'CHSM72M-HC 550W',
    pMaxWatts: 550,
    vmp: 42.10,
    imp: 13.07,
    voc: 50.10,
    isc: 13.84,
    technology: 'AstroSemi Mono PERC'
  },
  'Astro N5 CHSM72N(DG)/F-BH 570W': {
    brand: 'Astronergy (Chint)',
    model: 'Astro N5 CHSM72N(DG)/F-BH 570W',
    pMaxWatts: 570,
    vmp: 42.50,
    imp: 13.42,
    voc: 50.70,
    isc: 14.28,
    technology: 'Astro N5 TOPCon Bifacial'
  },
  'Astro N5 CHSM72N(DG)/F-BH 580W': {
    brand: 'Astronergy (Chint)',
    model: 'Astro N5 CHSM72N(DG)/F-BH 580W',
    pMaxWatts: 580,
    vmp: 42.90,
    imp: 13.52,
    voc: 51.10,
    isc: 14.38,
    technology: 'Astro N5 TOPCon Bifacial'
  },

  // -------------------------------------------------------------
  // DAH Solar & Anhui & Ulica
  // -------------------------------------------------------------
  'DHN-72X16/FS-550W': {
    brand: 'DAH Solar',
    model: 'DHN-72X16/FS-550W',
    pMaxWatts: 550,
    vmp: 42.00,
    imp: 13.10,
    voc: 50.20,
    isc: 13.85,
    technology: 'Full-Screen Mono'
  },
  'DHN-72X16/DG-585W': {
    brand: 'DAH Solar',
    model: 'DHN-72X16/DG-585W',
    pMaxWatts: 585,
    vmp: 43.10,
    imp: 13.58,
    voc: 51.80,
    isc: 14.35,
    technology: 'TOPCon Full-Screen'
  },
  'PF620M-SN': {
    brand: 'Anhui Solar',
    model: 'PF620M-SN',
    pMaxWatts: 620,
    vmp: 41.50,
    imp: 14.94,
    voc: 49.60,
    isc: 15.82,
    technology: 'N-Type TOPCon'
  },
  'PF620MDG-UL (620W Bifacial Dual Glass)': {
    brand: 'Ulica Solar',
    model: 'PF620MDG-UL (620W Bifacial Dual Glass)',
    pMaxWatts: 620,
    vmp: 41.40,
    imp: 14.98,
    voc: 49.50,
    isc: 15.88,
    technology: 'TOPCon Bifacial Dual Glass'
  },
};

/**
 * Obtiene la ficha técnica eléctrica de un módulo fotovoltaico.
 * Si el modelo exacto no está en la base de datos, calcula de forma inteligente
 * los valores nominales Vmp, Imp, Voc, Isc en base a la potencia en Watts.
 */
export function getPvModuleSpecs(brand?: string, model?: string, customWatts?: number): PvModuleElectricalSpecs {
  const defaultBrand = brand || 'Jinko Solar';
  const defaultModel = model || 'JKM550M-72HL4 550W Mono PERC Half-Cell';

  // 1. Check exact model key in catalog
  if (model && KNOWN_PV_MODULES_CATALOG[model]) {
    return KNOWN_PV_MODULES_CATALOG[model];
  }

  // 2. Check full brand - model combo
  const fullCombo = `${defaultBrand} - ${defaultModel}`;
  if (KNOWN_PV_MODULES_CATALOG[fullCombo]) {
    return KNOWN_PV_MODULES_CATALOG[fullCombo];
  }

  // 3. Search substring match
  for (const [key, specs] of Object.entries(KNOWN_PV_MODULES_CATALOG)) {
    if (model && key.toLowerCase().includes(model.toLowerCase())) {
      return specs;
    }
  }

  // 4. Fallback: Parse Watts and calculate typical physical curve
  let watts = customWatts || 550;
  if (!customWatts && model) {
    const wMatch = model.match(/(\d{3,4})\s*W/i);
    if (wMatch && wMatch[1]) {
      watts = parseInt(wMatch[1], 10);
    } else {
      const numMatch = model.match(/\b(3\d\d|4\d\d|5\d\d|6\d\d|7\d\d)\b/);
      if (numMatch) {
        watts = parseInt(numMatch[1], 10);
      }
    }
  }

  // Typical modern 72-cell / 78-cell / 54-cell module characteristics:
  // For ~400W (54-cell): Vmp ~ 31.5V, Imp ~ 13.0A
  // For ~550W (72-cell): Vmp ~ 41.9V, Imp ~ 13.1A
  // For ~580W-600W (TOPCon): Vmp ~ 43.0V, Imp ~ 13.8A
  // For ~620W-640W: Vmp ~ 45.5V, Imp ~ 13.7A or 41V, 15A
  // For ~660W-700W (66-cell large / 130-cell): Vmp ~ 39.0V, Imp ~ 17.2A
  let estimatedVmp = 41.9;
  let estimatedImp = 13.12;

  if (watts <= 430) {
    // 54-cell residential format
    estimatedVmp = 31.5;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
  } else if (watts <= 570) {
    // Standard 72-cell PERC
    estimatedVmp = 41.9;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
  } else if (watts <= 610) {
    // 72-cell N-Type TOPCon
    estimatedVmp = 43.0;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
  } else if (watts <= 645) {
    // 78-cell N-Type TOPCon
    estimatedVmp = 46.5;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
  } else {
    // 66-cell large format / 130-cell 210mm wafer
    estimatedVmp = 39.5;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
  }

  const estimatedVoc = Math.round(estimatedVmp * 1.19 * 100) / 100;
  const estimatedIsc = Math.round(estimatedImp * 1.06 * 100) / 100;

  return {
    brand: defaultBrand,
    model: defaultModel,
    pMaxWatts: watts,
    vmp: estimatedVmp,
    imp: estimatedImp,
    voc: estimatedVoc,
    isc: estimatedIsc,
    technology: 'Monocristalino Certificado SEC',
  };
}
