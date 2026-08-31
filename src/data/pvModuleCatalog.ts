/**
 * Catálogo de Fichas Técnicas Eléctricas de Módulos Fotovoltaicos Certificados SEC
 * Incluye parámetros eléctricos STC (Standard Test Conditions: 1000 W/m², 25°C, AM 1.5):
 * - Pmax: Potencia Máxima (Watts)
 * - Vmp: Voltaje a Máxima Potencia (V)
 * - Imp: Corriente a Máxima Potencia (A)
 * - Voc: Voltaje de Circuito Abierto (V)
 * - Isc: Corriente de Cortocircuito (A)
 * - Coeficiente de temperatura (%/°C)
 * - Tecnología de celda (Mono PERC, N-Type TOPCon, HJT, Bifacial)
 */

export interface PvModuleElectricalSpecs {
  id?: string;
  brand: string;
  model: string;
  pMaxWatts: number;
  vmp: number;
  imp: number;
  voc: number;
  isc: number;
  technology: string;
  tempCoeffPmax?: number; // %/°C ej: -0.30
  tempCoeffVoc?: number;  // %/°C ej: -0.25
  efficiency?: number;    // % ej: 22.5
  dimensions?: string;    // mm ej: 2278 x 1134 x 35
  weightKg?: number;      // kg ej: 28.0
  isCustom?: boolean;     // true si fue creado por el usuario
  secApproved?: boolean;  // Aprobado SEC
  notes?: string;
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
    technology: 'Mono PERC 72HL4',
    tempCoeffPmax: -0.35,
    efficiency: 21.29,
    secApproved: true
  },
  'JKM555M-72HL4 555W Mono PERC Half-Cell': {
    brand: 'Jinko Solar',
    model: 'JKM555M-72HL4 555W Mono PERC Half-Cell',
    pMaxWatts: 555,
    vmp: 41.10,
    imp: 13.50,
    voc: 49.78,
    isc: 14.07,
    technology: 'Mono PERC 72HL4',
    tempCoeffPmax: -0.35,
    efficiency: 21.48,
    secApproved: true
  },
  'JKM560M-72HL4 560W Mono PERC Half-Cell': {
    brand: 'Jinko Solar',
    model: 'JKM560M-72HL4 560W Mono PERC Half-Cell',
    pMaxWatts: 560,
    vmp: 41.30,
    imp: 13.56,
    voc: 49.98,
    isc: 14.13,
    technology: 'Mono PERC 72HL4',
    tempCoeffPmax: -0.35,
    efficiency: 21.68,
    secApproved: true
  },
  'JKM565M-72HL4-V 565W Mono PERC 1500V': {
    brand: 'Jinko Solar',
    model: 'JKM565M-72HL4-V 565W Mono PERC 1500V',
    pMaxWatts: 565,
    vmp: 41.50,
    imp: 13.62,
    voc: 50.18,
    isc: 14.19,
    technology: 'Mono PERC 1500V',
    tempCoeffPmax: -0.35,
    efficiency: 21.87,
    secApproved: true
  },
  'JKM570M-72HL4-V 570W Mono PERC 1500V': {
    brand: 'Jinko Solar',
    model: 'JKM570M-72HL4-V 570W Mono PERC 1500V',
    pMaxWatts: 570,
    vmp: 41.70,
    imp: 13.67,
    voc: 50.38,
    isc: 14.25,
    technology: 'Mono PERC 1500V',
    tempCoeffPmax: -0.35,
    efficiency: 22.07,
    secApproved: true
  },
  'JKM575M-72HL4-V 575W Mono PERC 1500V': {
    brand: 'Jinko Solar',
    model: 'JKM575M-72HL4-V 575W Mono PERC 1500V',
    pMaxWatts: 575,
    vmp: 41.90,
    imp: 13.72,
    voc: 50.58,
    isc: 14.31,
    technology: 'Mono PERC 1500V',
    tempCoeffPmax: -0.35,
    efficiency: 22.26,
    secApproved: true
  },
  'JKM580M-72HL4-V 580W Mono PERC 1500V': {
    brand: 'Jinko Solar',
    model: 'JKM580M-72HL4-V 580W Mono PERC 1500V',
    pMaxWatts: 580,
    vmp: 42.10,
    imp: 13.78,
    voc: 50.78,
    isc: 14.37,
    technology: 'Mono PERC 1500V',
    tempCoeffPmax: -0.35,
    efficiency: 22.45,
    secApproved: true
  },
  'Tiger Neo N-type JKM585N-72HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM585N-72HL4-V',
    pMaxWatts: 585,
    vmp: 42.61,
    imp: 13.73,
    voc: 51.10,
    isc: 14.47,
    technology: 'N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 22.65,
    secApproved: true
  },
  'Tiger Neo N-type JKM590N-72HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM590N-72HL4-V',
    pMaxWatts: 590,
    vmp: 42.80,
    imp: 13.79,
    voc: 51.30,
    isc: 14.53,
    technology: 'N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 22.84,
    secApproved: true
  },
  'Tiger Neo N-type JKM595N-72HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM595N-72HL4-V',
    pMaxWatts: 595,
    vmp: 43.00,
    imp: 13.84,
    voc: 51.50,
    isc: 14.59,
    technology: 'N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 23.03,
    secApproved: true
  },
  'Tiger Neo N-type JKM600N-72HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM600N-72HL4-V',
    pMaxWatts: 600,
    vmp: 43.20,
    imp: 13.89,
    voc: 51.70,
    isc: 14.65,
    technology: 'N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 23.23,
    secApproved: true
  },
  'Tiger Neo N-type JKM615N-78HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM615N-78HL4-V',
    pMaxWatts: 615,
    vmp: 46.50,
    imp: 13.23,
    voc: 56.10,
    isc: 13.91,
    technology: 'N-Type TOPCon 78HL4',
    tempCoeffPmax: -0.30,
    efficiency: 22.02,
    secApproved: true
  },
  'Tiger Neo N-type JKM620N-78HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM620N-78HL4-V',
    pMaxWatts: 620,
    vmp: 46.85,
    imp: 13.23,
    voc: 56.48,
    isc: 13.98,
    technology: 'N-Type TOPCon 78HL4',
    tempCoeffPmax: -0.30,
    efficiency: 22.20,
    secApproved: true
  },
  'Tiger Neo N-type JKM625N-78HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM625N-78HL4-V',
    pMaxWatts: 625,
    vmp: 47.10,
    imp: 13.27,
    voc: 56.70,
    isc: 14.04,
    technology: 'N-Type TOPCon 78HL4',
    tempCoeffPmax: -0.30,
    efficiency: 22.38,
    secApproved: true
  },
  'Tiger Neo N-type JKM630N-78HL4-V': {
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type JKM630N-78HL4-V',
    pMaxWatts: 630,
    vmp: 47.35,
    imp: 13.31,
    voc: 56.95,
    isc: 14.10,
    technology: 'N-Type TOPCon 78HL4',
    tempCoeffPmax: -0.30,
    efficiency: 22.56,
    secApproved: true
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
    technology: 'Mono PERC HiKu6',
    tempCoeffPmax: -0.34,
    efficiency: 21.3,
    secApproved: true
  },
  'HiKu6 CS6W-550MS': {
    brand: 'Canadian Solar',
    model: 'HiKu6 CS6W-550MS',
    pMaxWatts: 550,
    vmp: 41.90,
    imp: 13.13,
    voc: 49.80,
    isc: 14.00,
    technology: 'Mono PERC HiKu6',
    tempCoeffPmax: -0.34,
    efficiency: 21.5,
    secApproved: true
  },
  'HiKu6 CS6W-555MS': {
    brand: 'Canadian Solar',
    model: 'HiKu6 CS6W-555MS',
    pMaxWatts: 555,
    vmp: 42.10,
    imp: 13.19,
    voc: 50.00,
    isc: 14.05,
    technology: 'Mono PERC HiKu6',
    tempCoeffPmax: -0.34,
    efficiency: 21.7,
    secApproved: true
  },
  'CS6W-585T': {
    brand: 'Canadian Solar',
    model: 'CS6W-585T',
    pMaxWatts: 585,
    vmp: 43.10,
    imp: 13.58,
    voc: 51.80,
    isc: 14.35,
    technology: 'TOPBiHiKu6 N-Type',
    tempCoeffPmax: -0.29,
    efficiency: 22.6,
    secApproved: true
  },
  'CS6W-590T': {
    brand: 'Canadian Solar',
    model: 'CS6W-590T',
    pMaxWatts: 590,
    vmp: 43.30,
    imp: 13.63,
    voc: 52.00,
    isc: 14.40,
    technology: 'TOPBiHiKu6 N-Type',
    tempCoeffPmax: -0.29,
    efficiency: 22.8,
    secApproved: true
  },
  'CS6.2-66TB-615': {
    brand: 'Canadian Solar',
    model: 'CS6.2-66TB-615',
    pMaxWatts: 615,
    vmp: 40.00,
    imp: 15.38,
    voc: 48.20,
    isc: 16.25,
    technology: 'TOPCon Bifacial',
    tempCoeffPmax: -0.29,
    efficiency: 22.8,
    secApproved: true
  },
  'CS6.2-66TB-620 (620W TOPCon Bifacial)': {
    brand: 'Canadian Solar',
    model: 'CS6.2-66TB-620 (620W TOPCon Bifacial)',
    pMaxWatts: 620,
    vmp: 40.20,
    imp: 15.43,
    voc: 48.40,
    isc: 16.32,
    technology: 'TOPCon Bifacial',
    tempCoeffPmax: -0.29,
    efficiency: 23.0,
    secApproved: true
  },
  'BiHiKu6 CS6W-540MB-AG': {
    brand: 'Canadian Solar',
    model: 'BiHiKu6 CS6W-540MB-AG',
    pMaxWatts: 540,
    vmp: 41.50,
    imp: 13.02,
    voc: 49.40,
    isc: 13.89,
    technology: 'BiHiKu6 Bifacial PERC',
    tempCoeffPmax: -0.34,
    efficiency: 21.1,
    secApproved: true
  },
  'BiHiKu6 CS6W-550MB-AG': {
    brand: 'Canadian Solar',
    model: 'BiHiKu6 CS6W-550MB-AG',
    pMaxWatts: 550,
    vmp: 41.90,
    imp: 13.13,
    voc: 49.80,
    isc: 14.00,
    technology: 'BiHiKu6 Bifacial PERC',
    tempCoeffPmax: -0.34,
    efficiency: 21.5,
    secApproved: true
  },
  'HiKu7 CS7N-650MS': {
    brand: 'Canadian Solar',
    model: 'HiKu7 CS7N-650MS',
    pMaxWatts: 650,
    vmp: 38.30,
    imp: 16.98,
    voc: 45.30,
    isc: 18.39,
    technology: 'Mono PERC HiKu7 132-cell',
    tempCoeffPmax: -0.34,
    efficiency: 20.9,
    secApproved: true
  },
  'HiKu7 CS7N-655MS': {
    brand: 'Canadian Solar',
    model: 'HiKu7 CS7N-655MS',
    pMaxWatts: 655,
    vmp: 38.50,
    imp: 17.02,
    voc: 45.50,
    isc: 18.43,
    technology: 'Mono PERC HiKu7 132-cell',
    tempCoeffPmax: -0.34,
    efficiency: 21.1,
    secApproved: true
  },
  'HiKu7 CS7N-660MS': {
    brand: 'Canadian Solar',
    model: 'HiKu7 CS7N-660MS',
    pMaxWatts: 660,
    vmp: 38.70,
    imp: 17.06,
    voc: 45.70,
    isc: 18.47,
    technology: 'Mono PERC HiKu7 132-cell',
    tempCoeffPmax: -0.34,
    efficiency: 21.2,
    secApproved: true
  },
  'HiKu7 CS7N-670MS': {
    brand: 'Canadian Solar',
    model: 'HiKu7 CS7N-670MS',
    pMaxWatts: 670,
    vmp: 39.10,
    imp: 17.14,
    voc: 46.10,
    isc: 18.55,
    technology: 'Mono PERC HiKu7 132-cell',
    tempCoeffPmax: -0.34,
    efficiency: 21.6,
    secApproved: true
  },
  'BiHiKu7 CS7N-665TB-AG': {
    brand: 'Canadian Solar',
    model: 'BiHiKu7 CS7N-665TB-AG',
    pMaxWatts: 665,
    vmp: 39.00,
    imp: 17.06,
    voc: 46.00,
    isc: 18.45,
    technology: 'Bifacial Dual Glass',
    tempCoeffPmax: -0.29,
    efficiency: 21.4,
    secApproved: true
  },
  'BiHiKu7 CS7N-690TB-AG': {
    brand: 'Canadian Solar',
    model: 'BiHiKu7 CS7N-690TB-AG',
    pMaxWatts: 690,
    vmp: 39.90,
    imp: 17.30,
    voc: 46.90,
    isc: 18.72,
    technology: 'Bifacial Dual Glass TOPCon',
    tempCoeffPmax: -0.29,
    efficiency: 22.2,
    secApproved: true
  },

  // -------------------------------------------------------------
  // LONGi Solar
  // -------------------------------------------------------------
  'LR5-72HPH-545M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HPH-545M',
    pMaxWatts: 545,
    vmp: 41.80,
    imp: 13.04,
    voc: 49.65,
    isc: 13.92,
    technology: 'Hi-MO 5 Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 21.1,
    secApproved: true
  },
  'LR5-72HPH-550M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HPH-550M',
    pMaxWatts: 550,
    vmp: 41.95,
    imp: 13.12,
    voc: 49.80,
    isc: 13.98,
    technology: 'Hi-MO 5 Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 21.3,
    secApproved: true
  },
  'LR5-72HPH-555M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HPH-555M',
    pMaxWatts: 555,
    vmp: 42.10,
    imp: 13.19,
    voc: 49.95,
    isc: 14.04,
    technology: 'Hi-MO 5 Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 21.5,
    secApproved: true
  },
  'LR5-72HTH-565M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HTH-565M',
    pMaxWatts: 565,
    vmp: 43.61,
    imp: 12.96,
    voc: 51.91,
    isc: 13.88,
    technology: 'Hi-MO 6 Explorer HPBC',
    tempCoeffPmax: -0.29,
    efficiency: 21.9,
    secApproved: true
  },
  'LR5-72HTH-570M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HTH-570M',
    pMaxWatts: 570,
    vmp: 43.76,
    imp: 13.03,
    voc: 52.06,
    isc: 13.95,
    technology: 'Hi-MO 6 Explorer HPBC',
    tempCoeffPmax: -0.29,
    efficiency: 22.1,
    secApproved: true
  },
  'LR5-72HTH-575M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HTH-575M',
    pMaxWatts: 575,
    vmp: 43.91,
    imp: 13.10,
    voc: 52.21,
    isc: 14.02,
    technology: 'Hi-MO 6 Explorer HPBC',
    tempCoeffPmax: -0.29,
    efficiency: 22.3,
    secApproved: true
  },
  'LR5-72HTH-580M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HTH-580M',
    pMaxWatts: 580,
    vmp: 44.06,
    imp: 13.17,
    voc: 52.41,
    isc: 14.09,
    technology: 'Hi-MO 6 Explorer HPBC',
    tempCoeffPmax: -0.29,
    efficiency: 22.5,
    secApproved: true
  },
  'LR5-72HGB-590M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HGB-590M',
    pMaxWatts: 590,
    vmp: 44.36,
    imp: 13.30,
    voc: 52.80,
    isc: 14.25,
    technology: 'Hi-MO 7 TOPCon Bifacial',
    tempCoeffPmax: -0.28,
    efficiency: 22.8,
    secApproved: true
  },
  'LR5-72HGB-600M': {
    brand: 'LONGi Solar',
    model: 'LR5-72HGB-600M',
    pMaxWatts: 600,
    vmp: 44.66,
    imp: 13.44,
    voc: 53.15,
    isc: 14.39,
    technology: 'Hi-MO 7 TOPCon Bifacial',
    tempCoeffPmax: -0.28,
    efficiency: 23.2,
    secApproved: true
  },
  'LR8-66HGD-615M': {
    brand: 'LONGi Solar',
    model: 'LR8-66HGD-615M',
    pMaxWatts: 615,
    vmp: 40.85,
    imp: 15.06,
    voc: 48.80,
    isc: 16.02,
    technology: 'Hi-MO X6 MAX HPBC',
    tempCoeffPmax: -0.28,
    efficiency: 22.8,
    secApproved: true
  },
  'LR8-66HGD-620M': {
    brand: 'LONGi Solar',
    model: 'LR8-66HGD-620M',
    pMaxWatts: 620,
    vmp: 41.05,
    imp: 15.11,
    voc: 49.00,
    isc: 16.08,
    technology: 'Hi-MO X6 MAX HPBC',
    tempCoeffPmax: -0.28,
    efficiency: 23.0,
    secApproved: true
  },
  'LR8-66HGD-625M': {
    brand: 'LONGi Solar',
    model: 'LR8-66HGD-625M',
    pMaxWatts: 625,
    vmp: 41.25,
    imp: 15.16,
    voc: 49.20,
    isc: 16.14,
    technology: 'Hi-MO X6 MAX HPBC',
    tempCoeffPmax: -0.28,
    efficiency: 23.1,
    secApproved: true
  },
  'LR7-72HVH-640M': {
    brand: 'LONGi Solar',
    model: 'LR7-72HVH-640M',
    pMaxWatts: 640,
    vmp: 45.45,
    imp: 14.09,
    voc: 54.10,
    isc: 14.95,
    technology: 'Hi-MO 9 BC N-Type',
    tempCoeffPmax: -0.26,
    efficiency: 23.7,
    secApproved: true
  },

  // -------------------------------------------------------------
  // Trina Solar
  // -------------------------------------------------------------
  'Vertex S+ TSM-NEG9R.28 440W': {
    brand: 'Trina Solar',
    model: 'Vertex S+ TSM-NEG9R.28 440W',
    pMaxWatts: 440,
    vmp: 44.00,
    imp: 10.01,
    voc: 52.20,
    isc: 10.67,
    technology: 'Vertex S+ N-Type Dual Glass',
    tempCoeffPmax: -0.30,
    efficiency: 22.0,
    secApproved: true
  },
  'Vertex S+ TSM-NEG9R.28 445W': {
    brand: 'Trina Solar',
    model: 'Vertex S+ TSM-NEG9R.28 445W',
    pMaxWatts: 445,
    vmp: 44.30,
    imp: 10.05,
    voc: 52.60,
    isc: 10.71,
    technology: 'Vertex S+ N-Type Dual Glass',
    tempCoeffPmax: -0.30,
    efficiency: 22.3,
    secApproved: true
  },
  'Vertex S+ TSM-NEG9R.28 450W': {
    brand: 'Trina Solar',
    model: 'Vertex S+ TSM-NEG9R.28 450W',
    pMaxWatts: 450,
    vmp: 44.60,
    imp: 10.09,
    voc: 52.90,
    isc: 10.74,
    technology: 'Vertex S+ N-Type Dual Glass',
    tempCoeffPmax: -0.30,
    efficiency: 22.5,
    secApproved: true
  },
  'Vertex TSM-DE19 545W': {
    brand: 'Trina Solar',
    model: 'Vertex TSM-DE19 545W',
    pMaxWatts: 545,
    vmp: 31.40,
    imp: 17.37,
    voc: 37.70,
    isc: 18.47,
    technology: 'Vertex 210mm Mono PERC',
    tempCoeffPmax: -0.34,
    efficiency: 20.9,
    secApproved: true
  },
  'Vertex TSM-DE19 550W': {
    brand: 'Trina Solar',
    model: 'Vertex TSM-DE19 550W',
    pMaxWatts: 550,
    vmp: 31.60,
    imp: 17.40,
    voc: 37.90,
    isc: 18.52,
    technology: 'Vertex 210mm Mono PERC',
    tempCoeffPmax: -0.34,
    efficiency: 21.0,
    secApproved: true
  },
  'Vertex TSM-DEG20C.20 600W': {
    brand: 'Trina Solar',
    model: 'Vertex TSM-DEG20C.20 600W',
    pMaxWatts: 600,
    vmp: 34.70,
    imp: 17.30,
    voc: 41.70,
    isc: 18.42,
    technology: 'Vertex Bifacial Dual Glass',
    tempCoeffPmax: -0.34,
    efficiency: 21.4,
    secApproved: true
  },
  'Vertex TSM-DEG21C.20 660W': {
    brand: 'Trina Solar',
    model: 'Vertex TSM-DEG21C.20 660W',
    pMaxWatts: 660,
    vmp: 38.30,
    imp: 17.24,
    voc: 45.90,
    isc: 18.33,
    technology: 'Vertex 132-cell Bifacial Dual Glass',
    tempCoeffPmax: -0.34,
    efficiency: 21.2,
    secApproved: true
  },
  'Vertex TSM-DEG21C.20 670W': {
    brand: 'Trina Solar',
    model: 'Vertex TSM-DEG21C.20 670W',
    pMaxWatts: 670,
    vmp: 38.70,
    imp: 17.32,
    voc: 46.30,
    isc: 18.42,
    technology: 'Vertex 132-cell Bifacial Dual Glass',
    tempCoeffPmax: -0.34,
    efficiency: 21.6,
    secApproved: true
  },
  'Vertex TSM-DEG21C.20 690W': {
    brand: 'Trina Solar',
    model: 'Vertex TSM-DEG21C.20 690W',
    pMaxWatts: 690,
    vmp: 39.50,
    imp: 17.47,
    voc: 47.10,
    isc: 18.57,
    technology: 'Vertex N-Type TOPCon Dual Glass',
    tempCoeffPmax: -0.29,
    efficiency: 22.2,
    secApproved: true
  },
  'Vertex TSM-DEG21C.20 700W': {
    brand: 'Trina Solar',
    model: 'Vertex TSM-DEG21C.20 700W',
    pMaxWatts: 700,
    vmp: 39.90,
    imp: 17.55,
    voc: 47.50,
    isc: 18.66,
    technology: 'Vertex N-Type TOPCon Dual Glass',
    tempCoeffPmax: -0.29,
    efficiency: 22.5,
    secApproved: true
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
    technology: 'Mono PERC Half-Cell',
    tempCoeffPmax: -0.35,
    efficiency: 20.9,
    secApproved: true
  },
  'JAM72S30-545/MR': {
    brand: 'JA Solar',
    model: 'JAM72S30-545/MR',
    pMaxWatts: 545,
    vmp: 41.80,
    imp: 13.04,
    voc: 49.75,
    isc: 13.93,
    technology: 'Mono PERC Half-Cell',
    tempCoeffPmax: -0.35,
    efficiency: 21.1,
    secApproved: true
  },
  'JAM72S30-550/MR': {
    brand: 'JA Solar',
    model: 'JAM72S30-550/MR',
    pMaxWatts: 550,
    vmp: 41.96,
    imp: 13.11,
    voc: 49.90,
    isc: 14.00,
    technology: 'Mono PERC Half-Cell',
    tempCoeffPmax: -0.35,
    efficiency: 21.3,
    secApproved: true
  },
  'JAM72S30-555/MR': {
    brand: 'JA Solar',
    model: 'JAM72S30-555/MR',
    pMaxWatts: 555,
    vmp: 42.11,
    imp: 13.18,
    voc: 50.05,
    isc: 14.07,
    technology: 'Mono PERC Half-Cell',
    tempCoeffPmax: -0.35,
    efficiency: 21.5,
    secApproved: true
  },
  'JAM72S30-560/MR': {
    brand: 'JA Solar',
    model: 'JAM72S30-560/MR',
    pMaxWatts: 560,
    vmp: 42.27,
    imp: 13.25,
    voc: 50.20,
    isc: 14.14,
    technology: 'Mono PERC Half-Cell',
    tempCoeffPmax: -0.35,
    efficiency: 21.7,
    secApproved: true
  },
  'JAM72D30-540/MB': {
    brand: 'JA Solar',
    model: 'JAM72D30-540/MB',
    pMaxWatts: 540,
    vmp: 41.64,
    imp: 12.97,
    voc: 49.60,
    isc: 13.86,
    technology: 'DeepBlue 3.0 Bifacial',
    tempCoeffPmax: -0.35,
    efficiency: 20.9,
    secApproved: true
  },
  'JAM72D30-550/MB': {
    brand: 'JA Solar',
    model: 'JAM72D30-550/MB',
    pMaxWatts: 550,
    vmp: 41.96,
    imp: 13.11,
    voc: 49.90,
    isc: 14.00,
    technology: 'DeepBlue 3.0 Bifacial',
    tempCoeffPmax: -0.35,
    efficiency: 21.3,
    secApproved: true
  },
  'JAM72D40-570/GB': {
    brand: 'JA Solar',
    model: 'JAM72D40-570/GB',
    pMaxWatts: 570,
    vmp: 42.60,
    imp: 13.38,
    voc: 50.90,
    isc: 14.28,
    technology: 'DeepBlue 4.0 Pro N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 22.0,
    secApproved: true
  },
  'JAM72D40-575/GB': {
    brand: 'JA Solar',
    model: 'JAM72D40-575/GB',
    pMaxWatts: 575,
    vmp: 42.82,
    imp: 13.43,
    voc: 51.12,
    isc: 14.33,
    technology: 'DeepBlue 4.0 Pro N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 22.3,
    secApproved: true
  },
  'JAM72D40-580/GB': {
    brand: 'JA Solar',
    model: 'JAM72D40-580/GB',
    pMaxWatts: 580,
    vmp: 43.05,
    imp: 13.48,
    voc: 51.35,
    isc: 14.38,
    technology: 'DeepBlue 4.0 Pro N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 22.5,
    secApproved: true
  },
  'JAM72D40-585/GB': {
    brand: 'JA Solar',
    model: 'JAM72D40-585/GB',
    pMaxWatts: 585,
    vmp: 43.28,
    imp: 13.52,
    voc: 51.58,
    isc: 14.43,
    technology: 'DeepBlue 4.0 Pro N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 22.6,
    secApproved: true
  },
  'JAM72D42-620/LB': {
    brand: 'JA Solar',
    model: 'JAM72D42-620/LB',
    pMaxWatts: 620,
    vmp: 42.80,
    imp: 14.49,
    voc: 51.10,
    isc: 15.35,
    technology: 'DeepBlue 4.0 Pro Bifacial',
    tempCoeffPmax: -0.30,
    efficiency: 23.0,
    secApproved: true
  },
  'JAM72D42-625/LB': {
    brand: 'JA Solar',
    model: 'JAM72D42-625/LB',
    pMaxWatts: 625,
    vmp: 43.02,
    imp: 14.53,
    voc: 51.32,
    isc: 15.40,
    technology: 'DeepBlue 4.0 Pro Bifacial',
    tempCoeffPmax: -0.30,
    efficiency: 23.1,
    secApproved: true
  },
  'JAM72D42-630/LB': {
    brand: 'JA Solar',
    model: 'JAM72D42-630/LB',
    pMaxWatts: 630,
    vmp: 43.25,
    imp: 14.57,
    voc: 51.55,
    isc: 15.45,
    technology: 'DeepBlue 4.0 Pro Bifacial',
    tempCoeffPmax: -0.30,
    efficiency: 23.3,
    secApproved: true
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
    technology: 'Titan 110-cell Mono PERC',
    tempCoeffPmax: -0.34,
    efficiency: 20.5,
    secApproved: true
  },
  'Titan RSM110-8-540M': {
    brand: 'Risen Energy',
    model: 'Titan RSM110-8-540M',
    pMaxWatts: 540,
    vmp: 31.46,
    imp: 17.17,
    voc: 37.78,
    isc: 18.18,
    technology: 'Titan 110-cell Mono PERC',
    tempCoeffPmax: -0.34,
    efficiency: 20.7,
    secApproved: true
  },
  'Titan RSM110-8-545M': {
    brand: 'Risen Energy',
    model: 'Titan RSM110-8-545M',
    pMaxWatts: 545,
    vmp: 31.66,
    imp: 17.22,
    voc: 37.98,
    isc: 18.23,
    technology: 'Titan 110-cell Mono PERC',
    tempCoeffPmax: -0.34,
    efficiency: 20.9,
    secApproved: true
  },
  'Titan RSM110-8-550M': {
    brand: 'Risen Energy',
    model: 'Titan RSM110-8-550M',
    pMaxWatts: 550,
    vmp: 31.86,
    imp: 17.27,
    voc: 38.18,
    isc: 18.28,
    technology: 'Titan 110-cell Mono PERC',
    tempCoeffPmax: -0.34,
    efficiency: 21.1,
    secApproved: true
  },
  'Titan RSM110-8-555M': {
    brand: 'Risen Energy',
    model: 'Titan RSM110-8-555M',
    pMaxWatts: 555,
    vmp: 32.06,
    imp: 17.32,
    voc: 38.38,
    isc: 18.33,
    technology: 'Titan 110-cell Mono PERC',
    tempCoeffPmax: -0.34,
    efficiency: 21.3,
    secApproved: true
  },
  'Titan RSM130-8-650M': {
    brand: 'Risen Energy',
    model: 'Titan RSM130-8-650M',
    pMaxWatts: 650,
    vmp: 37.40,
    imp: 17.38,
    voc: 44.80,
    isc: 18.42,
    technology: 'Titan 130-cell Mono PERC',
    tempCoeffPmax: -0.34,
    efficiency: 20.9,
    secApproved: true
  },
  'Titan RSM130-8-660M': {
    brand: 'Risen Energy',
    model: 'Titan RSM130-8-660M',
    pMaxWatts: 660,
    vmp: 37.80,
    imp: 17.47,
    voc: 45.20,
    isc: 18.52,
    technology: 'Titan 130-cell Mono PERC',
    tempCoeffPmax: -0.34,
    efficiency: 21.2,
    secApproved: true
  },
  'Titan HJT Hyper-ion RSM110-8-700H': {
    brand: 'Risen Energy',
    model: 'Titan HJT Hyper-ion RSM110-8-700H',
    pMaxWatts: 700,
    vmp: 40.80,
    imp: 17.16,
    voc: 48.50,
    isc: 18.05,
    technology: 'Heterounión HJT Bifacial',
    tempCoeffPmax: -0.24,
    efficiency: 22.5,
    secApproved: true
  },
  'Titan HJT Hyper-ion RSM110-8-705H': {
    brand: 'Risen Energy',
    model: 'Titan HJT Hyper-ion RSM110-8-705H',
    pMaxWatts: 705,
    vmp: 41.00,
    imp: 17.20,
    voc: 48.70,
    isc: 18.10,
    technology: 'Heterounión HJT Bifacial',
    tempCoeffPmax: -0.24,
    efficiency: 22.7,
    secApproved: true
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
    technology: 'Mono PERC 54-cell',
    tempCoeffPmax: -0.35,
    efficiency: 21.0,
    secApproved: true
  },
  'CHSM54M-HC 415W': {
    brand: 'Astronergy (Chint)',
    model: 'CHSM54M-HC 415W',
    pMaxWatts: 415,
    vmp: 31.60,
    imp: 13.13,
    voc: 37.60,
    isc: 13.96,
    technology: 'Mono PERC 54-cell',
    tempCoeffPmax: -0.35,
    efficiency: 21.3,
    secApproved: true
  },
  'CHSM72M-HC 540W': {
    brand: 'Astronergy (Chint)',
    model: 'CHSM72M-HC 540W',
    pMaxWatts: 540,
    vmp: 41.76,
    imp: 12.94,
    voc: 49.70,
    isc: 13.72,
    technology: 'AstroSemi Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 20.9,
    secApproved: true
  },
  'CHSM72M-HC 545W': {
    brand: 'Astronergy (Chint)',
    model: 'CHSM72M-HC 545W',
    pMaxWatts: 545,
    vmp: 41.93,
    imp: 13.00,
    voc: 49.90,
    isc: 13.78,
    technology: 'AstroSemi Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 21.1,
    secApproved: true
  },
  'CHSM72M-HC 550W': {
    brand: 'Astronergy (Chint)',
    model: 'CHSM72M-HC 550W',
    pMaxWatts: 550,
    vmp: 42.10,
    imp: 13.07,
    voc: 50.10,
    isc: 13.84,
    technology: 'AstroSemi Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 21.3,
    secApproved: true
  },
  'CHSM72M-HC 555W': {
    brand: 'Astronergy (Chint)',
    model: 'CHSM72M-HC 555W',
    pMaxWatts: 555,
    vmp: 42.27,
    imp: 13.13,
    voc: 50.30,
    isc: 13.90,
    technology: 'AstroSemi Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 21.5,
    secApproved: true
  },
  'Astro N5 CHSM72N(DG)/F-BH 570W': {
    brand: 'Astronergy (Chint)',
    model: 'Astro N5 CHSM72N(DG)/F-BH 570W',
    pMaxWatts: 570,
    vmp: 42.50,
    imp: 13.42,
    voc: 50.70,
    isc: 14.28,
    technology: 'Astro N5 TOPCon Bifacial',
    tempCoeffPmax: -0.30,
    efficiency: 22.1,
    secApproved: true
  },
  'Astro N5 CHSM72N(DG)/F-BH 575W': {
    brand: 'Astronergy (Chint)',
    model: 'Astro N5 CHSM72N(DG)/F-BH 575W',
    pMaxWatts: 575,
    vmp: 42.70,
    imp: 13.47,
    voc: 50.90,
    isc: 14.33,
    technology: 'Astro N5 TOPCon Bifacial',
    tempCoeffPmax: -0.30,
    efficiency: 22.3,
    secApproved: true
  },
  'Astro N5 CHSM72N(DG)/F-BH 580W': {
    brand: 'Astronergy (Chint)',
    model: 'Astro N5 CHSM72N(DG)/F-BH 580W',
    pMaxWatts: 580,
    vmp: 42.90,
    imp: 13.52,
    voc: 51.10,
    isc: 14.38,
    technology: 'Astro N5 TOPCon Bifacial',
    tempCoeffPmax: -0.30,
    efficiency: 22.5,
    secApproved: true
  },
  'Astro N5 CHSM72N(DG)/F-BH 585W': {
    brand: 'Astronergy (Chint)',
    model: 'Astro N5 CHSM72N(DG)/F-BH 585W',
    pMaxWatts: 585,
    vmp: 43.10,
    imp: 13.57,
    voc: 51.30,
    isc: 14.43,
    technology: 'Astro N5 TOPCon Bifacial',
    tempCoeffPmax: -0.30,
    efficiency: 22.7,
    secApproved: true
  },

  // -------------------------------------------------------------
  // DAH Solar & Anhui & Ulica & Suntech & Hyundai
  // -------------------------------------------------------------
  'DHN-72X16/FS-550W': {
    brand: 'DAH Solar',
    model: 'DHN-72X16/FS-550W',
    pMaxWatts: 550,
    vmp: 42.00,
    imp: 13.10,
    voc: 50.20,
    isc: 13.85,
    technology: 'Full-Screen Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 21.3,
    secApproved: true
  },
  'DHN-72X16/FS-555W': {
    brand: 'DAH Solar',
    model: 'DHN-72X16/FS-555W',
    pMaxWatts: 555,
    vmp: 42.20,
    imp: 13.15,
    voc: 50.40,
    isc: 13.90,
    technology: 'Full-Screen Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 21.5,
    secApproved: true
  },
  'DHN-72X16/FS-560W': {
    brand: 'DAH Solar',
    model: 'DHN-72X16/FS-560W',
    pMaxWatts: 560,
    vmp: 42.40,
    imp: 13.21,
    voc: 50.60,
    isc: 13.95,
    technology: 'Full-Screen Mono PERC',
    tempCoeffPmax: -0.35,
    efficiency: 21.7,
    secApproved: true
  },
  'DHN-72X16/DG-585W': {
    brand: 'DAH Solar',
    model: 'DHN-72X16/DG-585W',
    pMaxWatts: 585,
    vmp: 43.10,
    imp: 13.58,
    voc: 51.80,
    isc: 14.35,
    technology: 'TOPCon Full-Screen Dual Glass',
    tempCoeffPmax: -0.30,
    efficiency: 22.6,
    secApproved: true
  },
  'DHN-72X16/DG-590W': {
    brand: 'DAH Solar',
    model: 'DHN-72X16/DG-590W',
    pMaxWatts: 590,
    vmp: 43.30,
    imp: 13.63,
    voc: 52.00,
    isc: 14.40,
    technology: 'TOPCon Full-Screen Dual Glass',
    tempCoeffPmax: -0.30,
    efficiency: 22.8,
    secApproved: true
  },
  'PF620M-SN': {
    brand: 'Anhui Solar',
    model: 'PF620M-SN',
    pMaxWatts: 620,
    vmp: 41.50,
    imp: 14.94,
    voc: 49.60,
    isc: 15.82,
    technology: 'N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 22.2,
    secApproved: true
  },
  'PF625BC-SN': {
    brand: 'Anhui Solar',
    model: 'PF625BC-SN',
    pMaxWatts: 625,
    vmp: 41.70,
    imp: 14.99,
    voc: 49.80,
    isc: 15.88,
    technology: 'N-Type TOPCon',
    tempCoeffPmax: -0.30,
    efficiency: 22.4,
    secApproved: true
  },
  'PF620MDG-UL (620W Bifacial Dual Glass)': {
    brand: 'Ulica Solar',
    model: 'PF620MDG-UL (620W Bifacial Dual Glass)',
    pMaxWatts: 620,
    vmp: 41.40,
    imp: 14.98,
    voc: 49.50,
    isc: 15.88,
    technology: 'TOPCon Bifacial Dual Glass',
    tempCoeffPmax: -0.30,
    efficiency: 22.2,
    secApproved: true
  },
  'Ultra V STP550S-C72/Vmh 550W': {
    brand: 'Suntech Solar',
    model: 'Ultra V STP550S-C72/Vmh 550W',
    pMaxWatts: 550,
    vmp: 41.98,
    imp: 13.11,
    voc: 49.92,
    isc: 13.95,
    technology: 'Mono PERC 144-cell',
    tempCoeffPmax: -0.35,
    efficiency: 21.3,
    secApproved: true
  },
  'Ultra V Pro STP585S-C72/Nsh+ 585W': {
    brand: 'Suntech Solar',
    model: 'Ultra V Pro STP585S-C72/Nsh+ 585W',
    pMaxWatts: 585,
    vmp: 42.92,
    imp: 13.63,
    voc: 51.52,
    isc: 14.42,
    technology: 'TOPCon N-Type',
    tempCoeffPmax: -0.30,
    efficiency: 22.6,
    secApproved: true
  },
  'HiE-S400VG (400W Shingled)': {
    brand: 'Hyundai Solar',
    model: 'HiE-S400VG (400W Shingled)',
    pMaxWatts: 400,
    vmp: 38.60,
    imp: 10.36,
    voc: 46.40,
    isc: 10.97,
    technology: 'Shingled Monocrystalline',
    tempCoeffPmax: -0.34,
    efficiency: 20.4,
    secApproved: true
  },
  'HiE-S550VI (550W)': {
    brand: 'Hyundai Solar',
    model: 'HiE-S550VI (550W)',
    pMaxWatts: 550,
    vmp: 41.90,
    imp: 13.13,
    voc: 50.00,
    isc: 13.98,
    technology: 'Mono PERC M10',
    tempCoeffPmax: -0.34,
    efficiency: 21.3,
    secApproved: true
  }
};

