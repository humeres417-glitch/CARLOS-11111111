import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  ExternalLink,
  Loader2,
  FolderCheck,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  LogIn,
  LogOut,
  Key,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Download,
  Mail,
  Send,
  Sparkles,
  ShieldCheck,
  Folder,
} from 'lucide-react';
import { Inspection, UploadProgress } from '../types';
import {
  uploadFullInspectionToDrive,
  downloadInspectionZip,
  TARGET_DRIVE_ACCOUNT,
  buildInspectionBaseFileName,
} from '../utils/googleDrive';
import { generateTE4PdfReport } from '../utils/pdfGenerator';
import {
  googleSignIn,
  initAuth,
  logoutGoogle,
  getAccessToken,
  setManualAccessToken,
  getCurrentUser,
} from '../utils/firebaseAuth';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection;
  onInspectionUploaded: (driveFolderId: string, driveFolderUrl: string) => void;
  onTokenCleared?: () => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
  inspection,
  onInspectionUploaded,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipStepMessage, setZipStepMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(getCurrentUser());
  const [hasToken, setHasToken] = useState<boolean>(!!getAccessToken());
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccessUrl, setUploadSuccessUrl] = useState<string | null>(null);
  const [showManualToken, setShowManualToken] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const { formattedName, clientName, address, date } = buildInspectionBaseFileName(inspection);

  useEffect(() => {
    if (isOpen) {
      const activeTok = getAccessToken();
      setHasToken(!!activeTok);
      setUser(getCurrentUser());
      setErrorMessage(null);

      const unsubscribe = initAuth(
        (u, token) => {
          setUser(u);
          setHasToken(!!token);
        },
        () => {
          const t = getAccessToken();
          setUser(t ? getCurrentUser() : null);
          setHasToken(!!t);
        }
      );
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Count total photos
  const totalPhotosCount = inspection.categories.reduce(
    (sum, cat) => sum + cat.items.reduce((s, item) => s + item.photos.length, 0),
    0
  );

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      setUser(result.user);
      setHasToken(true);
    } catch (err: any) {
      console.warn('Login note:', err);
      setErrorMessage(
        err?.message || 'No se pudo completar el inicio de sesión con Google. Por favor reintente o use Opciones Avanzadas.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setHasToken(false);
    setErrorMessage(null);
  };

  const handleApplyManualToken = () => {
    if (!manualTokenInput.trim()) return;
    setManualAccessToken(manualTokenInput.trim(), TARGET_DRIVE_ACCOUNT);
    setHasToken(true);
    setUser({ displayName: 'Técnico Servilec', email: TARGET_DRIVE_ACCOUNT });
    setErrorMessage(null);
    setShowManualToken(false);
    setManualTokenInput('');
  };

  const handleStartDriveUpload = async () => {
    setErrorMessage(null);
    setIsUploading(true);
    setUploadSuccessUrl(null);

    try {
      let activeTok = getAccessToken();
      if (!activeTok) {
        setIsAuthenticating(true);
        const loginRes = await googleSignIn();
        activeTok = loginRes.accessToken;
        setUser(loginRes.user);
        setHasToken(true);
        setIsAuthenticating(false);
      }

      // 1. Generate PDF Report Blob
      setProgress({
        currentStep: 'Generando Reporte Técnico SEC en PDF...',
        totalFiles: totalPhotosCount + 1,
        completedFiles: 0,
        currentFileName: `${formattedName}.pdf`,
        isComplete: false,
      });

      const pdfBlob = await generateTE4PdfReport(inspection);

      // 2. Upload Report and Photos directly to Google Drive
      const { folderId, folderUrl } = await uploadFullInspectionToDrive(
        inspection,
        pdfBlob,
        activeTok,
        (currentProgress) => {
          setProgress(currentProgress);
        }
      );

      setUploadSuccessUrl(folderUrl);
      onInspectionUploaded(folderId, folderUrl);
    } catch (err: any) {
      console.error('Error en carga a Google Drive:', err);
      const msg = err.message || 'Error durante la carga a Google Drive.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      setIsAuthenticating(false);
    }
  };

  const handleDownloadZipPackage = async () => {
    setIsDownloadingZip(true);
    setZipStepMessage('Generando reporte PDF...');
    try {
      const pdfBlob = await generateTE4PdfReport(inspection);
      await downloadInspectionZip(inspection, pdfBlob, (step) => {
        setZipStepMessage(step);
      });
      setZipStepMessage(null);
    } catch (err: any) {
      console.error('Error generando paquete ZIP:', err);
      setErrorMessage(err.message || 'Error al generar paquete ZIP.');
    } finally {
      setIsDownloadingZip(false);
      setZipStepMessage(null);
    }
  };

  const handleSendByEmail = () => {
    const subject = encodeURIComponent(`[INSPECCIÓN TE4 SEC] ${clientName} - ${address} (${date})`);
    const body = encodeURIComponent(
      `Estimado equipo Servilec,\n\nSe ha completado la inspección técnica fotovoltaica SEC para el proyecto:\n\n` +
      `• Cliente: ${clientName}\n` +
      `• Dirección / Comuna: ${address}\n` +
      `• Fecha de Inspección: ${date}\n` +
      `• Potencia: ${inspection.technical?.installedPower || 'N/A'} kWp\n` +
      `• Total de Fotos de Evidencia: ${totalPhotosCount}\n` +
      `• Carpeta en Drive: INSTALACIONES SERVILEC / ${formattedName}\n\n` +
      `Saludos cordiales,\nInspector Técnico Servilec`
    );
    window.location.href = `mailto:${TARGET_DRIVE_ACCOUNT}?subject=${subject}&body=${body}`;
  };

  const driveTargetFolderUrl = uploadSuccessUrl || `https://drive.google.com/drive/u/0/my-drive`;

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-[#1A1A1A] max-w-lg w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl rounded-xs">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#14532D] to-[#15803D] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#25A238] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#25A238] text-white flex items-center justify-center font-bold rounded-xs shadow-xs">
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white font-bold leading-tight">
                Google Drive — Envío Ágil de Inspección
              </h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-100/90">
                SERVILEC ENERGÍA • {TARGET_DRIVE_ACCOUNT}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading || isAuthenticating || isDownloadingZip}
            className="text-white hover:text-emerald-200 font-mono text-xs font-bold cursor-pointer px-2 py-1"
          >
            [CERRAR]
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-[#1A1A1A] overflow-y-auto">
          {/* Target Account Badge & Direct Status */}
          <div className="bg-[#F0FDF4] p-3.5 border border-[#15803D]/40 space-y-2.5 rounded-xs">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#14532D] font-bold block">
                  Cuenta Destino Google Drive:
                </span>
                <strong className="text-sm font-mono text-[#15803D] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                  {TARGET_DRIVE_ACCOUNT}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                {hasToken ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#15803D] text-white text-[10px] font-mono font-bold rounded-xs shadow-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-white" /> Conectado a Drive
                  </span>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isAuthenticating || isUploading || isDownloadingZip}
                    className="px-3.5 py-1.5 bg-[#15803D]/15 text-[#14532D] border border-[#15803D]/40 text-[10px] font-mono font-bold hover:bg-[#15803D]/25 flex items-center gap-1.5 rounded-xs transition-colors cursor-pointer"
                    title="Conectar cuenta Google opcionalmente"
                  >
                    {isAuthenticating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5" />
                    )}
                    Conectar Google
                  </button>
                )}
              </div>
            </div>

            {hasToken && user && (
              <div className="flex items-center justify-between text-[10px] text-[#14532D]/90 font-mono pt-1.5 border-t border-[#15803D]/20">
                <span>Sesión: {user.displayName || user.email || TARGET_DRIVE_ACCOUNT}</span>
                <button
                  onClick={handleGoogleLogout}
                  className="text-red-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <LogOut className="w-3 h-3" /> Desconectar
                </button>
              </div>
            )}
          </div>

          {/* Target Folder Naming Preview */}
          <div className="bg-[#F7F5F2] p-3.5 border border-[#1A1A1A] space-y-2 rounded-xs">
            <h4 className="font-serif italic text-sm text-[#1A1A1A] flex items-center gap-1.5 font-bold">
              <Folder className="w-4 h-4 text-[#15803D]" />
              Estructura de Carpeta en Google Drive:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[#1A1A1A] font-sans">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#15803D]" />
                <span>1 Reporte PDF Técnico SEC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#15803D]" />
                <span>{totalPhotosCount} Fotos de Evidencia</span>
              </div>
            </div>
            <div className="text-[11px] font-mono pt-2 border-t border-[#1A1A1A]/20 bg-white p-2 rounded-xs border">
              <span className="text-slate-500 block text-[9.5px] uppercase">Ruta organizada:</span>
              <strong className="text-emerald-950 block break-all">
                INSTALACIONES SERVILEC / {formattedName}
              </strong>
            </div>
          </div>

          {/* Upload Progress Display */}
          {progress && (
            <div className="bg-[#F0FDF4] border border-[#15803D] p-3.5 space-y-2 rounded-xs">
              <div className="flex justify-between items-center text-[#14532D] font-mono text-[11px] font-bold">
                <span>{progress.currentStep}</span>
                <span>
                  {progress.completedFiles}/{progress.totalFiles}
                </span>
              </div>

              <div className="w-full bg-white border border-[#15803D]/40 h-3 overflow-hidden rounded-2xs">
                <div
                  className="bg-[#15803D] h-full transition-all duration-300"
                  style={{
                    width: `${Math.round((progress.completedFiles / (progress.totalFiles || 1)) * 100)}%`,
                  }}
                />
              </div>

              <p className="text-[10px] font-mono text-emerald-900 truncate">
                {progress.currentFileName}
              </p>

              {progress.isComplete && (
                <div className="pt-2 space-y-2">
                  <a
                    href={progress.driveFolderUrl || driveTargetFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#15803D] text-white text-[11px] uppercase font-mono tracking-widest font-bold hover:bg-[#25A238] transition-colors rounded-xs shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir Carpeta en Google Drive ({TARGET_DRIVE_ACCOUNT})
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Quick Alternative Actions: Email & ZIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* Quick Email Dispatch */}
            <button
              type="button"
              onClick={handleSendByEmail}
              className="p-3 bg-white border border-slate-300 hover:border-[#15803D] hover:bg-[#F0FDF4] text-slate-800 text-left rounded-xs transition-colors cursor-pointer flex flex-col justify-between gap-1 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#14532D]">
                <Mail className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Notificar por Correo</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Enviar resumen a {TARGET_DRIVE_ACCOUNT}
              </p>
            </button>

            {/* Offline ZIP Backup */}
            <button
              type="button"
              onClick={handleDownloadZipPackage}
              disabled={isDownloadingZip || isUploading}
              className="p-3 bg-white border border-slate-300 hover:border-[#15803D] hover:bg-[#F0FDF4] text-slate-800 text-left rounded-xs transition-colors cursor-pointer flex flex-col justify-between gap-1 shadow-2xs disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#14532D]">
                {isDownloadingZip ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#15803D]" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-[#15803D]" />
                )}
                <span>Descargar Paquete ZIP</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {isDownloadingZip ? zipStepMessage || 'Preparando ZIP...' : `PDF + ${totalPhotosCount} fotos organizadas`}
              </p>
            </button>
          </div>

          {/* Collapsible Manual Token / Advanced Options */}
          <div className="border border-slate-200 bg-slate-50/70 p-3 rounded-xs space-y-2">
            <button
              type="button"
              onClick={() => setShowManualToken(!showManualToken)}
              className="flex items-center justify-between w-full text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider hover:text-slate-900 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Key className="w-3 h-3 text-[#15803D]" />
                Opciones avanzadas / Token OAuth de Google
              </span>
              {showManualToken ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showManualToken && (
              <div className="pt-2 border-t border-slate-200 space-y-3 text-[11px]">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-600 font-bold mb-1">
                    Pegar Token de Acceso OAuth de Google (Bearer Token):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={manualTokenInput}
                      onChange={(e) => setManualTokenInput(e.target.value)}
                      placeholder="ya29.a0A..."
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 bg-white text-xs font-mono rounded-xs focus:outline-none focus:border-[#15803D]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyManualToken}
                      className="px-3 py-1.5 bg-[#15803D] text-white text-[10px] font-mono font-bold rounded-xs hover:bg-[#16A34A] cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-amber-50 border border-amber-300 text-amber-950 p-3.5 text-xs font-mono space-y-1.5 rounded-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Nota de sincronización:</span>
              </div>
              <p className="font-sans leading-relaxed text-[11.5px]">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-[#1A1A1A] flex items-center justify-between gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={onClose}
            disabled={isUploading || isAuthenticating || isDownloadingZip}
            className="px-4 py-2.5 border border-[#1A1A1A] bg-white text-[#1A1A1A] text-[10px] uppercase font-mono tracking-widest font-bold hover:bg-[#F7F5F2] transition-colors cursor-pointer rounded-xs"
          >
            Cerrar
          </button>

          <button
            onClick={handleStartDriveUpload}
            disabled={isUploading || isAuthenticating || isDownloadingZip}
            className="px-5 py-2.5 border border-[#14532D] bg-[#15803D] text-white text-[11px] uppercase font-mono tracking-widest font-bold hover:bg-[#25A238] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs rounded-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Subiendo a Google Drive...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Subir a Google Drive ({TARGET_DRIVE_ACCOUNT})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
