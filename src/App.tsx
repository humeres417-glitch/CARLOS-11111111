import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InstallerForm } from './components/InstallerForm';
import { ChecklistCategoryView } from './components/ChecklistCategoryView';
import { DriveSyncModal } from './components/DriveSyncModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { HistoryModal } from './components/HistoryModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { INITIAL_TE4_CATEGORIES } from './data/te4NormativeCategories';
import { Inspection, InstallerInfo, ClientInfo, TechnicalInfo, ItemStatus, PhotoItem, ChecklistCategory } from './types';
import { TARGET_DRIVE_ACCOUNT } from './utils/googleDrive';
import { getApplicableCategories, extractNumericPowerKw } from './utils/powerHelper';
import { Save, CheckCircle, FileText, HardDrive, Shield, AlertTriangle, Smartphone, RotateCcw, PlusCircle, Zap } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'te4_inspection_active_v1';
const LOCAL_STORAGE_LIST_KEY = 'te4_inspections_history_v1';

function migrateTo19SecCategories(existingCategories: any[]): ChecklistCategory[] {
  const fresh: ChecklistCategory[] = JSON.parse(JSON.stringify(INITIAL_TE4_CATEGORIES));
  if (!Array.isArray(existingCategories) || existingCategories.length === 0) {
    return fresh;
  }

  const isSec19 = existingCategories.some(
    (cat) => cat.id === 'cat-sec-01' || (cat.items && cat.items.some((it: any) => it.id === 'item-sec-01'))
  );

  if (isSec19) {
    fresh.forEach((freshCat) => {
      const matchCat = existingCategories.find((c) => c.id === freshCat.id);
      if (matchCat) {
        freshCat.items.forEach((freshItem) => {
          const matchItem = matchCat.items?.find((i: any) => i.id === freshItem.id);
          if (matchItem) {
            freshItem.status = matchItem.status || 'PENDIENTE';
            freshItem.observation = matchItem.observation || '';
            freshItem.photos = matchItem.photos || [];
          }
        });
      }
    });
    return fresh;
  }

  const oldToNewMap: Record<string, string> = {
    'item-604': 'item-sec-01',
    'item-101': 'item-sec-02',
    'item-103': 'item-sec-03',
    'item-102': 'item-sec-04',
    'item-204': 'item-sec-04',
    'item-301': 'item-sec-05',
    'item-302': 'item-sec-05',
    'item-201': 'item-sec-06',
    'item-501': 'item-sec-08',
    'item-104': 'item-sec-08',
    'item-503': 'item-sec-08',
    'item-603': 'item-sec-09',
    'item-202': 'item-sec-10',
    'item-203': 'item-sec-11',
    'item-303': 'item-sec-12',
    'item-502': 'item-sec-12',
  };

  existingCategories.forEach((oldCat) => {
    oldCat.items?.forEach((oldItem: any) => {
      const targetId = oldToNewMap[oldItem.id];
      if (targetId) {
        fresh.forEach((freshCat) => {
          const targetItem = freshCat.items.find((it) => it.id === targetId);
          if (targetItem) {
            if (oldItem.photos && oldItem.photos.length > 0) {
              targetItem.photos = [...targetItem.photos, ...oldItem.photos];
            }
            if (oldItem.status && oldItem.status !== 'PENDIENTE') {
              targetItem.status = oldItem.status;
            }
            if (oldItem.observation) {
              targetItem.observation = targetItem.observation
                ? `${targetItem.observation} | ${oldItem.observation}`
                : oldItem.observation;
            }
          }
        });
      }
    });
  });

  return fresh;
}