const CUSTOM_CATALOG_STORAGE_KEY = 'te4_custom_pv_catalog_v2';

/**
 * Obtiene el catálogo de paneles personalizados almacenados en localStorage
 */
export function getCustomPvCatalog(): Record<string, PvModuleElectricalSpecs> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUSTOM_CATALOG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error al cargar catálogo de paneles personalizados:', e);
  }
  return {};
}

/**
 * Guarda el catálogo de paneles personalizados en localStorage
 */
export function saveCustomPvCatalog(catalog: Record<string, PvModuleElectricalSpecs>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_CATALOG_STORAGE_KEY, JSON.stringify(catalog));
    // Disparar evento para que otras partes de la app reaccionen
    window.dispatchEvent(new Event('pv_catalog_updated'));
  } catch (e) {
    console.error('Error al guardar catálogo de paneles personalizados:', e);
  }
}

/**
 * Agrega o actualiza un módulo fotovoltaico en el catálogo personalizado
 */
export function saveOrUpdatePvModule(module: PvModuleElectricalSpecs): void {
  const catalog = getCustomPvCatalog();
  const key = `${module.brand} - ${module.model}`.trim();
  catalog[key] = {
    ...module,
    id: module.id || `mod-${Date.now()}`,
    isCustom: true,
  };
  saveCustomPvCatalog(catalog);
}

