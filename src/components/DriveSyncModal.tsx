import React, { useState, useEffect } from 'react';
import { HardDrive, ExternalLink, Loader2, FolderCheck, FileText, Image as ImageIcon, CheckCircle, LogIn, LogOut, Key, Copy, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Inspection, UploadProgress } from '../types';
import { uploadFullInspectionToDrive, TARGET_DRIVE_ACCOUNT, buildInspectionBaseFileName } from '../utils/googleDrive';
import { generateTE4PdfReport } from '../utils/pdfGenerator';
import { googleSignIn, initAuth, logoutGoogle, getAccessToken, setManualAccessToken, getCurrentUser } from '../utils/firebaseAuth';

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
  const [user, setUser] = useState<any | null>(getCurrentUser());
  const [hasToken, setHasToken] = useState<boolean>(!!getAccessToken());
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualToken, setShowManualToken] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  useEffect(() => {
    if (isOpen) {
      const activeTok = getAccessToken();
      setHasToken(!!activeTok);
      setUser(getCurrentUser());

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
      console.error('Login error:', err);
      const msg = err?.message || 'Error al conectar con Google.';
      setErrorMessage(msg);
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

  const handleCopyDomain = () => {
    if (!currentHostname) return;
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  const handleStartDriveUpload = async () => {
    setErrorMessage(null);
    setIsUploading(true);

    try {
      let currentToken = getAccessToken() || undefined;

      // If no token is present, try automatic Google connect once
      if (!currentToken) {
        try {
          const authRes = await googleSignIn();
          currentToken = authRes.accessToken;
          setUser(authRes.user);
          setHasToken(true);
        } catch (e) {
          console.warn('Auto-auth before upload was skipped or failed, proceeding with server upload:', e);
        }
      }

      // 1. Generate PDF Report Blob
      const pdfBlob = await generateTE4PdfReport(inspection);

      // 2. Upload Report and Photos directly to Google Drive
      const { folderId, folderUrl } = await uploadFullInspectionToDrive(
        inspection,
        pdfBlob,
        currentToken,
        (currentProgress) => {
          setProgress(currentProgress);
        }
      );

      onInspectionUploaded(folderId, folderUrl);
    } catch (err: any) {
      console.error('Error en carga a Google Drive:', err);
      setErrorMessage(err.message || 'Error durante la carga a Google Drive.');
    } finally {
      setIsUploading(false);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1A1A1A] max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#14532D] to-[#15803D] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#25A238] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#25A238] text-white flex items-center justify-center font-bold rounded-xs shadow-xs">
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white font-bold">Google Drive — Respaldo de Inspección</h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-100/80">SERVILEC ENERGÍA • {TARGET_DRIVE_ACCOUNT}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading || isAuthenticating}
            className="text-white hover:text-emerald-200 font-mono text-sm font-bold cursor-pointer"
          >
            [CERRAR]
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-[#1A1A1A] overflow-y-auto">
          {/* Account Status / Auth Box */}
          <div className="bg-[#F0FDF4] p-4 border border-[#15803D]/40 space-y-2.5 rounded-xs">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#14532D] font-bold block">
                  Cuenta Destino Google Drive:
                </span>
                <strong className="text-sm font-mono text-[#15803D] block">
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
                    disabled={isAuthenticating || isUploading}
                    className="px-3.5 py-1.5 bg-[#15803D] text-white text-[10px] font-mono font-bold hover:bg-[#16A34A] flex items-center gap-1.5 rounded-xs transition-colors cursor-pointer shadow-xs"
                    title="Conectar cuenta de Google con permisos de Drive"
                  >
                    {isAuthenticating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5" />
                    )}
                    Conectar Google Drive
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#14532D]/90 font-sans leading-relaxed pt-1 border-t border-[#15803D]/20">
              <strong>Subida Directa:</strong> Presiona <strong>"Subir a Google Drive"</strong> para respaldar el informe PDF firmado y las {totalPhotosCount} fotos organizadas en carpetas con el formato <em>Cliente_Dirección_Fecha</em>.
            </p>

            {hasToken && user && (
              <div className="flex items-center justify-between text-[10px] text-[#14532D]/80 font-mono pt-1 border-t border-[#15803D]/20">
                <span>Sesión activa: {user.displayName || user.email || TARGET_DRIVE_ACCOUNT}</span>
                <button
                  onClick={handleGoogleLogout}
                  className="text-red-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <LogOut className="w-3 h-3" /> Desconectar
                </button>
              </div>
            )}
          </div>

          {/* Collapsible Manual Token / Domain Info */}
          <div className="border border-slate-200 bg-slate-50/70 p-3 rounded-xs space-y-2">
            <button
              type="button"
              onClick={() => setShowManualToken(!showManualToken)}
              className="flex items-center justify-between w-full text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider hover:text-slate-900 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Key className="w-3 h-3 text-[#15803D]" />
                Opciones avanzadas de conexión / Token
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

                <div className="bg-white p-2.5 border border-slate-200 rounded-xs space-y-1">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">
                    Dominio de la aplicación (para Firebase Console / Google Cloud):
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[11px] font-mono text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-2xs break-all">
                      {currentHostname}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyDomain}
                      className="px-2.5 py-1 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold flex items-center gap-1 rounded-xs cursor-pointer shrink-0"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedDomain ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Box */}
          <div className="bg-[#F7F5F2] p-4 border border-[#1A1A1A] space-y-2 rounded-xs">
            <h4 className="font-serif italic text-sm text-[#1A1A1A] flex items-center gap-1.5 font-bold">
              <FolderCheck className="w-4 h-4 text-[#15803D]" />
              Archivos a Cargar:
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
            <p className="text-[11px] font-mono opacity-80 pt-1.5 border-t border-[#1A1A1A]/20">
              Ruta en Drive: <strong>INSTALACIONES SERVILEC / {buildInspectionBaseFileName(inspection).formattedName}</strong>
            </p>
          </div>

          {/* Upload Progress Display */}
          {progress && (
            <div className="bg-[#F7F5F2] border border-[#1A1A1A] p-4 space-y-2 rounded-xs">
              <div className="flex justify-between items-center text-[#1A1A1A] font-mono text-[11px] font-bold">
                <span>{progress.currentStep}</span>
                <span>{progress.completedFiles}/{progress.totalFiles}</span>
              </div>

              <div className="w-full bg-white border border-[#1A1A1A] h-3 overflow-hidden">
                <div
                  className="bg-[#15803D] h-full transition-all duration-300"
                  style={{
                    width: `${Math.round((progress.completedFiles / (progress.totalFiles || 1)) * 100)}%`,
                  }}
                />
              </div>

              <p className="text-[10px] font-mono text-[#1A1A1A] truncate">
                {progress.currentFileName}
              </p>

              {progress.isComplete && progress.driveFolderUrl && (
                <div className="pt-2">
                  <a
                    href={progress.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#15803D] text-white text-[10px] uppercase font-mono tracking-widest font-bold hover:bg-[#25A238] transition-colors rounded-xs shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir Carpeta en Google Drive ({TARGET_DRIVE_ACCOUNT})
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-300 text-red-900 p-3.5 text-xs font-mono space-y-1.5 rounded-xs">
              <div className="flex items-center gap-1.5 text-red-950 font-bold">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                <span>Error de Conexión:</span>
              </div>
              <p className="font-sans leading-relaxed text-[11.5px]">{errorMessage}</p>
              {errorMessage.includes('unauthorized-domain') && (
                <div className="mt-2 pt-2 border-t border-red-200 text-[11px] font-sans">
                  <strong>Solución recomendada:</strong> Haz clic de nuevo en <strong>"Conectar Google Drive"</strong> para usar el inicio de sesión directo de Google Identity, o presiona <strong>"Subir a Google Drive"</strong> directamente.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-[#1A1A1A] flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isUploading || isAuthenticating}
            className="px-4 py-2.5 border border-[#1A1A1A] bg-white text-[#1A1A1A] text-[10px] uppercase font-mono tracking-widest font-bold hover:bg-[#F7F5F2] transition-colors cursor-pointer rounded-xs"
          >
            Cerrar
          </button>

          <button
            onClick={handleStartDriveUpload}
            disabled={isUploading || isAuthenticating}
            className="px-5 py-2.5 border border-[#14532D] bg-[#15803D] text-white text-[10px] uppercase font-mono tracking-widest font-bold hover:bg-[#25A238] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs rounded-xs"
          >
            {isUploading || isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isAuthenticating ? 'Conectando con Google...' : 'Subiendo a Google Drive...'}</span>
              </>
            ) : (
              <>
                <HardDrive className="w-4 h-4 text-white" />
                <span>Subir a Google Drive ({TARGET_DRIVE_ACCOUNT})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


