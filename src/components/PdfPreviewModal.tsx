import React, { useState, useEffect } from 'react';
import { FileText, Download, HardDrive, Loader2, Share2, Check, BookOpen, Layers } from 'lucide-react';
import { Inspection } from '../types';
import { generateTE4PdfReport } from '../utils/pdfGenerator';
import { generateMemoriaExplicativaPdf } from '../utils/memoriaExplicativaGenerator';
import { buildInspectionBaseFileName } from '../utils/googleDrive';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection;
  onOpenDriveSync: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  inspection,
  onOpenDriveSync,
}) => {
  const [activeDoc, setActiveDoc] = useState<'informe' | 'memoria'>('informe');
  const [informeUrl, setInformeUrl] = useState<string | null>(null);
  const [informeBlob, setInformeBlob] = useState<Blob | null>(null);
  const [isGeneratingInforme, setIsGeneratingInforme] = useState(false);

  const [memoriaUrl, setMemoriaUrl] = useState<string | null>(null);
  const [memoriaBlob, setMemoriaBlob] = useState<Blob | null>(null);
  const [isGeneratingMemoria, setIsGeneratingMemoria] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);

  // Generate Informe TE4
  useEffect(() => {
    if (isOpen) {
      setIsGeneratingInforme(true);
      generateTE4PdfReport(inspection)
        .then((blob) => {
          setInformeBlob(blob);
          const url = URL.createObjectURL(blob);
          setInformeUrl(url);
        })
        .catch((err) => {
          console.error('Error al generar PDF de Inspección:', err);
        })
        .finally(() => {
          setIsGeneratingInforme(false);
        });

      // Also generate Memoria Explicativa
      setIsGeneratingMemoria(true);
      generateMemoriaExplicativaPdf(inspection)
        .then((blob) => {
          setMemoriaBlob(blob);
          const url = URL.createObjectURL(blob);
          setMemoriaUrl(url);
        })
        .catch((err) => {
          console.error('Error al generar Memoria Explicativa:', err);
        })
        .finally(() => {
          setIsGeneratingMemoria(false);
        });
    } else {
      if (informeUrl) {
        URL.revokeObjectURL(informeUrl);
        setInformeUrl(null);
      }
      if (memoriaUrl) {
        URL.revokeObjectURL(memoriaUrl);
        setMemoriaUrl(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const { formattedName } = buildInspectionBaseFileName(inspection);

  const handleDownloadActive = () => {
    if (activeDoc === 'informe' && informeBlob) {
      const fileName = `${formattedName}_Informe_TE4.pdf`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(informeBlob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (activeDoc === 'memoria' && memoriaBlob) {
      const fileName = `${formattedName}_Memoria_Explicativa_SEC.pdf`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(memoriaBlob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadBoth = () => {
    if (informeBlob) {
      const a1 = document.createElement('a');
      a1.href = URL.createObjectURL(informeBlob);
      a1.download = `${formattedName}_Informe_TE4.pdf`;
      document.body.appendChild(a1);
      a1.click();
      document.body.removeChild(a1);
    }
    if (memoriaBlob) {
      setTimeout(() => {
        const a2 = document.createElement('a');
        a2.href = URL.createObjectURL(memoriaBlob);
        a2.download = `${formattedName}_Memoria_Explicativa_SEC.pdf`;
        document.body.appendChild(a2);
        a2.click();
        document.body.removeChild(a2);
      }, 400);
    }
  };

  const currentUrl = activeDoc === 'informe' ? informeUrl : memoriaUrl;
  const isGenerating = activeDoc === 'informe' ? isGeneratingInforme : isGeneratingMemoria;
  const currentBlob = activeDoc === 'informe' ? informeBlob : memoriaBlob;

  const handleShare = async () => {
    if (navigator.share && currentBlob) {
      try {
        const titleSuffix = activeDoc === 'informe' ? 'Informe TE4 SEC' : 'Memoria Explicativa SEC';
        const docName = activeDoc === 'informe' ? `${formattedName}_Informe_TE4.pdf` : `${formattedName}_Memoria_Explicativa_SEC.pdf`;
        const file = new File([currentBlob], docName, { type: 'application/pdf' });
        await navigator.share({
          title: `${titleSuffix} - ${inspection.client.name}`,
          text: `Documentación técnica SEC para instalación fotovoltaica.`,
          files: [file],
        });
      } catch (e) {
        console.log('Share canceled or not supported');
      }
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border border-[#1A1A1A] max-w-5xl w-full h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#14532D] to-[#15803D] text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 border-b-2 border-[#25A238]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#25A238] text-white flex items-center justify-center font-bold rounded-xs shadow-xs">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white font-bold">
                Documentación Oficial SEC Ley 20.571
              </h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-100/80">
                SERVILEC ENERGÍA • Cliente: {inspection.client.name || 'Sin especificar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Upload to Drive */}
            <button
              id="btn-drive-from-pdf-modal"
              onClick={() => {
                onClose();
                onOpenDriveSync();
              }}
              className="px-3 py-1.5 border border-white bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#333] transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Subir a Drive</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="text-white hover:opacity-60 font-mono text-sm font-bold ml-2 cursor-pointer"
            >
              [CERRAR]
            </button>
          </div>
        </div>

        {/* Document Selection Tabs */}
        <div className="bg-[#0F172A] px-4 sm:px-6 py-2 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDoc('informe')}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold tracking-wide rounded-t-xs transition-colors flex items-center gap-2 cursor-pointer ${
                activeDoc === 'informe'
                  ? 'bg-white text-[#14532D] shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Informe Inspección TE4 SEC</span>
            </button>

            <button
              onClick={() => setActiveDoc('memoria')}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold tracking-wide rounded-t-xs transition-colors flex items-center gap-2 cursor-pointer ${
                activeDoc === 'memoria'
                  ? 'bg-white text-[#14532D] shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Memoria Explicativa SEC (11 Páginas)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleDownloadBoth}
              disabled={isGeneratingInforme || isGeneratingMemoria}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-mono uppercase font-bold rounded-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
            >
              <Layers className="w-3 h-3" />
              <span>Descargar Ambos PDFs</span>
            </button>
          </div>
        </div>

        {/* Content Preview Canvas / iFrame */}
        <div className="flex-1 bg-[#1A1A1A]/90 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center text-white space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
              <p className="text-xs uppercase font-mono tracking-widest">
                {activeDoc === 'informe'
                  ? 'Generando Informe de Inspección TE4 SEC...'
                  : 'Generando Memoria Explicativa Oficial SEC (11 Páginas)...'}
              </p>
            </div>
          ) : currentUrl ? (
            <iframe
              src={currentUrl}
              title={activeDoc === 'informe' ? 'Vista previa Informe TE4' : 'Vista previa Memoria Explicativa SEC'}
              className="w-full h-full border border-[#1A1A1A] bg-white shadow-lg"
            />
          ) : (
            <div className="text-center text-red-300 text-xs font-mono uppercase tracking-widest">
              No se pudo cargar la vista previa del documento.
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#F7F5F2] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 border-t border-[#1A1A1A] text-xs">
          <div className="flex items-center gap-2 text-[#1A1A1A] font-mono text-[10px] uppercase tracking-widest opacity-70">
            <span>
              {activeDoc === 'informe'
                ? 'Documento 1: Informe Fotográfico de Inspección TE4'
                : 'Documento 2: Memoria Explicativa con Cálculos Técnicos y Normativa SEC'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 border border-[#1A1A1A] bg-white text-[#1A1A1A] text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#F7F5F2] transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Share2 className="w-3.5 h-3.5 text-[#1A1A1A]" />}
              <span>{copiedLink ? 'Copiado' : 'Compartir'}</span>
            </button>

            <button
              onClick={handleDownloadActive}
              disabled={isGenerating || !currentBlob}
              className="px-4 py-1.5 border border-[#25A238] bg-[#15803D] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#25A238] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Descargar {activeDoc === 'informe' ? 'Informe TE4' : 'Memoria SEC'}</span>
            </button>

            <button
              onClick={handleDownloadBoth}
              disabled={isGeneratingInforme || isGeneratingMemoria}
              className="px-4 py-1.5 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guardar Ambos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


