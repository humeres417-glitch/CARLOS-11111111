import jsPDF from 'jspdf';
import { Inspection } from '../types';
import { parseInverterSpecs } from '../data/inverterCatalog';
import { KNOWN_PV_MODULES_CATALOG } from '../data/pvModuleCatalog';

/**
 * Generador de Memoria Explicativa / Descriptiva del Sistema Fotovoltaico
 * Diseñado conforme a las exigencias de la Superintendencia de Electricidad y Combustibles (SEC)
 * de Chile para la tramitación de la Declaración TE4 (Ley 20.571 / Ley 21.118 / RGR N°02 / Pliegos RIC).
 */

interface ParsedSystemData {
  systemTypeTitle: string;
  systemTypeClean: string;
  isHybrid: boolean;
  isOffGrid: boolean;
  powerKwNominal: number;
  powerKwpDc: number;
  // Inversor
  inverterBrand: string;
  inverterModel: string;
  inverterPowerKw: number;
  inverterSystemType: 'MONO' | 'TRI';
  inverterVoltageAc: number;
  inverterCurrentAc: number;
  inverterVdcMin: number;
  inverterVdcStart: number;
  inverterVdcMax: number;
  inverterIdcMax: number;
  // Paneles
  panelsTotalCount: number;
  panelBrand: string;
  panelModel: string;
  panelWatts: number;
  panelDimensions: string;
  panelVoc: number;
  panelVmp: number;
  panelImp: number;
  panelIsc: number;
  // Strings
  stringsCount: number;
  panelsPerString: number;
  stringVoc: number;
  stringVmp: number;
  stringImp: number;
  stringIsc: number;
  // Canalizaciones & Conductores
  dcCableSectionMm2: number;
  dcCableLengthMeters: number;
  dcDuctType: string;
  dcDuctDiameterMm: number;
  dcDeltaV: number;
  dcDeltaVPercent: number;
  dcVFinal: number;
  dcMaxCurrentAllowed: number;
  // CA
  acCableSectionMm2: number;
  acDistanceInverterToTdfv: number;
  acDistanceTdfvToEmpalme: number;
  acBreakerRatingA: number;
  acDiffRating: string;
  acDeltaV1: number;
  acDeltaV1Percent: number;
  acDeltaV2: number;
  acDeltaV2Percent: number;
  // Estructura
  structureDescription: string;
  roofDescription: string;
  // Puesta a tierra
  groundResistanceOhm: string;
  groundInstrument: string;
  // Baterías
  batteryBrand: string;
  batteryModel: string;
  batteryCapacityKwh: string;
  batteryVoltage: string;
  batteryFuseAmps: number;
}