/**
 * Elimina un módulo del catálogo personalizado
 */
export function deleteCustomPvModule(brand: string, model: string): void {
  const catalog = getCustomPvCatalog();
  const key = `${brand} - ${model}`.trim();
  if (catalog[key]) {
    delete catalog[key];
  }
  if (catalog[model]) {
    delete catalog[model];
  }
  saveCustomPvCatalog(catalog);
}

/**
 * Obtiene la lista completa de todos los módulos disponibles (conocidos + personalizados)
 */
export function getAllPvModulesList(): PvModuleElectricalSpecs[] {
  const custom = getCustomPvCatalog();
  const combinedMap = new Map<string, PvModuleElectricalSpecs>();

  // 1. Agregar módulos conocidos de fábrica
  Object.values(KNOWN_PV_MODULES_CATALOG).forEach(spec => {
    const key = `${spec.brand} - ${spec.model}`.toLowerCase();
    combinedMap.set(key, spec);
  });

  // 2. Agregar o sobreescribir con personalizados del usuario
  Object.values(custom).forEach(spec => {
    const key = `${spec.brand} - ${spec.model}`.toLowerCase();
    combinedMap.set(key, { ...spec, isCustom: true });
  });

  return Array.from(combinedMap.values());
}

/**
 * Obtiene la lista de marcas de módulos únicas disponibles
 */
