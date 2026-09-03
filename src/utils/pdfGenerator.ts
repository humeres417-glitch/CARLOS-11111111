import jsPDF from 'jspdf';
import { Inspection, PhotoItem } from '../types';
import { getApplicableCategories } from './powerHelper';
import { parseInverterSpecs } from '../data/inverterCatalog';

interface PreparedPdfImage {
  dataUrl: string;
  format: 'JPEG' | 'PNG';
  aspectRatio: number;
  width: number;
  height: number;
  isVideo: boolean;
}

/**
 * Pre-processes and normalizes image for jsPDF to prevent crashes,
 * preserve original aspect ratio, and handle any EXIF or format anomalies.
 */
async function prepareImageForPdf(url: string, id?: string, name?: string): Promise<PreparedPdfImage | null> {
  if (!url) return null;

  const isVideo = (id && id.startsWith('vid-')) || url.startsWith('data:video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(name || '');
  if (isVideo) {
    return {
      dataUrl: '',
      format: 'JPEG',
      aspectRatio: 16 / 9,
      width: 640,
      height: 360,
      isVideo: true,
    };
  }

  // Determine format from data URL or extension
  let imageFormat: 'JPEG' | 'PNG' = 'JPEG';
  if (url.startsWith('data:image/png') || /\.(png)$/i.test(name || '')) {
    imageFormat = 'PNG';
  }

  return new Promise((resolve) => {
    const img = new Image();
    
    // Only set crossOrigin for remote HTTP(S) resources to avoid canvas taint errors with data/blob URIs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    const timeout = setTimeout(() => {
      // If image is already a data URL, try using it directly even on timeout
      if (url.startsWith('data:image/')) {
        resolve({
          dataUrl: url,
          format: imageFormat,
          aspectRatio: 4 / 3,
          width: 800,
          height: 600,
          isVideo: false,
        });
      } else {
        resolve(null);
      }
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const naturalW = img.naturalWidth || img.width || 800;
        const naturalH = img.naturalHeight || img.height || 600;
        const aspectRatio = naturalW / naturalH;

        const maxDim = 1600;
        let targetW = naturalW;
        let targetH = naturalH;
        if (targetW > maxDim || targetH > maxDim) {
          if (targetW > targetH) {
            targetH = Math.round((targetH * maxDim) / targetW);
            targetW = maxDim;
          } else {
            targetW = Math.round((targetW * maxDim) / targetH);
            targetH = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const normalizedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
          resolve({
            dataUrl: normalizedDataUrl,
            format: 'JPEG',
            aspectRatio: targetW / targetH,
            width: targetW,
            height: targetH,
            isVideo: false,
          });
        } else {
          resolve({
            dataUrl: url,
            format: imageFormat,
            aspectRatio,
            width: naturalW,
            height: naturalH,
            isVideo: false,
          });
        }
      } catch (e) {
        console.warn('Canvas normalization fallback:', e);
        resolve({
          dataUrl: url,
          format: imageFormat,
          aspectRatio: (img.naturalWidth || 800) / (img.naturalHeight || 600),
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
          isVideo: false,
        });
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      console.warn('Failed to load image for PDF:', url ? url.substring(0, 80) : 'empty');
      // If it's a data URL, we can still attempt to pass it to jsPDF
      if (url && url.startsWith('data:image/')) {
        resolve({
          dataUrl: url,
          format: imageFormat,
          aspectRatio: 4 / 3,
          width: 800,
          height: 600,
          isVideo: false,
        });
      } else {
        resolve(null);
      }
    };

    img.src = url;
  });
}

/**
 * Generates an official Chilean SEC TE4 Solar Inspection PDF Report
 */
export async function generateTE4PdfReport(inspection: Inspection): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const primaryNavy = [15, 32, 67]; // #0F2043 Navy SEC Chile
  const secRed = [200, 30, 30]; // Chile SEC Red
  const textDark = [33, 37, 41];
  const bgLight = [245, 247, 250];
  const borderGray = [210, 215, 222];
  const greenPass = [34, 139, 34];
  const redFail = [220, 53, 69];

  // Helper functions
  const checkAddPage = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    // Top banner line
    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Page footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const footerText = `Informe de Inspección Técnica TE4 SEC - Instalaciones Fotovoltaicas Ley 20.571 / 21.118`;
    doc.text(footerText, margin, pageHeight - 8);
    const pageNum = doc.getNumberOfPages();
    doc.text(`Página ${pageNum}`, pageWidth - margin - 15, pageHeight - 8);
  };

  // -------------------------------------------------------------
  // HEADER
  // -------------------------------------------------------------
  drawHeaderFooter();

  // SEC Title Header Box
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INFORME DE INSPECCIÓN TÉCNICA - DECLARACIÓN TE4', margin + 5, y + 7, { maxWidth: 132 });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(76, 175, 80);
  doc.text('SERVILEC ENERGÍA', margin + 5, y + 12.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(210, 220, 230);
  doc.text('Normativa SEC Chile - Instalaciones Fotovoltaicas / Ley 20.571 y 21.118', margin + 5, y + 17);

  // Red SEC Badge
  const badgeWidth = 32;
  const badgeX = margin + contentWidth - badgeWidth - 3;
  doc.setFillColor(secRed[0], secRed[1], secRed[2]);
  doc.roundedRect(badgeX, y + 2.5, badgeWidth, 17, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CHILE SEC', badgeX + badgeWidth / 2, y + 9, { align: 'center' });
  doc.setFontSize(7);
  doc.text('Acreditado', badgeX + badgeWidth / 2, y + 14, { align: 'center' });

  y += 26;

  // -------------------------------------------------------------
  // SECTION 1: DATOS DEL INSTALADOR
  // -------------------------------------------------------------
  const sec1Col1X = margin + 4;
  const sec1Col2X = margin + 96;

  const installerName = inspection.installer.name || 'N/A';
  const installerRut = inspection.installer.rut || 'N/A';

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const instNameLines = doc.splitTextToSize(installerName, 55).length;
  const instRutLines = doc.splitTextToSize(installerRut, 55).length;
  const instMaxLines = Math.max(1, instNameLines, instRutLines);
  const instContentH = (instMaxLines * 3.8) + 2;
  const sec1HeaderHeight = 8;
  const sec1BoxHeight = sec1HeaderHeight + instContentH + 2;

  checkAddPage(sec1BoxHeight + 4);

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, sec1BoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('1. DATOS DEL INSTALADOR', margin + 4, y + 5.5);

  const instRowY = y + sec1HeaderHeight + 2;

  // Col 1: Nombre Instalador
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Nombre Instalador:', sec1Col1X, instRowY);

  const instLbl1Width = doc.getTextWidth('Nombre Instalador:') + 2.5;
  doc.setFont('helvetica', 'normal');
  const splitInst1 = doc.splitTextToSize(installerName, 55);
  doc.text(splitInst1, sec1Col1X + instLbl1Width, instRowY);

  // Col 2: RUT Instalador
  doc.setFont('helvetica', 'bold');
  doc.text('RUT Instalador:', sec1Col2X, instRowY);

  const instLbl2Width = doc.getTextWidth('RUT Instalador:') + 2.5;
  doc.setFont('helvetica', 'normal');
  const splitInst2 = doc.splitTextToSize(installerRut, 55);
  doc.text(splitInst2, sec1Col2X + instLbl2Width, instRowY);

  y += sec1BoxHeight + 4;

  // -------------------------------------------------------------
  // SECTION 2: DATOS DEL CLIENTE
  // -------------------------------------------------------------
  const sec2Col1X = margin + 4;
  const sec2Col2X = margin + 96;

  const clientName = inspection.client.name || 'N/A';
  const clientAddress = `${inspection.client.address || 'N/A'}${inspection.client.comuna ? `, ${inspection.client.comuna}` : ''}`;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const clientNameLines = doc.splitTextToSize(clientName, 55).length;
  const clientAddrLines = doc.splitTextToSize(clientAddress, 65).length;
  const clientMaxLines = Math.max(1, clientNameLines, clientAddrLines);
  const clientContentH = (clientMaxLines * 3.8) + 2;
  const sec2HeaderHeight = 8;
  const sec2BoxHeight = sec2HeaderHeight + clientContentH + 2;

  checkAddPage(sec2BoxHeight + 4);

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, sec2BoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('2. DATOS DEL CLIENTE', margin + 4, y + 5.5);

  const clientRowY = y + sec2HeaderHeight + 2;

  // Col 1: Nombre de Cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Nombre de Cliente:', sec2Col1X, clientRowY);

  const clientLbl1Width = doc.getTextWidth('Nombre de Cliente:') + 2.5;
  doc.setFont('helvetica', 'normal');
  const splitClient1 = doc.splitTextToSize(clientName, 55);
  doc.text(splitClient1, sec2Col1X + clientLbl1Width, clientRowY);

  // Col 2: Dirección
  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', sec2Col2X, clientRowY);

  const clientLbl2Width = doc.getTextWidth('Dirección:') + 2.5;
  doc.setFont('helvetica', 'normal');
  const splitClient2 = doc.splitTextToSize(clientAddress, 65);
  doc.text(splitClient2, sec2Col2X + clientLbl2Width, clientRowY);

  y += sec2BoxHeight + 5;

  // -------------------------------------------------------------
  // SECTION 3: FICHA TÉCNICA DEL SISTEMA SOLAR
  // -------------------------------------------------------------
  const sec3Col1X = margin + 4;
  const sec3Col2X = margin + 96;

  // Potencia Instalada (kW) = Potencia nominal del inversor seleccionado
  let displayPower = 'N/A';
  if (inspection.technical.inverterNominalPowerKw && inspection.technical.inverterNominalPowerKw > 0) {
    displayPower = `${inspection.technical.inverterNominalPowerKw.toFixed(1)} kW`;
  } else if (inspection.technical.inverterBrandModel) {
    const invSpecs = parseInverterSpecs(inspection.technical.inverterBrandModel);
    if (invSpecs && invSpecs.nominalPowerKw > 0) {
      displayPower = `${invSpecs.nominalPowerKw.toFixed(1)} kW`;
    }
  } else if (inspection.technical.installedPowerKwp) {
    const rawPower = inspection.technical.installedPowerKwp;
    displayPower = !rawPower.toLowerCase().includes('kw') ? `${rawPower} kW` : rawPower;
  }

  // Tipo de Estructura de Montaje y Tipo de Techo
  let displayStructure = 'Coplanar sobre techo';
  if (inspection.technical.structureType) {
    const st = inspection.technical.structureType;
    if (st === 'Coplanar' || st.toLowerCase().includes('coplanar')) {
      displayStructure = inspection.technical.roofType ? `Coplanar (${inspection.technical.roofType})` : 'Coplanar sobre techo';
    } else if (st.toLowerCase().includes('telesc') || st.toLowerCase().includes('inclinaci')) {
      displayStructure = inspection.technical.roofType ? `Telescópica inclinada (${inspection.technical.roofType})` : 'Telescópicas para dar inclinación';
    } else if (st.toLowerCase().includes('monoposte')) {
      displayStructure = 'A piso monoposte';
    } else if (st.toLowerCase().includes('biposte')) {
      displayStructure = 'A piso biposte';
    } else if (st.toLowerCase().includes('carport') || st.toLowerCase().includes('calport')) {
      displayStructure = 'Carport solar';
    } else if (st === 'Otra' || st.toLowerCase().includes('otra')) {
      displayStructure = inspection.technical.customStructureNote ? `Otra (${inspection.technical.customStructureNote})` : 'Otra estructura';
    } else {
      displayStructure = inspection.technical.roofType ? `${st} (${inspection.technical.roofType})` : st;
    }
  }

  const mpptStr = inspection.technical.mpptCount 
    ? `${inspection.technical.mpptCount} MPPT | ${inspection.technical.stringsCount || 'N/A'} Str | ${inspection.technical.panelsPerString || 'N/A'} Pan`
    : `${inspection.technical.stringsCount || 'N/A'} Str | ${inspection.technical.panelsPerString || 'N/A'} Pan`;

  const specRows = [
    {
      col1: { label: 'Tipo de Sistema:', val: inspection.technical.systemType || 'On-Grid (Netbilling)', valWidth: 52 },
      col2: { label: 'Potencia Inversor:', val: displayPower, valWidth: 52 }
    },
    {
      col1: { label: 'Módulos Paneles:', val: inspection.technical.panelsCountAndPower || 'N/A', valWidth: 52 },
      col2: { label: 'Inversor Marca/Mod:', val: inspection.technical.inverterBrandModel || 'N/A', valWidth: 52 }
    },
    {
      col1: { label: 'Tipo Estructura:', val: displayStructure, valWidth: 52 },
      col2: { label: 'Config. Strings/MPPT:', val: mpptStr, valWidth: 52 }
    },
    {
      col1: { label: 'Baterías / Litio:', val: inspection.technical.batteryInfo || 'Sin Baterías', valWidth: 52 },
      col2: { label: 'Empresa Distribuidora:', val: inspection.technical.distributionCompany || 'Enel / CGE / Chilquinta', valWidth: 52 }
    },
    {
      col1: { label: 'Fecha Inspección:', val: inspection.technical.inspectionDate || new Date().toISOString().slice(0, 10), valWidth: 52 },
      col2: { label: 'Estado Declaración:', val: 'Listo para TE4 SEC', valWidth: 52 }
    }
  ];

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const rowHeights = specRows.map((row) => {
    const lines1 = doc.splitTextToSize(row.col1.val, row.col1.valWidth).length;
    const lines2 = doc.splitTextToSize(row.col2.val, row.col2.valWidth).length;
    const maxLines = Math.max(1, lines1, lines2);
    return (maxLines * 3.8) + 2.5;
  });

  const totalSpecsContentHeight = rowHeights.reduce((sum, h) => sum + h, 0);
  const sec3HeaderHeight = 9;
  const sec3SpecsBoxHeight = sec3HeaderHeight + totalSpecsContentHeight + 3;

  const mapsCardHeight = 25;
  const totalSec3CombinedHeight = sec3SpecsBoxHeight + mapsCardHeight + 8;

  checkAddPage(totalSec3CombinedHeight);

  // Main Specs Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, sec3SpecsBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('3. ESPECIFICACIONES TÉCNICAS DE LA INSTALACIÓN FOTOVOLTAICA', margin + 4, y + 6);

  let rowY = y + sec3HeaderHeight + 2;

  specRows.forEach((row, idx) => {
    const rHeight = rowHeights[idx];

    // Col 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(row.col1.label, sec3Col1X, rowY);

    const lbl1Width = doc.getTextWidth(row.col1.label) + 2.5;
    doc.setFont('helvetica', 'normal');
    const split1 = doc.splitTextToSize(row.col1.val, row.col1.valWidth);
    doc.text(split1, sec3Col1X + lbl1Width, rowY);

    // Col 2
    doc.setFont('helvetica', 'bold');
    doc.text(row.col2.label, sec3Col2X, rowY);

    const lbl2Width = doc.getTextWidth(row.col2.label) + 2.5;
    doc.setFont('helvetica', 'normal');
    const split2 = doc.splitTextToSize(row.col2.val, row.col2.valWidth);
    doc.text(split2, sec3Col2X + lbl2Width, rowY);

    rowY += rHeight;
  });

  y += sec3SpecsBoxHeight + 6;

  // -------------------------------------------------------------
  // GOOGLE MAPS LOCATION CARD
  // -------------------------------------------------------------
  const mapsBoxY = y;
  doc.setFillColor(240, 249, 255); // Sky blue light tint
  doc.setDrawColor(2, 132, 199); // Google maps sky blue border
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, mapsBoxY, contentWidth, mapsCardHeight, 2, 2, 'FD');

  // Vector Map Graphic Background (Left Side Map simulation)
  const mapGraphicX = margin + 3.5;
  const mapGraphicY = mapsBoxY + 3.5;
  const mapGraphicW = 20;
  const mapGraphicH = 18;

  // Map Background
  doc.setFillColor(226, 232, 240); // Map road base
  doc.roundedRect(mapGraphicX, mapGraphicY, mapGraphicW, mapGraphicH, 1.5, 1.5, 'F');

  // Park area on map
  doc.setFillColor(220, 252, 231); // Green park rect
  doc.rect(mapGraphicX + 1, mapGraphicY + 1, 8, 6, 'F');

  // Water area on map
  doc.setFillColor(224, 242, 254); // Blue river rect
  doc.rect(mapGraphicX + 10, mapGraphicY + 10, 9, 7, 'F');

  // Road grid lines
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.2);
  doc.line(mapGraphicX, mapGraphicY + 9, mapGraphicX + mapGraphicW, mapGraphicY + 9);
  doc.line(mapGraphicX + 11, mapGraphicY, mapGraphicX + 11, mapGraphicY + mapGraphicH);

  // Red Map Pin (Drop Pin)
  const pinX = mapGraphicX + 11;
  const pinY = mapGraphicY + 7;

  // Pin Shadow
  doc.setFillColor(148, 163, 184);
  doc.ellipse(pinX, pinY + 7.5, 3.2, 1, 'F');

  // Pin Red Body
  doc.setFillColor(234, 67, 53); // Google Red #EA4335
  doc.circle(pinX, pinY, 3.5, 'F');
  
  // Pin Pointer triangle
  doc.triangle(pinX - 3.2, pinY + 1, pinX + 3.2, pinY + 1, pinX, pinY + 7, 'F');

  // Pin Center Dot (White)
  doc.setFillColor(255, 255, 255);
  doc.circle(pinX, pinY, 1.3, 'F');

  // Text inside Google Maps Card
  const mapTextX = margin + 27;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42); // Navy
  doc.text('UBICACIÓN GEOGRÁFICA Y COORDENADAS GPS (GOOGLE MAPS)', mapTextX, mapsBoxY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199); // Sky blue
  doc.text('Coordenadas SEC:', mapTextX, mapsBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const gpsCoordVal = inspection.technical.gpsCoordinates || 'No registradas (Requerido SEC)';
  doc.text(gpsCoordVal, mapTextX + 28, mapsBoxY + 12, { maxWidth: 84 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Dirección Instalación:', mapTextX, mapsBoxY + 18);
  doc.setFont('helvetica', 'normal');
  const fullAddressStr = `${inspection.client.address || 'Sin Dirección'}${inspection.client.comuna ? `, ${inspection.client.comuna}` : ''}`;
  doc.text(fullAddressStr, mapTextX + 28, mapsBoxY + 18, { maxWidth: 84 });

  // Right Side Google Maps Verification Badge
  const mapBadgeW = 44;
  const mapBadgeH = 16;
  const mapBadgeX = margin + contentWidth - mapBadgeW - 3;
  const mapBadgeY = mapsBoxY + 4.5;

  doc.setFillColor(26, 115, 232); // Google Blue #1A73E8
  doc.roundedRect(mapBadgeX, mapBadgeY, mapBadgeW, mapBadgeH, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('GOOGLE MAPS', mapBadgeX + mapBadgeW / 2, mapBadgeY + 6.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(224, 242, 254);
  doc.text('GEOREFERENCIADO SEC', mapBadgeX + mapBadgeW / 2, mapBadgeY + 12, { align: 'center' });

  y += mapsCardHeight + 8;

  // -------------------------------------------------------------
  // SECTION 4: RESUMEN DE CHECKLIST NORMATIVO SEC
  // -------------------------------------------------------------
  checkAddPage(15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('4. CHECKLIST DE INSPECCIÓN TÉCNICA TE4 SEC', margin, y);

  y += 4;

  // Table Header
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Cód.', margin + 2, y + 5);
  doc.text('Ítem de Inspección y Parámetro Evaluado', margin + 14, y + 5);
  doc.text('Estado', margin + 133.5, y + 5, { align: 'center' });
  doc.text('Fotos', margin + 154, y + 5, { align: 'center' });
  doc.text('Obs.', margin + 173, y + 5, { align: 'center' });

  y += 7;

  let alternateBg = false;
  const applicableCategories = getApplicableCategories(inspection.categories, inspection.technical);

  applicableCategories.forEach((cat) => {
    // Category Header Row
    checkAddPage(8);
    doc.setFillColor(225, 232, 242);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.text(cat.title, margin + 2, y + 4.5);
    y += 6;

    cat.items.forEach((item) => {
      const cleanTitle = item.title.trim();
      const titleLines = doc.splitTextToSize(cleanTitle, 106);
      const rowHeight = Math.max(6.5, (titleLines.length * 3.5) + 2.5);

      checkAddPage(rowHeight + 1);

      if (alternateBg) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
      }
      alternateBg = !alternateBg;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(item.code, margin + 2, y + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.text(titleLines, margin + 14, y + 4.2);

      // Status Badge
      const badgeX = margin + 124;
      const badgeW = 19;
      if (item.status === 'C') {
        doc.setFillColor(greenPass[0], greenPass[1], greenPass[2]);
        doc.roundedRect(badgeX, y + 1, badgeW, 4.5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('Conforme', badgeX + badgeW / 2, y + 4.2, { align: 'center' });
      } else if (item.status === 'NC') {
        doc.setFillColor(redFail[0], redFail[1], redFail[2]);
        doc.roundedRect(badgeX, y + 1, badgeW, 4.5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('No Conf.', badgeX + badgeW / 2, y + 4.2, { align: 'center' });
      } else if (item.status === 'NA') {
        doc.setFillColor(150, 150, 150);
        doc.roundedRect(badgeX, y + 1, badgeW, 4.5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('N/A', badgeX + badgeW / 2, y + 4.2, { align: 'center' });
      } else {
        doc.setFillColor(220, 220, 220);
        doc.roundedRect(badgeX, y + 1, badgeW, 4.5, 1, 1, 'F');
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        doc.text('Pendiente', badgeX + badgeW / 2, y + 4.2, { align: 'center' });
      }

      // Photos Count
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`${item.photos.length} foto(s)`, margin + 154, y + 4.2, { align: 'center' });

      // Observation indicator
      const obsText = item.observation ? (item.observation.length > 12 ? item.observation.slice(0, 10) + '..' : item.observation) : '-';
      doc.text(obsText, margin + 173, y + 4.2, { align: 'center', maxWidth: 18 });

      y += rowHeight;
    });
  });

  y += 6;

  // -------------------------------------------------------------
  // SECTION 5: OBSERVACIONES Y CONCLUSIÓN TÉCNICA
  // -------------------------------------------------------------
  const generalObs = inspection.generalNotes || 'La instalación cumple con todos los parámetros técnicos y de seguridad exigidos por la normativa de la SEC para la tramitación de la Declaración TE4.';
  const splitObs = doc.splitTextToSize(generalObs, contentWidth - 8);
  const obsBoxHeight = Math.max(22, 10 + splitObs.length * 4);

  checkAddPage(obsBoxHeight + 6);

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, obsBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('5. OBSERVACIONES Y OBSERVACIÓN FINAL DEL INSTALADOR', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(splitObs, margin + 4, y + 11);

  y += obsBoxHeight + 8;

  // -------------------------------------------------------------
  // ANEXO FOTOGRÁFICO - CADA ÍTEM EN SU PÁGINA CORRESPONDIENTE
  // (No se mezclan fotos de ítems distintos en una misma página)
  // -------------------------------------------------------------
  interface ItemPhotoGroup {
    code: string;
    title: string;
    normaSec: string;
    status: string;
    observation?: string;
    photos: {
      photo: PhotoItem;
      prepared: {
        dataUrl?: string;
        format: 'JPEG' | 'PNG';
        width: number;
        height: number;
        aspectRatio?: number;
        isVideo?: boolean;
      } | null;
    }[];
  }

  const itemsWithPhotos: ItemPhotoGroup[] = [];

  for (const cat of applicableCategories) {
    for (const item of cat.items) {
      if (item.photos && item.photos.length > 0) {
        const preparedList = await Promise.all(
          item.photos.map(async (ph) => {
            const prepared = await prepareImageForPdf(ph.url, ph.id, ph.name);
            return {
              photo: ph,
              prepared,
            };
          })
        );

        itemsWithPhotos.push({
          code: item.code,
          title: item.title,
          normaSec: item.normaSec,
          status: item.status,
          observation: item.observation,
          photos: preparedList,
        });
      }
    }
  }

  if (itemsWithPhotos.length > 0) {
    for (const itemGroup of itemsWithPhotos) {
      // Cada ítem inicia estrictamente en una nueva página
      doc.addPage();
      y = margin;
      drawHeaderFooter();

      const drawItemPhotoHeader = (isContinuation: boolean) => {
        const headerH = 15;
        doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
        doc.roundedRect(margin, y, contentWidth, headerH, 2, 2, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        const headerTitle = isContinuation
          ? `ANEXO FOTOGRÁFICO - ÍTEM ${itemGroup.code} (Continuación)`
          : `ANEXO FOTOGRÁFICO - ÍTEM ${itemGroup.code}`;
        doc.text(headerTitle, margin + 4, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(215, 228, 245);
        const subTitle = `${itemGroup.title}${itemGroup.normaSec ? ` • Norma SEC: ${itemGroup.normaSec}` : ''}`;
        const subLines = doc.splitTextToSize(subTitle, contentWidth - 36);
        doc.text(subLines[0] || subTitle, margin + 4, y + 11);

        // Status Badge
        const badgeW = 24;
        const badgeH = 5;
        const badgeX = margin + contentWidth - badgeW - 3;
        const badgeY = y + 2.5;

        if (itemGroup.status === 'C') {
          doc.setFillColor(greenPass[0], greenPass[1], greenPass[2]);
          doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text('CONFORME', badgeX + badgeW / 2, badgeY + 3.7, { align: 'center' });
        } else if (itemGroup.status === 'NC') {
          doc.setFillColor(redFail[0], redFail[1], redFail[2]);
          doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text('NO CONF.', badgeX + badgeW / 2, badgeY + 3.7, { align: 'center' });
        } else if (itemGroup.status === 'NA') {
          doc.setFillColor(130, 130, 130);
          doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text('N/A', badgeX + badgeW / 2, badgeY + 3.7, { align: 'center' });
        }

        y += headerH + 3;

        // Observation banner if not continuation and has observation
        if (!isContinuation && itemGroup.observation) {
          doc.setFontSize(7.5);
          const obsText = `Observación técnica: ${itemGroup.observation}`;
          const obsLines = doc.splitTextToSize(obsText, contentWidth - 8);
          const obsH = Math.max(6.5, obsLines.length * 3.3 + 3);
          doc.setFillColor(254, 243, 199);
          doc.setDrawColor(245, 158, 11);
          doc.setLineWidth(0.2);
          doc.roundedRect(margin, y, contentWidth, obsH, 1, 1, 'FD');
          doc.setTextColor(146, 64, 14);
          doc.setFont('helvetica', 'bold');
          doc.text(obsLines, margin + 4, y + 4.2);
          y += obsH + 3;
        }
      };

      drawItemPhotoHeader(false);

      const maxPageY = pageHeight - margin - 12;
      const numPhotos = itemGroup.photos.length;

      if (numPhotos === 1) {
        // Single photo layout: Centered and prominent
        const cardW = 144;
        const cardH = 112;
        const posX = margin + (contentWidth - cardW) / 2;
        const photoItem = itemGroup.photos[0];

        // Container card
        doc.setFillColor(252, 253, 255);
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(posX, y, cardW, cardH, 2, 2, 'FD');

        // Header banner inside card
        doc.setFillColor(235, 243, 238);
        doc.roundedRect(posX + 1.5, y + 1.5, cardW - 3, 7, 1.5, 1.5, 'F');
        doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
        doc.roundedRect(posX + 2.5, y + 2.5, 28, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('Fotografía 1 de 1', posX + 16.5, y + 6, { align: 'center' });

        doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        const cleanSingleTitle = itemGroup.title.length > 50 ? itemGroup.title.slice(0, 48) + '..' : itemGroup.title;
        doc.text(cleanSingleTitle, posX + 33, y + 6, { maxWidth: cardW - 36 });

        // Box image
        const boxW = cardW - 6;
        const boxH = 82;
        const boxX = posX + 3;
        const boxY = y + 10.5;

        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.roundedRect(boxX, boxY, boxW, boxH, 1, 1, 'FD');

        if (photoItem.prepared && photoItem.prepared.isVideo) {
          doc.setFillColor(238, 242, 255);
          doc.rect(boxX, boxY, boxW, boxH, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
          doc.text('🎥 [REGISTRO DE VIDEO ADJUNTO]', boxX + boxW / 2, boxY + 30, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(textDark[0], textDark[1], textDark[2]);
          doc.text(`Archivo: ${(photoItem.photo.name || 'Video').substring(0, 40)}`, boxX + boxW / 2, boxY + 42, { align: 'center' });
          doc.text(`Fecha/Hora: ${photoItem.photo.timestamp || 'Registrado'}`, boxX + boxW / 2, boxY + 52, { align: 'center' });
        } else if (photoItem.prepared && photoItem.prepared.dataUrl) {
          try {
            const imgAspect = photoItem.prepared.aspectRatio || (photoItem.prepared.width / photoItem.prepared.height) || 1.33;
            const boxAspect = boxW / boxH;
            let drawW = boxW;
            let drawH = boxH;
            if (imgAspect > boxAspect) {
              drawW = boxW;
              drawH = boxW / imgAspect;
            } else {
              drawH = boxH;
              drawW = boxH * imgAspect;
            }
            const imgX = boxX + (boxW - drawW) / 2;
            const imgY = boxY + (boxH - drawH) / 2;
            doc.addImage(photoItem.prepared.dataUrl, photoItem.prepared.format, imgX, imgY, drawW, drawH);
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.2);
            doc.rect(imgX, imgY, drawW, drawH, 'D');
          } catch (e) {
            console.warn('Error rendering image in PDF:', e);
          }
        }

        // Footer of single photo
        const footY = y + 96;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const timestampStr = photoItem.photo.timestamp ? `📅 ${photoItem.photo.timestamp}` : '📅 Fecha en terreno';
        doc.text(timestampStr, posX + 4, footY + 4);

        const specificNote = photoItem.photo.note || itemGroup.observation || '';
        if (specificNote) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text(`📝 ${specificNote}`, posX + 4, footY + 9, { maxWidth: cardW - 8 });
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(`Norma: ${itemGroup.normaSec} • Evidencia Fotográfica`, posX + 4, footY + 9, { maxWidth: cardW - 8 });
        }
      } else {
        // Multi-photo layout: 2 columns grid
        const gapX = 8;
        const cardW = (contentWidth - gapX) / 2; // 87 mm
        const cardH = 78; // 78 mm
        const gapY = 6;
        const itemsPerRow = 2;

        let photoIdxInPage = 0;

        for (let p = 0; p < numPhotos; p++) {
          const photoItem = itemGroup.photos[p];
          const col = photoIdxInPage % itemsPerRow;
          const posX = margin + col * (cardW + gapX);

          // Check if new row fits on current page (only continuations of THIS SAME item)
          if (col === 0 && y + cardH > maxPageY) {
            doc.addPage();
            y = margin;
            drawHeaderFooter();
            drawItemPhotoHeader(true);
            photoIdxInPage = 0;
          }

          // Container card
          doc.setFillColor(252, 253, 255);
          doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
          doc.setLineWidth(0.3);
          doc.roundedRect(posX, y, cardW, cardH, 2, 2, 'FD');

          // Header banner inside card
          doc.setFillColor(235, 243, 238);
          doc.roundedRect(posX + 1.5, y + 1.5, cardW - 3, 7.5, 1.5, 1.5, 'F');

          // Badge with photo number
          doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
          doc.roundedRect(posX + 2.5, y + 2.5, 22, 5.5, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text(`Foto ${p + 1} de ${numPhotos}`, posX + 13.5, y + 6.2, { align: 'center' });

          doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          const cleanTitle = itemGroup.title.length > 30 ? itemGroup.title.slice(0, 28) + '..' : itemGroup.title;
          doc.text(cleanTitle, posX + 27, y + 6.3, { maxWidth: cardW - 30 });

          // Box image
          const boxW = cardW - 6; // 81 mm
          const boxH = 51; // 51 mm
          const boxX = posX + 3;
          const boxY = y + 10.5;

          doc.setFillColor(241, 245, 249);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.2);
          doc.roundedRect(boxX, boxY, boxW, boxH, 1, 1, 'FD');

          if (photoItem.prepared && photoItem.prepared.isVideo) {
            doc.setFillColor(238, 242, 255);
            doc.rect(boxX, boxY, boxW, boxH, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
            doc.text('🎥 [REGISTRO DE VIDEO ADJUNTO]', boxX + boxW / 2, boxY + 18, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(textDark[0], textDark[1], textDark[2]);
            doc.text(`Archivo: ${(photoItem.photo.name || 'Video').substring(0, 30)}`, boxX + boxW / 2, boxY + 27, { align: 'center' });
            doc.text(`Fecha/Hora: ${photoItem.photo.timestamp || 'Registrado'}`, boxX + boxW / 2, boxY + 35, { align: 'center' });
          } else if (photoItem.prepared && photoItem.prepared.dataUrl) {
            try {
              const imgAspect = photoItem.prepared.aspectRatio || (photoItem.prepared.width / photoItem.prepared.height) || 1.33;
              const boxAspect = boxW / boxH;
              let drawW = boxW;
              let drawH = boxH;
              if (imgAspect > boxAspect) {
                drawW = boxW;
                drawH = boxW / imgAspect;
              } else {
                drawH = boxH;
                drawW = boxH * imgAspect;
              }
              const imgX = boxX + (boxW - drawW) / 2;
              const imgY = boxY + (boxH - drawH) / 2;
              doc.addImage(photoItem.prepared.dataUrl, photoItem.prepared.format, imgX, imgY, drawW, drawH);
              doc.setDrawColor(203, 213, 225);
              doc.setLineWidth(0.2);
              doc.rect(imgX, imgY, drawW, drawH, 'D');
            } catch (e) {
              console.warn('Error placing image in PDF:', e);
              doc.setFillColor(241, 245, 249);
              doc.rect(boxX, boxY, boxW, boxH, 'F');
              doc.setFontSize(7.5);
              doc.setTextColor(120, 120, 120);
              doc.text('Foto adjunta registrada', boxX + boxW / 2, boxY + 25, { align: 'center' });
            }
          } else {
            doc.setFillColor(241, 245, 249);
            doc.rect(boxX, boxY, boxW, boxH, 'F');
            doc.setFontSize(7.5);
            doc.setTextColor(120, 120, 120);
            doc.text('Foto adjunta registrada', boxX + boxW / 2, boxY + 25, { align: 'center' });
          }

          // Card footer
          const footerY = y + 63.5;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.8);
          doc.setTextColor(100, 116, 139);

          const timestampStr = photoItem.photo.timestamp ? `📅 ${photoItem.photo.timestamp}` : '📅 Fecha en terreno';
          doc.text(timestampStr, posX + 3, footerY + 2.5);

          const specificNote = photoItem.photo.note || itemGroup.observation || '';
          if (specificNote) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            const cleanNote = specificNote.length > 38 ? specificNote.slice(0, 36) + '..' : specificNote;
            doc.text(`📝 ${cleanNote}`, posX + 3, footerY + 7, { maxWidth: cardW - 6 });
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`Norma: ${itemGroup.normaSec} • Inspección Fotográfica`, posX + 3, footerY + 7, { maxWidth: cardW - 6 });
          }

          photoIdxInPage++;

          if (col === itemsPerRow - 1 || p === numPhotos - 1) {
            y += cardH + gapY;
          }
        }
      }
      // Al terminar este ítem, el siguiente ítem iniciará obligatoriamente en una nueva página (doc.addPage)
    }
  }

  return doc.output('blob');
}