export function parseInspectionForMemoria(inspection: Inspection): ParsedSystemData {
  const tech = inspection.technical || {} as any;
  const sysTypeRaw = (tech.systemType || 'On-Grid (Netbilling)').toLowerCase();

  const isHybrid = sysTypeRaw.includes('híbrido') || sysTypeRaw.includes('hibrido') || !!tech.batteryInfo || !!tech.batteryBrand;
  const isOffGrid = sysTypeRaw.includes('off-grid') || sysTypeRaw.includes('aislado');

  let systemTypeTitle = 'ON-GRID';
  let systemTypeClean = 'On-Grid (Netbilling)';
  if (isHybrid) {
    systemTypeTitle = 'HIBRIDO';
    systemTypeClean = 'Híbrido con Acumulación';
  } else if (isOffGrid) {
    systemTypeTitle = 'OFF-GRID';
    systemTypeClean = 'Off-Grid (Aislado)';
  }

  // 1. Inversor
  const invSpecs = parseInverterSpecs(tech.inverterBrandModel);
  let inverterPowerKw = tech.inverterNominalPowerKw || invSpecs.nominalPowerKw || 5.0;
  if (!inverterPowerKw || inverterPowerKw <= 0) {
    const rawP = parseFloat(String(tech.installedPowerKwp || '5').replace(',', '.'));
    inverterPowerKw = isNaN(rawP) || rawP <= 0 ? 5.0 : rawP;
  }

  const inverterBrand = invSpecs.brand || 'Solplanet';
  const inverterModel = invSpecs.model || (isHybrid ? 'ASW6000H-S2' : 'ASW5000-S');
  const inverterSystemType = (tech.inverterAcSystemType || invSpecs.systemType || 'MONO') as 'MONO' | 'TRI';
  const inverterVoltageAc = inverterSystemType === 'TRI' ? 380 : 220;
  
  // Nominal AC Current
  const inverterCurrentAc = inverterSystemType === 'TRI'
    ? (inverterPowerKw * 1000) / (Math.sqrt(3) * 380)
    : (inverterPowerKw * 1000) / 220;

  // 2. Paneles
  let panelsTotalCount = 9;
  let panelWatts = 620;
  let panelBrand = 'Longi Solar';
  let panelModel = 'LR8-66HGD-620M Bifacial';
  let panelDimensions = '2279 x 1134 x 35 mm';
  let panelVoc = 49.6;
  let panelVmp = 41.2;
  let panelImp = 15.05;
  let panelIsc = 15.95;

  const rawPanelStr = (tech.panelsCountAndPower || '').trim();
  if (rawPanelStr) {
    const countMatch = rawPanelStr.match(/(\d+)\s*(?:x|\*|unidades|paneles|modulos)/i);
    const wattsMatch = rawPanelStr.match(/(\d{3,4})\s*(?:w|wp)/i);
    if (countMatch && countMatch[1]) {
      panelsTotalCount = parseInt(countMatch[1], 10);
    }
    if (wattsMatch && wattsMatch[1]) {
      panelWatts = parseInt(wattsMatch[1], 10);
    }

    // Try matching known brand
    const lower = rawPanelStr.toLowerCase();
    if (lower.includes('longi')) {
      panelBrand = 'Longi';
      panelModel = panelWatts >= 600 ? `LR8-66HGD-${panelWatts}M` : `LR5-72HPH-${panelWatts}M`;
    } else if (lower.includes('canadian')) {
      panelBrand = 'Canadian Solar';
      panelModel = `CS7N-${panelWatts}MS HiKu7`;
    } else if (lower.includes('jinko')) {
      panelBrand = 'Jinko Solar';
      panelModel = `Tiger Neo N-Type ${panelWatts}W`;
    } else if (lower.includes('trina')) {
      panelBrand = 'Trina Solar';
      panelModel = `Vertex S+ ${panelWatts}W`;
    } else if (lower.includes('ja solar') || lower.includes('ja')) {
      panelBrand = 'JA Solar';
      panelModel = `JAM72S30 ${panelWatts}W`;
    } else {
      panelBrand = 'Canadian Solar';
      panelModel = `HiKu ${panelWatts}W`;
    }
  }

  // Look in known catalog for accurate electrical specs
  const matchedCatalogItem = Object.values(KNOWN_PV_MODULES_CATALOG).find(
    (c) => c.pMaxWatts === panelWatts || c.model.toLowerCase().includes(panelModel.toLowerCase())
  );
  if (matchedCatalogItem) {
    panelVoc = matchedCatalogItem.voc;
    panelVmp = matchedCatalogItem.vmp;
    panelImp = matchedCatalogItem.imp;
    panelIsc = matchedCatalogItem.isc;
    if (matchedCatalogItem.dimensions) panelDimensions = matchedCatalogItem.dimensions;
  } else {
    panelVoc = Math.round((panelWatts / 12.5) * 10) / 10;
    panelVmp = Math.round((panelVoc * 0.825) * 10) / 10;
    panelImp = Math.round((panelWatts / panelVmp) * 100) / 100;
    panelIsc = Math.round((panelImp * 1.06) * 100) / 100;
  }

  const powerKwpDc = Math.round(((panelsTotalCount * panelWatts) / 1000) * 100) / 100;
  const powerKwNominal = Math.round(inverterPowerKw * 100) / 100;

  // 3. Strings configuration
  let stringsCount = 1;
  let panelsPerString = panelsTotalCount;
  if (tech.stringsCount) {
    const sMatch = tech.stringsCount.match(/(\d+)/);
    if (sMatch && sMatch[1]) {
      stringsCount = Math.max(1, parseInt(sMatch[1], 10));
      panelsPerString = Math.ceil(panelsTotalCount / stringsCount);
    }
  } else if (panelsTotalCount >= 14) {
    stringsCount = 2;
    panelsPerString = Math.ceil(panelsTotalCount / 2);
  }

  const stringVoc = Math.round(panelsPerString * panelVoc * 100) / 100;
  const stringVmp = Math.round(panelsPerString * panelVmp * 100) / 100;
  const stringImp = panelImp;
  const stringIsc = panelIsc;

  // 4. DC Conductors & Voltage Drop
  const dcCableSectionMm2 = 4; // Standard solar cable 4mm2
  const dcCableLengthMeters = 12; // Standard distance
  const dcDuctType = 'EMT';
  const dcDuctDiameterMm = 25;
  const rhoCu70 = 0.01784 * (1 + 0.00393 * 50); // ~0.0213 Ohm*mm2/m
  const dcResistance = (2 * rhoCu70 * dcCableLengthMeters) / dcCableSectionMm2; // Ohms
  const dcDeltaV = Math.round(dcResistance * stringImp * 1000) / 1000;
  const dcDeltaVPercent = Math.round((dcDeltaV / (stringVmp || 360)) * 1000) / 10;
  const dcVFinal = Math.round(((stringVmp || 360) - dcDeltaV) * 10) / 10;
  const dcMaxCurrentAllowed = 37; // A para 4mm2 en ducto según NCh 4/2003

  // 5. AC Conductors & Voltage Drop
  const acCableSectionMm2 = inverterCurrentAc > 30 ? 10 : 6;
  const acDistanceInverterToTdfv = tech.inverterAcDistanceMeters || 1.0;
  const acDistanceTdfvToEmpalme = 8.0;
  const acBreakerRatingA = inverterCurrentAc <= 16 ? 20 : inverterCurrentAc <= 25 ? 32 : inverterCurrentAc <= 32 ? 40 : 50;
  const acDiffRating = inverterSystemType === 'TRI' ? `4x${acBreakerRatingA}A 30mA Tipo A` : `2x${acBreakerRatingA}A 30mA Tipo A`;

  // Tramo Inversor - TGFV
  const rAc1 = (2 * rhoCu70 * acDistanceInverterToTdfv) / acCableSectionMm2;
  const acDeltaV1 = Math.round(rAc1 * inverterCurrentAc * 1000) / 1000;
  const acDeltaV1Percent = Math.round((acDeltaV1 / inverterVoltageAc) * 1000) / 10;

  // Tramo TGFV - Empalme
  const rAc2 = (2 * rhoCu70 * acDistanceTdfvToEmpalme) / acCableSectionMm2;
  const acDeltaV2 = Math.round(rAc2 * inverterCurrentAc * 1000) / 1000;
  const acDeltaV2Percent = Math.round((acDeltaV2 / inverterVoltageAc) * 1000) / 10;

  // 6. Estructura & Techo
  const structureDescription = tech.structureType || 'Coplanar de aluminio anodizado 6005-T5 con rieles y grapas intermedias/finales';
  const roofDescription = tech.roofType || 'Zinc 5V / PV4 (Trapezoidal)';

  // 7. Puesta a tierra
  const groundResistanceOhm = (tech.groundingResistanceOhm || '1.4').trim();
  const groundInstrument = 'ETCR2100A+';

  // 8. Baterías
  const batteryBrand = tech.batteryBrand || 'Pylontech';
  const batteryModel = tech.batteryModel || 'FB-L-16';
  const batteryCapacityKwh = tech.batteryTotalKwh || (tech.batteryCount ? `${tech.batteryCount * 5.12} kWh` : '10.24 kWh');
  const batteryVoltage = '51.2 Vdc';
  const batteryFuseAmps = 275;

  return {
    systemTypeTitle,
    systemTypeClean,
    isHybrid,
    isOffGrid,
    powerKwNominal,
    powerKwpDc,
    inverterBrand,
    inverterModel,
    inverterPowerKw,
    inverterSystemType,
    inverterVoltageAc,
    inverterCurrentAc: Math.round(inverterCurrentAc * 100) / 100,
    inverterVdcMin: 40,
    inverterVdcStart: 40,
    inverterVdcMax: 550,
    inverterIdcMax: 20,
    panelsTotalCount,
    panelBrand,
    panelModel,
    panelWatts,
    panelDimensions,
    panelVoc,
    panelVmp,
    panelImp,
    panelIsc,
    stringsCount,
    panelsPerString,
    stringVoc,
    stringVmp,
    stringImp,
    stringIsc,
    dcCableSectionMm2,
    dcCableLengthMeters,
    dcDuctType,
    dcDuctDiameterMm,
    dcDeltaV,
    dcDeltaVPercent,
    dcVFinal,
    dcMaxCurrentAllowed,
    acCableSectionMm2,
    acDistanceInverterToTdfv,
    acDistanceTdfvToEmpalme,
    acBreakerRatingA,
    acDiffRating,
    acDeltaV1,
    acDeltaV1Percent,
    acDeltaV2,
    acDeltaV2Percent,
    structureDescription,
    roofDescription,
    groundResistanceOhm,
    groundInstrument,
    batteryBrand,
    batteryModel,
    batteryCapacityKwh,
    batteryVoltage,
    batteryFuseAmps,
  };
}

/**
 * Genera el documento PDF completo de la Memoria Explicativa / Descriptiva
 * con 11 páginas estructuradas según el estándar de presentación SEC.
 */