export default function App() {
  // Initialize state
  const [inspection, setInspection] = useState<Inspection>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          parsed.categories = migrateTo19SecCategories(parsed.categories || []);
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored inspection:', e);
      }
    }
    return createNewDefaultInspection();
  });

  const [savedInspectionsList, setSavedInspectionsList] = useState<Inspection[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LIST_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored list:', e);
      }
    }
    return [];
  });

  const [driveConnected, setDriveConnected] = useState<boolean>(true);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Check PWA Standalone status and beforeinstallprompt
  useEffect(() => {
    const isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(!!isStandaloneApp);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('El usuario aceptó la instalación de la App');
    }
    setDeferredPrompt(null);
  };

  // Auto-save active inspection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inspection));
    } catch (e) {
      console.warn('No se pudo guardar la inspección en localStorage:', e);
    }
  }, [inspection]);

  // Auto-save history list
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(savedInspectionsList));
    } catch (e) {
      console.warn('No se pudo guardar la lista de inspecciones en localStorage:', e);
    }
  }, [savedInspectionsList]);

  function createNewDefaultInspection(): Inspection {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: 'insp-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      installer: {
        name: '',
        rut: '',
        secClass: 'Clase A',
        secLicenceNumber: '',
        phone: '',
        email: '',
        companyName: 'Servilec Solar SpA',
      },
      client: {
        name: '',
        rut: '',
        address: '',
        comuna: '',
        region: 'Región Metropolitana',
        phone: '',
        email: '',
      },
      technical: {
        systemType: 'On-Grid (Netbilling)',
        installedPowerKwp: '5.5',
        inverterBrandModel: '',
        inverterSerialNumber: '',
        panelsCountAndPower: '10x 550W',
        mpptCount: '2 MPPT',
        stringsCount: '2 Strings',
        panelsPerString: '5 paneles por string (10 total)',
        groundingResistanceOhm: '8.5',
        gpsCoordinates: '',
        inspectionDate: today,
        distributionCompany: 'Enel Distribución Chile',
      },
      categories: JSON.parse(JSON.stringify(INITIAL_TE4_CATEGORIES)),
      generalNotes: 'La instalación fotovoltaica ha sido ejecutada de acuerdo a las especificaciones normativas de los pliegos técnicos RIC de la SEC.',
      status: 'Borrador',
    };
  }

  // Filter visible categories according to inverter / project power
  const visibleCategories = getApplicableCategories(inspection.categories, inspection.technical);
  const currentProjectPowerKw = extractNumericPowerKw(inspection.technical);

  // Count metrics based on visible categories
  let totalItemsCount = 0;
  let completedItemsCount = 0;
  let totalPhotosCount = 0;
  let nonCompliantCount = 0;

  visibleCategories.forEach((cat) => {
    cat.items.forEach((item) => {
      totalItemsCount++;
      if (item.status !== 'PENDIENTE') completedItemsCount++;
      if (item.status === 'NC') nonCompliantCount++;
      totalPhotosCount += item.photos.length;
    });
  });

  // Handlers for updating inspection state
  const handleUpdateInstaller = (data: InstallerInfo) => {
    setInspection((prev) => ({ ...prev, installer: data, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateClient = (data: ClientInfo) => {
    setInspection((prev) => ({ ...prev, client: data, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateTechnical = (data: TechnicalInfo) => {
    setInspection((prev) => ({ ...prev, technical: data, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateItemStatus = (itemId: string, status: ItemStatus) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => (item.id === itemId ? { ...item, status } : item)),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateItemObservation = (itemId: string, observation: string) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => (item.id === itemId ? { ...item, observation } : item)),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddPhotosToItem = (itemId: string, newPhotos: PhotoItem[]) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, photos: [...item.photos, ...newPhotos] } : item
        ),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleRemovePhotoFromItem = (itemId: string, photoId: string) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, photos: item.photos.filter((p) => p.id !== photoId) } : item
        ),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdatePhotoNote = (itemId: string, photoId: string, note: string) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                photos: item.photos.map((p) => (p.id === photoId ? { ...p, note } : p)),
              }
            : item
        ),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveSignature = (dataUrl: string) => {
    setInspection((prev) => ({ ...prev, signatureDataUrl: dataUrl, updatedAt: new Date().toISOString() }));
  };

  const handleClearSignature = () => {
    setInspection((prev) => ({ ...prev, signatureDataUrl: undefined, updatedAt: new Date().toISOString() }));
  };

  const handleManualSave = () => {
    // Save to history array if not already present
    setSavedInspectionsList((prev) => {
      const idx = prev.findIndex((i) => i.id === inspection.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = inspection;
        return copy;
      }
      return [inspection, ...prev];
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleNewInspection = () => {
    handleManualSave();
    const fresh = createNewDefaultInspection();
    setInspection(fresh);
  };

  const handleLoadInspectionFromHistory = (insp: Inspection) => {
    const migrated = {
      ...insp,
      categories: migrateTo19SecCategories(insp.categories || []),
    };
    setInspection(migrated);
  };

  const handleDeleteInspectionFromHistory = (id: string) => {
    setSavedInspectionsList((prev) => prev.filter((i) => i.id !== id));
  };

  // Direct Google Drive Auto-Upload Modal Handler
  const handleConnectDrive = () => {
    setIsDriveModalOpen(true);
  };

  const handleInspectionUploadedToDrive = (folderId: string, folderUrl: string) => {
    setInspection((prev) => ({
      ...prev,
      driveFolderId: folderId,
      driveFolderUrl: folderUrl,
      status: 'Subido a Drive',
    }));
    handleManualSave();
  };

  // Export JSON backup
  const handleExportJsonBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedInspectionsList, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `TE4_Inspecciones_Respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Import JSON backup
  const handleImportJsonBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          const migratedList = imported.map((item) => ({
            ...item,
            categories: migrateTo19SecCategories(item.categories || []),
          }));
          setSavedInspectionsList(migratedList);
          if (migratedList.length > 0) {
            setInspection(migratedList[0]);
          }
          alert('¡Respaldo importado y actualizado al orden SEC!');
        }
      } catch (err) {
        alert('Error al leer archivo de respaldo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] font-sans pb-16">
      {/* Header Bar */}
      <Header
        driveConnected={driveConnected}
        onConnectDrive={handleConnectDrive}
        onOpenPdfPreview={() => setIsPdfModalOpen(true)}
        onOpenDriveSync={() => setIsDriveModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onNewInspection={handleNewInspection}
        onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
        completedItemsCount={completedItemsCount}
        totalItemsCount={totalItemsCount}
        photosCount={totalPhotosCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 space-y-4">
        {/* Save Toast Notification */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-40 bg-[#1A1A1A] text-white font-mono text-xs uppercase tracking-widest font-bold px-4 py-3 border border-[#1A1A1A] flex items-center gap-2 shadow-2xl">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>¡Guardado localmente!</span>
          </div>
        )}

        {/* Warning Banner if Non-Compliant Items exist */}
        {nonCompliantCount > 0 && (
          <div className="bg-red-50 border border-[#1A1A1A] p-4 flex items-center justify-between gap-3 text-red-950">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-900 text-white flex items-center justify-center font-bold shrink-0 border border-[#1A1A1A]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-serif italic font-bold text-red-950">
                  {nonCompliantCount} Ítem(s) No Conforme(s) detectado(s)
                </h4>
                <p className="text-xs font-sans text-red-900/90">
                  Revise los ítems marcados en rojo antes de la tramitación final de la Declaración TE4 ante la SEC.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form 1: Installer and Client Data */}
        <InstallerForm
          installer={inspection.installer}
          client={inspection.client}
          technical={inspection.technical}
          onChangeInstaller={handleUpdateInstaller}
          onChangeClient={handleUpdateClient}
          onChangeTechnical={handleUpdateTechnical}
          onResetForm={handleNewInspection}
        />

        {/* Checklist Categories & Photo Upload Cards */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#15803D] pb-2 gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#25A238]" />
                Checklist de Inspección TE4 SEC
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#14532D] px-2 py-0.5 border border-[#15803D]/30 rounded-2xs">
                  <Zap className="w-3 h-3 text-[#15803D]" />
                  {currentProjectPowerKw < 10
                    ? `Proyecto Residencial (${currentProjectPowerKw} kW < 10 kW): Ítems 1 al 12 aplicables`
                    : currentProjectPowerKw <= 30
                    ? `Proyecto Comercial (${currentProjectPowerKw} kW / 10 a 30 kW): Ítems 1 al 15 aplicables`
                    : `Proyecto Gran Escala (${currentProjectPowerKw} kW > 30 kW): Ítems 1 al 19 aplicables`}
                </span>
                {currentProjectPowerKw < 10 && (
                  <span className="text-[10px] text-slate-500 hidden md:inline">
                    (Ítems de 10kW y 30kW ocultos automáticamente para agilizar la labor en terreno)
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#15803D] font-bold self-start sm:self-center">
              SERVILEC ENERGÍA • RIC SEC
            </span>
          </div>

          <ChecklistCategoryView
            categories={visibleCategories}
            onUpdateStatus={handleUpdateItemStatus}
            onUpdateObservation={handleUpdateItemObservation}
            onAddPhotos={handleAddPhotosToItem}
            onRemovePhoto={handleRemovePhotoFromItem}
            onUpdatePhotoNote={handleUpdatePhotoNote}
          />
        </div>

        {/* Section 3: General Notes */}
        <div className="bg-white p-3.5 border-l-4 border-l-[#15803D] border border-[#15803D]/30 space-y-1.5 shadow-2xs">
          <label className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#14532D] block">
            Observaciones Generales de la Inspección TE4
          </label>
          <textarea
            id="input-general-notes"
            rows={3}
            value={inspection.generalNotes}
            onChange={(e) =>
              setInspection((prev) => ({
                ...prev,
                generalNotes: e.target.value,
                updatedAt: new Date().toISOString(),
              }))
            }
            placeholder="Escriba comentarios o recomendaciones adicionales para el cliente..."
            className="w-full p-2.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
          />
        </div>

        {/* Bottom Floating Quick Actions Bar */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#14532D] to-[#15803D] text-white p-3 sm:p-4 border-t-2 border-t-[#25A238] border border-[#15803D] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#25A238] text-white font-serif font-bold italic flex items-center justify-center text-base rounded-xs shadow-xs border border-white/30">
              TE4
            </div>
            <div>
              <h3 className="text-sm font-serif italic text-white font-bold">
                {inspection.client.name ? `Inspección: ${inspection.client.name}` : 'Borrador de Inspección Activo'}
              </h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-100/90 font-medium">
                {completedItemsCount} de {totalItemsCount} evaluados • {totalPhotosCount} fotos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              id="btn-bottom-new"
              onClick={handleNewInspection}
              className="px-3.5 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-[#BE123C] text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Limpiar planilla y comenzar un nuevo proceso"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>Limpiar / Nuevo</span>
            </button>

            <button
              id="btn-bottom-save"
              onClick={handleManualSave}
              className="px-3.5 py-2 border border-white/40 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#25A238]" />
              <span>Guardar Borrador</span>
            </button>

            <button
              id="btn-bottom-drive"
              onClick={() => setIsDriveModalOpen(true)}
              className="px-3.5 py-2 border border-[#25A238] bg-[#15803D] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#16A34A] transition-colors cursor-pointer shadow-xs"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#DCFCE7]" />
              <span>Subir a Drive</span>
            </button>

            <button
              id="btn-bottom-android"
              onClick={() => setIsAndroidModalOpen(true)}
              className="px-3.5 py-2 border border-[#25A238] bg-[#14532D] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#15803D] transition-colors cursor-pointer shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#25A238]" />
              <span>Instalar App Android</span>
            </button>

            <button
              id="btn-bottom-pdf"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-4 py-2 border border-white bg-white text-[#14532D] text-[10px] uppercase font-mono tracking-widest font-extrabold flex items-center gap-1.5 hover:bg-[#F0FDF4] transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Ver Reporte PDF</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <DriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        inspection={inspection}
        onInspectionUploaded={handleInspectionUploadedToDrive}
        onTokenCleared={() => setDriveConnected(false)}
      />

      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        inspection={inspection}
        onOpenDriveSync={() => setIsDriveModalOpen(true)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedInspections={savedInspectionsList}
        currentInspectionId={inspection.id}
        onLoadInspection={handleLoadInspectionFromHistory}
        onDeleteInspection={handleDeleteInspectionFromHistory}
        onNewInspection={handleNewInspection}
        onExportJsonBackup={handleExportJsonBackup}
        onImportJsonBackup={handleImportJsonBackup}
      />

      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleTriggerPwaInstall}
        isStandalone={isStandalone}
      />
    </div>
  );
}