export function getAllPvBrandsList(): string[] {
  const list = getAllPvModulesList();
  const brandsSet = new Set<string>();

  // Marcas recomendadas por defecto
  const defaultBrands = [
    'Jinko Solar',
    'Canadian Solar',
    'LONGi Solar',
    'Trina Solar',
    'JA Solar',
    'Risen Energy',
    'Astronergy (Chint)',
    'DAH Solar',
    'Anhui Solar',
    'Ulica Solar',
    'Suntech Solar',
    'Hyundai Solar',
  ];
  defaultBrands.forEach(b => brandsSet.add(b));
  list.forEach(m => {
    if (m.brand) brandsSet.add(m.brand);
  });
  brandsSet.add('Otra Marca (Certificada SEC)');

  return Array.from(brandsSet);
}

/**
 * Obtiene los modelos de una marca específica
 */
export function getPvModelsForBrand(brand: string): string[] {
  const list = getAllPvModulesList();
  const models = list
    .filter(m => m.brand.toLowerCase() === brand.toLowerCase())
    .map(m => m.model);

  if (models.length === 0) {
    // Si es una marca sin modelos predefinidos, proveer opciones estándar
    return [
      'Monocristalino PERC 410W',
      'Monocristalino PERC 550W',
      'TOPCon N-Type 585W',
      'TOPCon Bifacial 620W',
      'Otro Modelo Panel'
    ];
  }

  return Array.from(new Set(models));
}