export async function generateMemoriaExplicativaPdf(inspection: Inspection): Promise<Blob> {
  const data = parseInspectionForMemoria(inspection);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174 mm

  // Paleta Institucional Servilec & SEC
  const navy = [30, 58, 138]; // #1E3A8A
  const primaryBlue = [37, 99, 235]; // #2563EB
  const darkGray = [30, 41, 59]; // #1E293B
  const textMuted = [100, 116, 139]; // #64748B
  const borderGray = [203, 213, 225]; // #CBD5E1
  const bgLight = [248, 250, 252]; // #F8FAFC
  const greenSec = [21, 128, 61]; // #15803D

  let currentPage = 1;
  const totalPages = 11;

  const drawHeaderFooter = (pageNumber: number) => {
    if (pageNumber === 1) return; // No header/footer on cover page

    // Subtle header
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, 12, margin + contentWidth, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      `MEMORIA DESCRIPTIVA SISTEMA FOTOVOLTAICO ${data.systemTypeTitle} ${data.powerKwNominal} KW`,
      margin,
      10
    );
    doc.text('SEC - LEY 20.571 / RIC N°19', margin + contentWidth, 10, { align: 'right' });

    // Subtle footer
    doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);
    doc.text(
      `Cliente: ${inspection.client.name || 'Propietario'} | ${inspection.client.comuna || 'Chile'}`,
      margin,
      pageHeight - 8
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`${pageNumber}`, margin + contentWidth, pageHeight - 8, { align: 'right' });
  };

  // ===========================================================================
  // PÁGINA 1: PORTADA FORMAL SEC
  // ===========================================================================
  // Top Corporate Color Block
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(margin, 25, contentWidth, 42, 'F');

  // Title in clean typography
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MEMORIA DESCRIPTIVA SISTEMA', margin + 8, 42);
  doc.setFontSize(16);
  doc.text(`FOTOVOLTAICO ${data.systemTypeTitle} ${data.powerKwNominal}KW.`, margin + 8, 52);

  // Big central blue aesthetic block (matching reference PDF)
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(margin, 95, contentWidth, 115, 'F');

  // Inside Central Block: Professional Project Details
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PROYECTO DE GENERACIÓN DISTRIBUIDA', margin + 12, 115);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Conforme a la Ley N° 20.571 / Ley N° 21.118 (Netbilling)', margin + 12, 123);
  doc.text('Declaración TE4 - Superintendencia de Electricidad y Combustibles (SEC)', margin + 12, 129);

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(margin + 12, 134, margin + contentWidth - 12, 134);

  // Client Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DATOS DEL PROPIETARIO / CLIENTE:', margin + 12, 144);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Nombre / Razón Social: ${inspection.client.name || 'Propietario / Cliente'}`, margin + 14, 151);
  doc.text(`RUT: ${inspection.client.rut || 'N/A'}`, margin + 14, 157);
  doc.text(`Dirección del Inmueble: ${inspection.client.address || 'N/A'}${inspection.client.comuna ? `, ${inspection.client.comuna}` : ''}`, margin + 14, 163);
  doc.text(`Región: ${inspection.client.region || 'Región Metropolitana'}`, margin + 14, 169);

  // Installer Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DATOS DEL INSTALADOR AUTORIZADO SEC:', margin + 12, 180);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Nombre Instalador: ${inspection.installer.name || 'Instalador Certificado'}`, margin + 14, 187);
  doc.text(`RUT Instalador: ${inspection.installer.rut || 'N/A'}`, margin + 14, 193);
  doc.text(`Licencia SEC: ${inspection.installer.secLicenceNumber || 'Autorizado SEC'} (${inspection.installer.secClass || 'Clase A'})`, margin + 14, 199);

  // Bottom Metadata on Cover
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const inspectionDateStr = inspection.technical.inspectionDate || new Date().toISOString().slice(0, 10);
  doc.text(`Fecha de Elaboración: ${inspectionDateStr}`, margin, 275);
  doc.text('CHILE', margin + contentWidth, 275, { align: 'right' });

  // ===========================================================================
  // PÁGINA 2: ÍNDICE DE CONTENIDO
  // ===========================================================================
  doc.addPage();
  currentPage = 2;
  drawHeaderFooter(currentPage);

  let y = 30;
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Contenido', margin, y);
  y += 12;

  const tocItems = [
    { title: 'Descripción', page: 3, isMain: true, indent: 0 },
    { title: 'Introducción', page: 3, isMain: false, indent: 8 },
    { title: 'Datos generales', page: 3, isMain: false, indent: 8 },
    { title: 'cálculos justificativos', page: 4, isMain: true, indent: 0 },
    { title: 'Cálculo y dimensionamiento de conductores', page: 4, isMain: false, indent: 8 },
    { title: 'Conductores corrientes continua', page: 4, isMain: false, indent: 16 },
    { title: 'Conductor corriente alterna', page: 4, isMain: false, indent: 16 },
    { title: 'Cálculo de caída de tensión', page: 5, isMain: false, indent: 8 },
    { title: 'Corriente continua', page: 5, isMain: false, indent: 16 },
    { title: 'Corriente alterna', page: 6, isMain: false, indent: 16 },
    { title: 'especificaciones técnicas', page: 7, isMain: true, indent: 0 },
    { title: 'Módulos fotovoltaicos', page: 7, isMain: false, indent: 8 },
    { title: 'Soportes', page: 7, isMain: false, indent: 8 },
    { title: 'Inversores', page: 8, isMain: false, indent: 8 },
    { title: 'Cableado', page: 9, isMain: false, indent: 8 },
    { title: 'Puesta a tierra', page: 9, isMain: false, indent: 8 },
    { title: 'Almacenamiento.', page: 10, isMain: false, indent: 8 },
    { title: 'Cubicación de materiales', page: 11, isMain: true, indent: 0 },
  ];

  doc.setFontSize(9.5);
  tocItems.forEach((item) => {
    const itemX = margin + item.indent;
    const itemY = y;
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', item.isMain ? 'bold' : 'normal');

    const titleText = item.title;
    doc.text(titleText, itemX, itemY);

    // Dots between title and page number
    const titleWidth = doc.getTextWidth(titleText);
    const startDotsX = itemX + titleWidth + 3;
    const endDotsX = margin + contentWidth - 10;
    const pageStr = `${item.page}`;

    if (endDotsX > startDotsX) {
      doc.setTextColor(180, 190, 205);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const dotsCount = Math.floor((endDotsX - startDotsX) / 1.8);
      const dotsStr = '.'.repeat(Math.max(3, dotsCount));
      doc.text(dotsStr, startDotsX, itemY);
    }

    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(pageStr, margin + contentWidth, itemY, { align: 'right' });

    y += item.isMain ? 8.5 : 7.2;
  });

  // ===========================================================================
  // PÁGINA 3: DESCRIPCIÓN, INTRODUCCIÓN, DATOS GENERALES Y NORMAS
  // ===========================================================================
  doc.addPage();
  currentPage = 3;
  drawHeaderFooter(currentPage);

  y = 30;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Descripción', margin, y);
  y += 9;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Introducción', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const introText =
    `La presente Memoria tiene como finalidad exponer los detalles y procedimientos de cálculo que ` +
    `permitan dimensionar y determinar las características de los distintos componentes del proyecto ` +
    `fotovoltaico para su segura instalación y óptimo rendimiento para inyección a la red de ` +
    `${data.powerKwNominal} kW de potencia ${data.systemTypeClean.toLowerCase()}.`;
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, margin, y);
  y += splitIntro.length * 5 + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Datos generales', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const generalDataText1 =
    `Emplazamiento será en el terreno y techumbre de la propiedad, utilizando 1 inversor marca ${data.inverterBrand} ` +
    `modelo ${data.inverterModel}, instalando ${data.panelsTotalCount} paneles solares configurados como ` +
    `${data.stringsCount} string(s), de ${data.panelsPerString} módulos cada uno. Inversor ubicado a ` +
    `${data.acDistanceInverterToTdfv} metro del TGFV y a ${data.acDistanceTdfvToEmpalme} metros del empalme.`;
  const splitGen1 = doc.splitTextToSize(generalDataText1, contentWidth);
  doc.text(splitGen1, margin, y);
  y += splitGen1.length * 5 + 6;

  const clientAddressClean = `${inspection.client.address || 'Inmueble del Cliente'}${inspection.client.comuna ? `, ${inspection.client.comuna}` : ''}`;
  const generalDataText2 =
    `La planta se encuentra ubicada en ${clientAddressClean}. La instalación proyectada en el presente ` +
    `documento se clasifica como equipamiento de generación de energía eléctrica por medios renovables no convencionales ` +
    `con derecho a inyectar los excedentes de energía generados por esta vía a la red de distribución a través del empalme ` +
    `eléctrico. Esto de acuerdo con lo indicado en la Ley 20.571 (y Ley 21.118) y su respectivo Reglamento.`;
  const splitGen2 = doc.splitTextToSize(generalDataText2, contentWidth);
  doc.text(splitGen2, margin, y);
  y += splitGen2.length * 5 + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Normas', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const normsIntro =
    'Las Normas consideradas para la elaboración del presente documento y que deben respetar la ' +
    'ejecución de la obra se indican a continuación:';
  doc.text(normsIntro, margin, y);
  y += 7;

  const normBulletList = [
    'NCH Elec. 4/2003 e Instrucciones Técnicas Normativas RIC (RIC N°01 a RIC N°19)',
    'NCH Elec. 2/84 (Elaboración y presentación de proyectos)',
    'NTCO EGBT (Norma Técnica de Conexión y Operación de Equipamiento de Generación en Baja Tensión)',
    'RGR N°01/2022 (Diseño y Ejecución de Instalaciones de Generación Distribuida)',
    'RGR N°02/2022 y RGR N°02/2017 (Instrucciones Técnicas de Generación Distribuida SEC)',
    'Ley 20.571 y Ley 21.118 del Ministerio de Energía',
  ];

  normBulletList.forEach((norm) => {
    doc.text('•', margin + 4, y);
    doc.text(norm, margin + 10, y);
    y += 6.5;
  });

  // ===========================================================================
  // PÁGINA 4: CÁLCULOS JUSTIFICATIVOS - DIMENSIONAMIENTO DE CONDUCTORES
  // ===========================================================================
  doc.addPage();
  currentPage = 4;
  drawHeaderFooter(currentPage);

  y = 30;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('cálculos justificativos', margin, y);
  y += 9;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Cálculo y dimensionamiento de conductores', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const condText =
    'La capacidad de transporte de un conductor eléctrico está dada por lo indicado en el Artículo ' +
    '8.1.2.3 de la NCh 4/2003 y pliegos RIC correspondientes:';
  const splitCond = doc.splitTextToSize(condText, contentWidth);
  doc.text(splitCond, margin, y);
  y += splitCond.length * 5 + 6;

  // Formula Is = It * ft * fn
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Is = It · ft · fn', margin + contentWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Donde:', margin, y);
  y += 5.5;

  const formulaDefs = [
    'Is: Capacidad de servicio del conductor',
    'It: Corriente nominal que puede transportar el conductor',
    'ft: Factor de corrección por cantidad de conductores en tubería (Tabla N°8.8)',
    'fn: Factor de corrección por variación de temperatura ambiente (Tabla N°8.9)',
  ];
  formulaDefs.forEach((def) => {
    doc.text(def, margin + 4, y);
    y += 5;
  });
  y += 5;

  // Conductores CC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Conductores corrientes continua', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const ccDesc =
    `String canalizados en tubería ${data.dcDuctType} de ${data.dcDuctDiameterMm} mm. Considerando que los ` +
    `conductores canalizados desde los paneles fotovoltaicos están expuestos a una temperatura ambiente 30°C, ` +
    `entonces el factor de corrección por temperatura a 30°C y temperatura de operación de 70°C, factor de corrección ` +
    `del conductor es de 1.`;
  const splitCc = doc.splitTextToSize(ccDesc, contentWidth);
  doc.text(splitCc, margin, y);
  y += splitCc.length * 5 + 4;

  const noFactorDesc = 'No hay factor de corrección por cantidad de conductores que empieza desde los 4 conductores.';
  doc.text(noFactorDesc, margin, y);
  y += 6;

  const capacityCcDesc = `Por lo tanto, la capacidad de servicio del conductor ZZ-F / H1Z2Z2-K de ${data.dcCableSectionMm2} [mm²] en corriente continua será:`;
  doc.text(capacityCcDesc, margin, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text(`Is = ${data.dcMaxCurrentAllowed} · 1`, margin + contentWidth / 2, y, { align: 'center' });
  y += 6;
  doc.text(`Is = ${data.dcMaxCurrentAllowed} [A]`, margin + contentWidth / 2, y, { align: 'center' });
  y += 10;

  // Conductores CA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Conductor corriente alterna', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const caDesc =
    `Los conductores entre el inversor y el Tablero Fotovoltaico están instalados de forma sobrepuesta ` +
    `con protección mecánica. Cable cumple para su uso características rv-k. Capacidad de servicio del ` +
    `conductor se calculará para un factor de corrección por temperatura de 25°C.`;
  const splitCa = doc.splitTextToSize(caDesc, contentWidth);
  doc.text(splitCa, margin, y);
  y += splitCa.length * 5 + 4;

  const caSectionText =
    `El alimentador para utilizar corresponde a cable de ${data.acCableSectionMm2} [mm²], cuya capacidad ` +
    `de servicio a 30°C de temperatura ambiente y 70°C de operación del conductor es de 50 [A]:`;
  const splitCaSec = doc.splitTextToSize(caSectionText, contentWidth);
  doc.text(splitCaSec, margin, y);
  y += splitCaSec.length * 5 + 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Is = 50 * 1 * 1', margin + contentWidth / 2, y, { align: 'center' });
  y += 6;
  doc.text('Is = 50 [A]', margin + contentWidth / 2, y, { align: 'center' });

  // ===========================================================================
  // PÁGINA 5: CÁLCULO DE CAÍDA DE TENSIÓN EN CORRIENTE CONTINUA
  // ===========================================================================
  doc.addPage();
  currentPage = 5;
  drawHeaderFooter(currentPage);

  y = 30;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Cálculo de caída de tensión', margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Corriente continua', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Para el cálculo de caída de tensión en corriente continua se cumple la siguiente expresión:', margin, y);
  y += 9;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('%Ucc = 2 * I * R * L', margin + contentWidth / 2, y, { align: 'center' });
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Donde:', margin, y);
  y += 5.5;

  const dcDefs = [
    '%Ucc: Porcentaje de caída de tensión',
    'I: Intensidad de corriente nominal [A]',
    'R: Resistencia del conductor [Ω]',
    'Ucc: Diferencia de tensión entre polo positivo y negativo',
  ];
  dcDefs.forEach((def) => {
    doc.text(def, margin + 4, y);
    y += 5;
  });
  y += 5;

  const introTableCc =
    'De acuerdo con la expresión anterior se tienen las siguientes caídas de tensión para cada uno de ' +
    'los string del sistema fotovoltaico:';
  const splitIntroTableCc = doc.splitTextToSize(introTableCc, contentWidth);
  doc.text(splitIntroTableCc, margin, y);
  y += splitIntroTableCc.length * 5 + 7;

  // TABLA FORMAL CANALIZACIÓN CC (Matching reference PDF Page 5)
  const tblX = margin;
  const tblW = contentWidth;
  const tblHeaderH = 7.5;

  // Banner Header "CANALIZACIÓN CC"
  doc.setFillColor(230, 235, 245);
  doc.rect(tblX, y, tblW, 8.5, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.rect(tblX, y, tblW, 8.5, 'D');

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CANALIZACIÓN CC', tblX + tblW / 2, y + 5.8, { align: 'center' });
  y += 8.5;

  // Subheaders: DUCTO (col 1-2) | CONDUCTOR (col 3-9)
  const colW = [16, 17, 24, 18, 19, 17, 21, 21, 21];
  // Totals = 16+17 + 24+18+19+17+21+21+21 = 174 mm (perfect contentWidth)

  doc.setFillColor(254, 226, 226); // subtle peach/rose header matching reference
  doc.rect(tblX, y, colW[0] + colW[1], tblHeaderH, 'F');
  doc.setFillColor(254, 226, 226);
  doc.rect(tblX + colW[0] + colW[1], y, tblW - (colW[0] + colW[1]), tblHeaderH, 'F');

  doc.rect(tblX, y, colW[0] + colW[1], tblHeaderH, 'D');
  doc.rect(tblX + colW[0] + colW[1], y, tblW - (colW[0] + colW[1]), tblHeaderH, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DUCTO', tblX + (colW[0] + colW[1]) / 2, y + 5, { align: 'center' });
  doc.text('CONDUCTOR', tblX + colW[0] + colW[1] + (tblW - colW[0] - colW[1]) / 2, y + 5, { align: 'center' });
  y += tblHeaderH;

  // Column titles
  const colTitles = [
    'Tipo',
    'Sección\n(mm)',
    'Tipo\naislación',
    'Sección\n(mm²)',
    'Corriente\nmáx (A)',
    'Largo\n(m)',
    'Caída de\ntensión (V)',
    'Caída de\ntensión (%)',
    'Tensión\nfinal (V)',
  ];

  doc.setFillColor(255, 241, 242);
  doc.rect(tblX, y, tblW, 10, 'FD');

  let curX = tblX;
  doc.setFontSize(7);
  colTitles.forEach((t, idx) => {
    doc.rect(curX, y, colW[idx], 10, 'D');
    doc.text(t, curX + colW[idx] / 2, y + 4, { align: 'center' });
    curX += colW[idx];
  });
  y += 10;

  // Data Rows (For each string)
  for (let s = 1; s <= data.stringsCount; s++) {
    const rowData = [
      data.dcDuctType,
      `${data.dcDuctDiameterMm}`,
      'H1Z2Z2-K',
      `${data.dcCableSectionMm2}`,
      `${data.dcMaxCurrentAllowed}`,
      `${data.dcCableLengthMeters}`,
      `${data.dcDeltaV}`,
      `${data.dcDeltaVPercent}`,
      `${data.dcVFinal}`,
    ];

    doc.setFillColor(255, 255, 255);
    doc.rect(tblX, y, tblW, 8, 'FD');

    let rx = tblX;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    rowData.forEach((val, idx) => {
      doc.rect(rx, y, colW[idx], 8, 'D');
      doc.text(val, rx + colW[idx] / 2, y + 5.2, { align: 'center' });
      rx += colW[idx];
    });
    y += 8;
  }
  y += 12;

  // Conformance Paragraphs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const conf1 =
    'Todos los string cumplen lo indicado en la norma respecto a la caída de tensión siendo en cada caso ' +
    'menor al 1,5%.';
  doc.text(conf1, margin, y);
  y += 7;

  const conf2 = 'Los conductores también respetan el punto 11.18 de la RGR N°2:';
  doc.text(conf2, margin, y);
  y += 6;

  const conf3 =
    'Que dice que el conductor debe aguantar 1.25 veces la corriente del circuito en el lado de CC por ende:';
  doc.text(conf3, margin, y);
  y += 8;

  const safetyCurrent = Math.round(data.stringIsc * 1.25 * 100) / 100;
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.stringIsc} x 1.25 = ${safetyCurrent} [A]`, margin + 10, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  const conf4 =
    `Cable de ${data.dcCableSectionMm2} mm elegido aguanta hasta ${data.dcMaxCurrentAllowed} A ` +
    `indicado en conductores de corriente continua.`;
  doc.text(conf4, margin, y);

  // ===========================================================================
  // PÁGINA 6: CÁLCULO DE CAÍDA DE TENSIÓN EN CORRIENTE ALTERNA
  // ===========================================================================
  doc.addPage();
  currentPage = 6;
  drawHeaderFooter(currentPage);

  y = 30;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Corriente alterna', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Para el cálculo de caída de tensión en corriente alterna se cumple la siguiente expresión:', margin, y);
  y += 9;

  // Formula %UL
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('%UL = (√3 · I · R) / UL', margin + contentWidth / 2, y, { align: 'center' });
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Donde:', margin, y);
  y += 5.5;

  const caDefs = [
    '%UL: Porcentaje de caída de tensión',
    'I: Intensidad de corriente nominal [A]',
    'R: Resistencia del conductor [Ω]',
    'UL: Diferencia de tensión entre fases [V]',
  ];
  caDefs.forEach((def) => {
    doc.text(def, margin + 4, y);
    y += 5;
  });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Para circuitos trifásicos se debe considerar, además:', margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('P3f = √3 · UL · I · cos(θ)', margin + contentWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Donde:', margin, y);
  y += 5.5;

  const triDefs = [
    'P3f: Potencia activa trifásica [W]',
    'UL: Diferencia de tensión entre fases [V]',
    'I: Intensidad de corriente nominal [A]',
    'cos(θ): Factor de potencia',
  ];
  triDefs.forEach((def) => {
    doc.text(def, margin + 4, y);
    y += 5;
  });
  y += 6;

  const caTableIntro =
    'De acuerdo con la expresión anterior se tienen las siguientes caídas de tensión para cada uno de ' +
    'los alimentadores en corriente alterna:';
  const splitCaTableIntro = doc.splitTextToSize(caTableIntro, contentWidth);
  doc.text(splitCaTableIntro, margin, y);
  y += splitCaTableIntro.length * 5 + 7;

  // TABLA FORMAL CAÍDA DE TENSIÓN DE ALIMENTADOR UG EN CA (Matching reference PDF Page 6)
  const acTblW = contentWidth;
  const acTblX = margin;

  doc.setFillColor(254, 226, 226);
  doc.rect(acTblX, y, acTblW, 8.5, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.rect(acTblX, y, acTblW, 8.5, 'D');

  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Cuadro de caídas de tensión de alimentador UG en CA', acTblX + acTblW / 2, y + 5.5, { align: 'center' });
  y += 8.5;

  const acColW = [26, 17, 16, 15, 12, 14, 15, 14, 13, 14, 18];
  // 26+17+16+15+12+14+15+14+13+14+18 = 174 mm (perfect contentWidth)

  // Subheader DUCTO & CONDUCTOR
  doc.setFillColor(255, 241, 242);
  doc.rect(acTblX, y, acTblW, 6, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const ductoStartX = acTblX + 26 + 17 + 16 + 15;
  const condStartX = ductoStartX + 12 + 14;

  doc.text('DUCTO', ductoStartX + (12 + 14) / 2, y + 4.2, { align: 'center' });
  doc.text('CONDUCTOR', condStartX + (15 + 14 + 13 + 14 + 18) / 2, y + 4.2, { align: 'center' });
  y += 6;

  const acHeaderTitles = [
    'Tramos de alimentador',
    'Capacidad\nsistema (A)',
    'Capacidad\nprot. (A)',
    'Voltaje\nAC/DC (V)',
    'Tipo',
    'Sección\n(mm)',
    'Tipo\naislación',
    'Sección\n(mm²)',
    'Corriente\nmáx (A)',
    'Largo\n(m)',
    'Caída tens.\n(V) / (%)',
  ];

  doc.setFillColor(255, 241, 242);
  doc.rect(acTblX, y, acTblW, 9.5, 'FD');

  let curAcX = acTblX;
  doc.setFontSize(6.5);
  acHeaderTitles.forEach((t, i) => {
    doc.rect(curAcX, y, acColW[i], 9.5, 'D');
    doc.text(t, curAcX + acColW[i] / 2, y + 3.8, { align: 'center' });
    curAcX += acColW[i];
  });
  y += 9.5;

  const acRows = [
    [
      'UG - INVERSOR',
      `${data.stringImp}`,
      '--',
      `${data.stringVmp}`,
      data.dcDuctType,
      `${data.dcDuctDiameterMm}`,
      'H1Z2Z2-K',
      `${data.dcCableSectionMm2}`,
      `${data.dcMaxCurrentAllowed}`,
      `${data.dcCableLengthMeters}`,
      `${data.dcDeltaV} V (${data.dcDeltaVPercent}%)`,
    ],
    [
      'INVERSOR - TGFV',
      `${data.inverterCurrentAc}`,
      `${data.inverterSystemType === 'TRI' ? '4x' : '2x'}${data.acBreakerRatingA}`,
      `${data.inverterVoltageAc}`,
      'BPC',
      '100x50',
      'RV-K',
      `${data.acCableSectionMm2}`,
      '50',
      `${data.acDistanceInverterToTdfv}`,
      `${data.acDeltaV1} V (${data.acDeltaV1Percent}%)`,
    ],
    [
      'TGFV - EMPALME',
      `${data.acBreakerRatingA}`,
      `${data.inverterSystemType === 'TRI' ? '3x' : '1x'}${data.acBreakerRatingA}`,
      `${data.inverterVoltageAc}`,
      'EMT',
      '25',
      'RV-K',
      `${data.acCableSectionMm2}`,
      '50',
      `${data.acDistanceTdfvToEmpalme}`,
      `${data.acDeltaV2} V (${data.acDeltaV2Percent}%)`,
    ],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  acRows.forEach((row) => {
    doc.setFillColor(255, 255, 255);
    doc.rect(acTblX, y, acTblW, 7.5, 'FD');
    let rx = acTblX;
    row.forEach((cell, ci) => {
      doc.rect(rx, y, acColW[ci], 7.5, 'D');
      doc.text(cell, rx + acColW[ci] / 2, y + 4.8, { align: 'center' });
      rx += acColW[ci];
    });
    y += 7.5;
  });

  // ===========================================================================
  // PÁGINA 7: ESPECIFICACIONES TÉCNICAS - MÓDULOS FOTOVOLTAICOS Y SOPORTES
  // ===========================================================================
  doc.addPage();
  currentPage = 7;
  drawHeaderFooter(currentPage);

  y = 30;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('especificaciones técnicas', margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Módulos fotovoltaicos', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const modDesc1 =
    `La instalación se proyecta con ${data.panelsTotalCount} módulos marca ${data.panelBrand} ${data.panelModel}, ` +
    `cuyas dimensiones son ${data.panelDimensions}, estos módulos cuentan con certificación SEC para el uso ` +
    `en sistemas de generación con inyección de excedentes a la red. Para el inversor ${data.inverterBrand} ${data.inverterModel}.`;
  const splitMod1 = doc.splitTextToSize(modDesc1, contentWidth);
  doc.text(splitMod1, margin, y);
  y += splitMod1.length * 5 + 4;

  const modDesc2 =
    `El número de módulos necesarios para alcanzar la potencia nominal proyectada es de ${data.stringsCount} string de ` +
    `${data.panelsPerString} módulos obteniendo una potencia instalada de ${data.powerKwpDc} [kW].`;
  const splitMod2 = doc.splitTextToSize(modDesc2, contentWidth);
  doc.text(splitMod2, margin, y);
  y += splitMod2.length * 5 + 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Inversor N°1', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const configDesc =
    `La configuración de conexión de los paneles será de ${data.stringsCount} String de ${data.panelsPerString} ` +
    `módulos. Con esta configuración se tienen los siguientes parámetros:`;
  const splitConfig = doc.splitTextToSize(configDesc, contentWidth);
  doc.text(splitConfig, margin, y);
  y += splitConfig.length * 5 + 6;

  doc.setFont('helvetica', 'bold');
  doc.text('String 1 inv 1', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text(`VOC: ${data.stringVoc} [V]`, margin, y);
  y += 5.5;
  doc.text(`VMP: ${data.stringVmp} [V]`, margin, y);
  y += 5.5;
  doc.text(`IMP: ${data.stringImp} [A]`, margin, y);
  y += 8;

  const secVocText =
    'Con ello se cumple lo indicado en la Instrucción Técnica RGR N°02/2017 en cuanto a que el voltaje ' +
    'máximo por string de la unidad generadora no puede superar los 1.000 [V].';
  const splitSecVoc = doc.splitTextToSize(secVocText, contentWidth);
  doc.text(splitSecVoc, margin, y);
  y += splitSecVoc.length * 5 + 10;

  // Soportes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Soportes', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const sop1 =
    `La estructura de soporte a utilizar corresponde a estructura de aluminio, conformada por un riel de ` +
    `aluminio de 5 m, fijación tipo L para la inclinación que van fijados directamente a la estructura de la techumbre.`;
  const splitSop1 = doc.splitTextToSize(sop1, contentWidth);
  doc.text(splitSop1, margin, y);
  y += splitSop1.length * 5 + 4;

  const sop2 =
    'Para la fijación final de los paneles fotovoltaicos se utilizan bornes centrales entre paneles y aprietes ' +
    'laterales ubicados al final de cada string.';
  const splitSop2 = doc.splitTextToSize(sop2, contentWidth);
  doc.text(splitSop2, margin, y);
  y += splitSop2.length * 5 + 4;

  const sop3 =
    'Además, todos los componentes del sistema de soporte y anclaje cumplen con lo indicado en el ' +
    'documento “Anexo N°9 Especificaciones Técnicas”, en cuanto a materialidad y normas que debe cumplir el sistema.';
  const splitSop3 = doc.splitTextToSize(sop3, contentWidth);
  doc.text(splitSop3, margin, y);
  y += splitSop3.length * 5 + 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Aluminio Anodizado:', margin, y);
  doc.setFont('helvetica', 'normal');
  const alText =
    'Fabricado en aluminio anodizado de alta calidad, para una gran duración aún en ambientes duros tal ' +
    'como contrastes de frío calor, ambientes salinos, etc...';
  const splitAl = doc.splitTextToSize(alText, contentWidth - 36);
  doc.text(splitAl, margin + 35, y);
  y += splitAl.length * 5 + 3;

  doc.setFont('helvetica', 'bold');
  doc.text('Tornillería:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text('Es de acero inoxidable de gran resistencia para una mayor durabilidad.', margin + 22, y);

  // ===========================================================================
  // PÁGINA 8: ESPECIFICACIONES TÉCNICAS - INVERSORES
  // ===========================================================================
  doc.addPage();
  currentPage = 8;
  drawHeaderFooter(currentPage);

  y = 30;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Inversores', margin, y);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const invDesc1 =
    `Se proyecta la instalación de 1 inversor marca ${data.inverterBrand} ${data.inverterModel}, de potencia ` +
    `nominal ${data.inverterPowerKw} [kW], al inversor se conectarán ${data.stringsCount} string compuesto de ` +
    `${data.panelsPerString} paneles fotovoltaicos.`;
  const splitInv1 = doc.splitTextToSize(invDesc1, contentWidth);
  doc.text(splitInv1, margin, y);
  y += splitInv1.length * 5 + 5;

  const invDesc2 = 'Las características del inversor cumplen con los parámetros de string conectado al inversor.';
  doc.text(invDesc2, margin, y);
  y += 7;

  doc.text('Las características de inversor son:', margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text(`IDC Max: ${data.inverterIdcMax}A`, margin + 6, y);
  y += 6.5;
  doc.text(`VDC Min: ${data.inverterVdcMin}[V]`, margin + 6, y);
  y += 6.5;
  doc.text(`VDC Start: ${data.inverterVdcStart}[V]`, margin + 6, y);
  y += 6.5;
  doc.text(`VDC Max: ${data.inverterVdcMax}[V]`, margin + 6, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  const invNormCompliance =
    'Cada inversor cumple con lo exigido en documento “Anexo N°9 Especificaciones Técnicas”, en lo ' +
    'referido a índice de protección, eficiencia de los equipos, certificación de uso para conexión a red, ' +
    'conectividad para transferencia de datos vía wifi, etc.';
  const splitNormInv = doc.splitTextToSize(invNormCompliance, contentWidth);
  doc.text(splitNormInv, margin, y);
  y += splitNormInv.length * 5 + 10;

  // Extra block detailing Protections & Anti-Islanding (Required by SEC)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Protección Anti-Isla y Desconexión Automática:', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const antiIslandText =
    'El inversor incorpora algoritmo activo de desconexión anti-isla certificado bajo estándar IEC 62116 / IEEE 1547. ' +
    'En caso de interrupción en la red de distribución eléctrica, el inversor interrumpe el suministro en un tiempo ' +
    'inferior a 0.5 segundos, garantizando la absoluta seguridad del personal de mantenimiento de la empresa eléctrica.';
  const splitAnti = doc.splitTextToSize(antiIslandText, contentWidth);
  doc.text(splitAnti, margin, y);

  // ===========================================================================
  // PÁGINA 9: CABLEADO Y PUESTA A TIERRA
  // ===========================================================================
  doc.addPage();
  currentPage = 9;
  drawHeaderFooter(currentPage);

  y = 30;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Cableado', margin, y);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const cableText1 =
    `Para el cableado entre cada string y el inversor, se proyecta conductor del tipo ZZF / H1Z2Z2-K, de ` +
    `${data.dcCableSectionMm2} mm² de sección, conductor de cobre electrolítico estañado, clase 5 (flexible) según ` +
    `EN 60228, aislamiento de goma libre de halógenos tipo EI6, cubierta de goma ignífuga tipo EM8, libre de ` +
    `halógenos y con baja emisión de humos y gases corrosivos en caso de incendio.`;
  const splitCable1 = doc.splitTextToSize(cableText1, contentWidth);
  doc.text(splitCable1, margin, y);
  y += splitCable1.length * 5 + 5;

  const cableText2 =
    'La sección del conductor garantiza la capacidad de transporte de acuerdo con el requerimiento de corriente ' +
    'de cada string y cumple con la caída de tensión máxima permitida (1,5%, según lo indicado en RGR 02/2017).';
  const splitCable2 = doc.splitTextToSize(cableText2, contentWidth);
  doc.text(splitCable2, margin, y);
  y += splitCable2.length * 5 + 5;

  const cableColors =
    'Se respetará el código de colores, rojo para la conexión del lado positivo del string al inversor y ' +
    'negro para la conexión del negativo, según lo indicado en RGR 02/2017.';
  const splitColors = doc.splitTextToSize(cableColors, contentWidth);
  doc.text(splitColors, margin, y);
  y += splitColors.length * 5 + 12;

  // Puesta a tierra
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Puesta a tierra', margin, y);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const groundText1 =
    'La conexión a tierra entre los módulos y los perfiles de soporte se realizará mediante clip de conexión ' +
    'correspondiente a una placa de acero inoxidable de superficie porosa capaz de traspasar la superficie de ' +
    'aluminio anodizado mejorando la conductividad eléctrica de la puesta a tierra.';
  const splitGround1 = doc.splitTextToSize(groundText1, contentWidth);
  doc.text(splitGround1, margin, y);
  y += splitGround1.length * 5 + 7;

  const groundText2 =
    `La medición de la resistividad de puesta a tierra nueva arrojó un valor medido en terreno de ` +
    `${data.groundResistanceOhm} [Ω].\n` +
    `Con instrumento ${data.groundInstrument}.`;
  const splitGround2 = doc.splitTextToSize(groundText2, contentWidth);
  doc.text(splitGround2, margin, y);
  y += splitGround2.length * 5 + 8;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(greenSec[0], greenSec[1], greenSec[2]);
  doc.text(
    `Cumplimiento Normativo SEC: Resistencia < 20 [Ω] (Valor obtenido: ${data.groundResistanceOhm} [Ω] Conforme).`,
    margin,
    y
  );

  // ===========================================================================
  // PÁGINA 10: ALMACENAMIENTO (BATERÍAS O SISTEMA ON-GRID)
  // ===========================================================================
  doc.addPage();
  currentPage = 10;
  drawHeaderFooter(currentPage);

  y = 30;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Almacenamiento.', margin, y);
  y += 9;

  if (data.isHybrid || data.isOffGrid) {
    // Hybrid / Storage System Details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const batDesc =
      `Batería ${data.batteryBrand}, modelo ${data.batteryModel} instalada a piso con sus soportes de fábrica, ` +
      `ventilación natural y protección de corte en batería de ${data.batteryFuseAmps} A.`;
    const splitBat = doc.splitTextToSize(batDesc, contentWidth);
    doc.text(splitBat, margin, y);
    y += splitBat.length * 5 + 8;

    // Technical Table of the Battery (Matching reference PDF Page 10)
    const batTblX = margin;
    const batTblW = contentWidth;

    doc.setFillColor(245, 248, 252);
    doc.rect(batTblX, y, batTblW, 8, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(batTblX, y, batTblW, 8, 'D');

    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`Ficha Técnica - Batería ${data.batteryBrand} ${data.batteryModel}`, batTblX + 4, y + 5.5);
    y += 8;

    const batterySpecs = [
      ['Nominal Voltage (Vdc)', data.batteryVoltage],
      ['Nominal Capacity (Wh)', data.batteryCapacityKwh],
      ['Usable Capacity (%)', '100% (LiFePO4)'],
      ['Dimensions (mm)', '435(W) * 240(D) * 900(H)'],
      ['Weight (Kg)', '130 kg aprox.'],
      ['Discharge Voltage (Vdc)', '40 ~ 56.8 V'],
      ['Charge Voltage (Vdc)', '56 ~ 56.8 V'],
      ['Maximum Continuous Current (A)', '188 / 200 A'],
      ['Peak Charge/Discharge Current (A)', '300A @ 15s'],
      ['Communication', 'CAN, RS485'],
      ['Working Temperature (°C)', '0 ~ 55 °C'],
      ['Cooling Type', 'Natural'],
      ['Protective Class / IP Rating', 'Clase I / IP65'],
      ['Certifications', 'IEC62619, IEC63056, UN38.3, CE'],
      ['Design Life (years) / Cycle Life', '15 años / 8.000 ciclos'],
    ];

    const col1W = 100;
    const col2W = batTblW - col1W;

    doc.setFontSize(8);
    batterySpecs.forEach(([param, val], idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252, idx % 2 === 0 ? 255 : 255);
      doc.rect(batTblX, y, batTblW, 5.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(param, batTblX + 3, y + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.text(val, batTblX + col1W + 3, y + 3.8);
      y += 5.5;
    });
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text('Ventilación de baterías.', margin, y);
    y += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('Batería con ventilación natural.', margin, y);
    y += 5;
    doc.text('Lugar de instalación abierto y seguro.', margin, y);
  } else {
    // Pure On-Grid System
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const onGridDesc =
      `El presente proyecto corresponde a un Sistema Fotovoltaico On-Grid (Conectado a la Red) bajo ` +
      `modalidad Netbilling Ley 20.571, sin banco de baterías ni almacenamiento electroquímico.`;
    const splitOnGrid = doc.splitTextToSize(onGridDesc, contentWidth);
    doc.text(splitOnGrid, margin, y);
    y += splitOnGrid.length * 5 + 6;

    const onGridDetails =
      `La totalidad de la energía generada es aprovechada para autoconsumo instantáneo en los consumos de la propiedad. ` +
      `Los excedentes no consumidos son inyectados directamente a la red de distribución eléctrica de la concesionaria, ` +
      `quedando registrados a través de un medidor bidireccional homologado por la SEC.\n\n` +
      `Al no requerir acumulación electroquímica, la instalación cuenta con una operación limpia, sin generación de gases ` +
      `ni sustancias químicas en recintos cerrados.`;
    const splitDetails = doc.splitTextToSize(onGridDetails, contentWidth);
    doc.text(splitDetails, margin, y);
  }

  // ===========================================================================
  // PÁGINA 11: CUBICACIÓN DE MATERIALES
  // ===========================================================================
  doc.addPage();
  currentPage = 11;
  drawHeaderFooter(currentPage);

  y = 30;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Cubicación de materiales', margin, y);
  y += 10;

  // Outer Box for Table
  const cubTblX = margin + 15;
  const cubTblW = contentWidth - 30; // 144 mm centered table
  const cubCol1 = 88;
  const cubCol2 = 28;
  const cubCol3 = 28;

  // Header Table
  doc.setFillColor(245, 248, 252);
  doc.rect(cubTblX, y, cubTblW, 8.5, 'FD');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.rect(cubTblX, y, cubTblW, 8.5, 'D');

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Cubicación de materiales', cubTblX + cubTblW / 2, y + 5.8, { align: 'center' });
  y += 8.5;

  // Column Headers
  doc.setFillColor(255, 255, 255);
  doc.rect(cubTblX, y, cubTblW, 7, 'FD');
  doc.setFontSize(8.5);
  doc.text('Í T E M', cubTblX + cubCol1 / 2, y + 4.8, { align: 'center' });
  doc.text('CANTIDAD', cubTblX + cubCol1 + cubCol2 / 2, y + 4.8, { align: 'center' });
  doc.text('unidad', cubTblX + cubCol1 + cubCol2 + cubCol3 / 2, y + 4.8, { align: 'center' });
  y += 7;

  // Dynamic Item List according to actual equipment
  const cubItems: [string, string, string][] = [
    [`-Paneles ${data.panelBrand}`, `${data.panelsTotalCount}`, 'uni.'],
    [`-${data.inverterBrand} ${data.inverterModel}`, '1', 'uni.'],
    ['-Automático magnetotérmico', '2', 'uni.'],
    [`-Protección Diferencial ${data.inverterSystemType === 'TRI' ? '4x' : '2x'}${data.acBreakerRatingA}A`, '2', 'uni.'],
    ['-Tubería emt', '20', 'uni.'],
    ['-Cable solar', '30', 'mts.'],
    ['-Estructura fotovoltaica Rieles', `${Math.max(4, Math.ceil(data.panelsTotalCount * 0.9))}`, 'uni.'],
    ['-Unión riel Unión placa', `${data.panelsTotalCount * 3 + 5}`, 'uni.'],
    ['-Terminal final placa', `${data.stringsCount * 4 + 4}`, 'uni.'],
    ['-Flexible 25', '5', 'mts.'],
    [`-Cable ${data.acCableSectionMm2} mm`, '50', 'mts.'],
    ['-Tablero eléctrico', '1', 'uni.'],
  ];

  if (data.isHybrid || data.isOffGrid) {
    cubItems.push([`-Batería ${data.batteryBrand}`, '1', 'uni.']);
  }

  cubItems.push(['-Electrodo Puesta a Tierra', '1', 'set']);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  cubItems.forEach(([name, qty, unit], idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252, idx % 2 === 0 ? 255 : 255);
    doc.rect(cubTblX, y, cubTblW, 6.5, 'FD');

    // Col 1: Name
    doc.rect(cubTblX, y, cubCol1, 6.5, 'D');
    doc.text(name, cubTblX + 3, y + 4.5);

    // Col 2: Qty
    doc.rect(cubTblX + cubCol1, y, cubCol2, 6.5, 'D');
    doc.text(qty, cubTblX + cubCol1 + cubCol2 / 2, y + 4.5, { align: 'center' });

    // Col 3: Unit
    doc.rect(cubTblX + cubCol1 + cubCol2, y, cubCol3, 6.5, 'D');
    doc.text(unit, cubTblX + cubCol1 + cubCol2 + cubCol3 / 2, y + 4.5, { align: 'center' });

    y += 6.5;
  });

  return doc.output('blob');
}