/**
 * Obtiene la ficha técnica eléctrica de un módulo fotovoltaico.
 * Busca con prioridad en el catálogo personalizado del usuario, luego en el catálogo SEC predefinido,
 * y en última instancia realiza un cálculo de curva IV según la potencia.
 */
export function getPvModuleSpecs(brand?: string, model?: string, customWatts?: number): PvModuleElectricalSpecs {
  const defaultBrand = brand || 'Jinko Solar';
  const defaultModel = model || 'JKM550M-72HL4 550W Mono PERC Half-Cell';

  // Limpiar modelo si contiene el prefijo "Marca - Modelo"
  let cleanModel = (model || '').trim();
  if (cleanModel.includes(' - ')) {
    const parts = cleanModel.split(' - ');
    cleanModel = parts.slice(1).join(' - ').trim();
  }

  const customCatalog = getCustomPvCatalog();
  const combinedCatalog: Record<string, PvModuleElectricalSpecs> = {
    ...KNOWN_PV_MODULES_CATALOG,
    ...customCatalog,
  };

  // 1. Coincidencia exacta de clave de modelo
  if (model && combinedCatalog[model]) {
    return combinedCatalog[model];
  }
  if (cleanModel && combinedCatalog[cleanModel]) {
    return combinedCatalog[cleanModel];
  }

  // 2. Coincidencia de "Marca - Modelo"
  const fullCombo = `${defaultBrand} - ${cleanModel || defaultModel}`.trim();
  if (combinedCatalog[fullCombo]) {
    return combinedCatalog[fullCombo];
  }

  // 3. Búsqueda por subtexto o coincidencia parcial
  const searchTargets = [cleanModel, model, defaultModel].filter(Boolean) as string[];
  for (const target of searchTargets) {
    const lowerTarget = target.toLowerCase().trim();
    if (!lowerTarget || lowerTarget === 'otro modelo panel' || lowerTarget.includes('otro modelo')) continue;

    for (const [key, specs] of Object.entries(combinedCatalog)) {
      const lowerKey = key.toLowerCase();
      const lowerSpecModel = specs.model.toLowerCase();
      if (
        lowerKey === lowerTarget ||
        lowerSpecModel === lowerTarget ||
        (lowerTarget.length > 5 && lowerKey.includes(lowerTarget)) ||
        (lowerTarget.length > 5 && lowerTarget.includes(lowerSpecModel))
      ) {
        return specs;
      }
    }
  }

  // 4. Búsqueda por marca y coincidencia de potencia (ej: "Jinko Solar" + "585W")
  let watts = customWatts || 0;
  if (!watts && (model || cleanModel)) {
    const targetStr = cleanModel || model || '';
    const wMatch = targetStr.match(/(\d{3,4})\s*W/i);
    if (wMatch && wMatch[1]) {
      watts = parseInt(wMatch[1], 10);
    } else {
      const numMatch = targetStr.match(/\b(3\d\d|4\d\d|5\d\d|6\d\d|7\d\d)\b/);
      if (numMatch) {
        watts = parseInt(numMatch[1], 10);
      }
    }
  }

  if (watts > 0 && brand) {
    const matchSameBrandAndPower = Object.values(combinedCatalog).find(
      s => s.brand.toLowerCase() === brand.toLowerCase() && s.pMaxWatts === watts
    );
    if (matchSameBrandAndPower) {
      return matchSameBrandAndPower;
    }
  }

  if (!watts) {
    watts = 550;
  }

  // 5. Fallback físico inteligente de curvas IV de tecnologías solares modernas
  let estimatedVmp = 41.9;
  let estimatedImp = 13.12;
  let tech = 'Monocristalino PERC Certificado SEC';

  if (watts <= 430) {
    // Formato residencial 54 celdas (108 medias celdas)
    estimatedVmp = 31.8;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
    tech = 'Mono PERC 54 celdas';
  } else if (watts <= 570) {
    // Estándar 72 celdas PERC (144 medias celdas M10)
    estimatedVmp = 41.9;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
    tech = 'Mono PERC 72 celdas';
  } else if (watts <= 610) {
    // 72 celdas N-Type TOPCon
    estimatedVmp = 43.0;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
    tech = 'N-Type TOPCon';
  } else if (watts <= 645) {
    // 78 celdas N-Type TOPCon o 66 celdas
    estimatedVmp = 46.5;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
    tech = 'N-Type TOPCon 78HL4';
  } else {
    // Gran formato 210mm 132 celdas / 130 celdas
    estimatedVmp = 38.5;
    estimatedImp = Math.round((watts / estimatedVmp) * 100) / 100;
    tech = 'Bifacial Alta Potencia 210mm';
  }

  const estimatedVoc = Math.round(estimatedVmp * 1.19 * 100) / 100;
  const estimatedIsc = Math.round(estimatedImp * 1.06 * 100) / 100;

  return {
    brand: defaultBrand,
    model: cleanModel || defaultModel,
    pMaxWatts: watts,
    vmp: estimatedVmp,
    imp: estimatedImp,
    voc: estimatedVoc,
    isc: estimatedIsc,
    technology: tech,
    tempCoeffPmax: -0.35,
    efficiency: Math.round((watts / 25.8) * 10) / 10,
    secApproved: true
  };
}
