import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle,
  Sun,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Check,
  Battery,
  HardDrive
} from 'lucide-react';
import {
  PvModuleElectricalSpecs,
  getAllPvModulesList,
  getAllPvBrandsList,
  saveOrUpdatePvModule,
  deleteCustomPvModule,
  getCustomPvCatalog,
  saveCustomPvCatalog,
  KNOWN_PV_MODULES_CATALOG
} from '../data/pvModuleCatalog';

interface EquipmentCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModuleForProject?: (module: PvModuleElectricalSpecs) => void;
  initialBrand?: string;
  initialModel?: string;
}

export const EquipmentCatalogModal: React.FC<EquipmentCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectModuleForProject,
  initialBrand,
  initialModel,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'new_module' | 'backup'>('catalog');
  const [modulesList, setModulesList] = useState<PvModuleElectricalSpecs[]>([]);
  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for creating / editing module
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formBrand, setFormBrand] = useState<string>('');
  const [customBrandInput, setCustomBrandInput] = useState<string>('');
  const [formModel, setFormModel] = useState<string>('');
  const [formWatts, setFormWatts] = useState<string>('550');
  const [formVmp, setFormVmp] = useState<string>('41.90');
  const [formImp, setFormImp] = useState<string>('13.12');
  const [formVoc, setFormVoc] = useState<string>('49.80');
  const [formIsc, setFormIsc] = useState<string>('13.98');
  const [formTechnology, setFormTechnology] = useState<string>('N-Type TOPCon');
  const [formTempCoeff, setFormTempCoeff] = useState<string>('-0.30');
  const [formEfficiency, setFormEfficiency] = useState<string>('22.0');
  const [formDimensions, setFormDimensions] = useState<string>('2278 x 1134 x 30 mm');
  const [formNotes, setFormNotes] = useState<string>('');

  const refreshCatalog = () => {
    const list = getAllPvModulesList();
    setModulesList(list);
    const brands = getAllPvBrandsList();
    setBrandsList(brands);
  };

  useEffect(() => {
    if (isOpen) {
      refreshCatalog();
      if (initialBrand) {
        setSelectedBrandFilter(initialBrand);
      }
    }
  }, [isOpen, initialBrand]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartNewModule = (cloneFrom?: PvModuleElectricalSpecs) => {
    if (cloneFrom) {
      setEditingId(cloneFrom.isCustom ? (cloneFrom.id || `${cloneFrom.brand}-${cloneFrom.model}`) : null);
      setFormBrand(cloneFrom.brand);
      setCustomBrandInput('');
      setFormModel(cloneFrom.isCustom ? cloneFrom.model : `${cloneFrom.model} (Personalizado)`);
      setFormWatts(String(cloneFrom.pMaxWatts));
      setFormVmp(String(cloneFrom.vmp));
      setFormImp(String(cloneFrom.imp));
      setFormVoc(String(cloneFrom.voc));
      setFormIsc(String(cloneFrom.isc));
      setFormTechnology(cloneFrom.technology || 'Mono PERC');
      setFormTempCoeff(String(cloneFrom.tempCoeffPmax || -0.30));
      setFormEfficiency(String(cloneFrom.efficiency || 21.5));
      setFormDimensions(cloneFrom.dimensions || '');
      setFormNotes(cloneFrom.notes || '');
    } else {
      setEditingId(null);
      setFormBrand(initialBrand || 'Jinko Solar');
      setCustomBrandInput('');
      setFormModel('');
      setFormWatts('585');
      setFormVmp('42.61');
      setFormImp('13.73');
      setFormVoc('51.10');
      setFormIsc('14.47');
      setFormTechnology('N-Type TOPCon');
      setFormTempCoeff('-0.30');
      setFormEfficiency('22.6');
      setFormDimensions('2278 x 1134 x 35 mm');
      setFormNotes('');
    }
    setActiveTab('new_module');
  };

  // Auto calculate typical values based on Watts and Technology
  const handleAutoEstimateSpecs = () => {
    const w = parseFloat(formWatts) || 550;
    let estVmp = 41.9;
    let tech = formTechnology || 'N-Type TOPCon';

    if (w <= 430) {
      estVmp = 31.8;
    } else if (w <= 570) {
      estVmp = 41.9;
    } else if (w <= 610) {
      estVmp = 43.0;
    } else if (w <= 645) {
      estVmp = 46.5;
    } else {
      estVmp = 38.5;
    }

    const estImp = Math.round((w / estVmp) * 100) / 100;
    const estVoc = Math.round(estVmp * 1.19 * 100) / 100;
    const estIsc = Math.round(estImp * 1.06 * 100) / 100;
    const estEff = Math.round((w / 25.8) * 10) / 10;

    setFormVmp(String(estVmp));
    setFormImp(String(estImp));
    setFormVoc(String(estVoc));
    setFormIsc(String(estIsc));
    setFormEfficiency(String(estEff));
    showToast('Valores eléctricos estimados automáticamente según potencia.');
  };

  const handleSaveModule = (andSelect: boolean = false) => {
    const finalBrand = (formBrand === 'OTRA_NUEVA' ? customBrandInput : formBrand).trim();
    const finalModel = formModel.trim();

    if (!finalBrand) {
      alert('Por favor ingrese la Marca del panel.');
      return;
    }
    if (!finalModel) {
      alert('Por favor ingrese el Modelo del panel.');
      return;
    }

    const pWatts = parseFloat(formWatts) || 550;
    const vmpVal = parseFloat(formVmp) || 41.9;
    const impVal = parseFloat(formImp) || 13.12;
    const vocVal = parseFloat(formVoc) || (vmpVal * 1.19);
    const iscVal = parseFloat(formIsc) || (impVal * 1.06);

    const newModuleSpecs: PvModuleElectricalSpecs = {
      id: editingId || `custom-${Date.now()}`,
      brand: finalBrand,
      model: finalModel,
      pMaxWatts: pWatts,
      vmp: vmpVal,
      imp: impVal,
      voc: vocVal,
      isc: iscVal,
      technology: formTechnology,
      tempCoeffPmax: parseFloat(formTempCoeff) || -0.30,
      efficiency: parseFloat(formEfficiency) || 21.5,
      dimensions: formDimensions.trim(),
      notes: formNotes.trim(),
      isCustom: true,
      secApproved: true
    };

    saveOrUpdatePvModule(newModuleSpecs);
    refreshCatalog();
    showToast(`Ficha técnica "${finalBrand} - ${finalModel}" guardada exitosamente.`);

    if (andSelect && onSelectModuleForProject) {
      onSelectModuleForProject(newModuleSpecs);
      onClose();
    } else {
      setActiveTab('catalog');
    }
  };

  const handleDeleteModule = (mod: PvModuleElectricalSpecs) => {
    if (confirm(`¿Está seguro de eliminar la ficha técnica "${mod.brand} - ${mod.model}"?`)) {
      deleteCustomPvModule(mod.brand, mod.model);
      refreshCatalog();
      showToast(`Módulo "${mod.model}" eliminado del catálogo.`);
    }
  };

  const handleSelectModule = (mod: PvModuleElectricalSpecs) => {
    if (onSelectModuleForProject) {
      onSelectModuleForProject(mod);
      showToast(`Módulo "${mod.brand} - ${mod.model}" seleccionado para la instalación.`);
      onClose();
    }
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const custom = getCustomPvCatalog();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(custom, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `catalogo_paneles_te4_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Archivo JSON de catálogo exportado.');
  };

  // Import JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object' && parsed !== null) {
          const current = getCustomPvCatalog();
          const merged = { ...current, ...parsed };
          saveCustomPvCatalog(merged);
          refreshCatalog();
          showToast('Catálogo importado y combinado exitosamente.');
        } else {
          alert('El archivo no tiene el formato JSON esperado.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON: ' + err);
      }
    };
    reader.readAsText(file);
  };

  // Filter modules
  const filteredModules = modulesList.filter(mod => {
    const matchesBrand = selectedBrandFilter === 'ALL' || mod.brand.toLowerCase() === selectedBrandFilter.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      mod.brand.toLowerCase().includes(query) ||
      mod.model.toLowerCase().includes(query) ||
      (mod.technology && mod.technology.toLowerCase().includes(query)) ||
      String(mod.pMaxWatts).includes(query);
    return matchesBrand && matchesQuery;
  });

  const customCount = modulesList.filter(m => m.isCustom).length;
  const standardCount = modulesList.length - customCount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#15803D] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl rounded-xs overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#15803D] text-white px-4 py-3 flex items-center justify-between border-b border-[#14532D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-white leading-tight flex items-center gap-2">
                Gestor de Equipos & Fichas Técnicas
                <span className="text-[10px] bg-[#DCFCE7] text-[#14532D] font-mono px-2 py-0.5 rounded-xs font-bold uppercase tracking-wider">
                  Módulos & Strings SEC
                </span>
              </h2>
              <p className="text-[11px] text-emerald-100/90 font-mono">
                Catálogo certificado, parámetros eléctricos STC y administración de equipos personalizados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1 bg-slate-50 border-b border-slate-200 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider rounded-t-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'catalog'
                  ? 'border-[#15803D] text-[#14532D] bg-white border-t border-x border-slate-200 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Catálogo Módulos ({modulesList.length})</span>
            </button>

            <button
              onClick={() => handleStartNewModule()}
              className={`px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider rounded-t-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'new_module'
                  ? 'border-[#15803D] text-[#14532D] bg-white border-t border-x border-slate-200 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#15803D]" />
              <span>{editingId ? 'Editar Ficha Técnica' : '+ Nueva Ficha Técnica'}</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider rounded-t-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'backup'
                  ? 'border-[#15803D] text-[#14532D] bg-white border-t border-x border-slate-200 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-slate-600" />
              <span>Respaldar / Importar</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <span className="bg-emerald-50 text-[#15803D] px-2 py-0.5 border border-emerald-200 rounded-2xs font-semibold">
              {standardCount} SEC Base
            </span>
            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 border border-amber-200 rounded-2xs font-semibold">
              {customCount} Personalizados
            </span>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-[#14532D] text-white px-4 py-2 text-xs font-mono flex items-center justify-between shadow-inner animate-in slide-in-from-top duration-150">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#25A238]" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-white/70 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-[#F8FAF9] space-y-4">
          
          {/* TAB 1: CATALOG LIST */}
          {activeTab === 'catalog' && (
            <div className="space-y-3">
              {/* Search and Brand Filter Controls */}
              <div className="bg-white p-2.5 border border-[#15803D]/25 rounded-xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  {/* Search Input */}
                  <div className="sm:col-span-7 relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por marca, modelo, potencia en W, tecnología..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Brand Selector */}
                  <div className="sm:col-span-5 flex items-center gap-1.5">
                    <select
                      value={selectedBrandFilter}
                      onChange={(e) => setSelectedBrandFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs cursor-pointer font-mono"
                    >
                      <option value="ALL">Todas las Marcas ({modulesList.length})</option>
                      {brandsList.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleStartNewModule()}
                      className="px-2.5 py-1.5 bg-[#15803D] hover:bg-[#16A34A] text-white text-xs font-bold rounded-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                      title="Agregar un nuevo equipo con sus datos de ficha técnica"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Nuevo</span>
                    </button>
                  </div>
                </div>

                {/* Quick Brand Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-1 text-[10.5px]">
                  <button
                    onClick={() => setSelectedBrandFilter('ALL')}
                    className={`px-2 py-0.5 rounded-full font-mono cursor-pointer transition-colors shrink-0 ${
                      selectedBrandFilter === 'ALL'
                        ? 'bg-[#15803D] text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  {['Jinko Solar', 'Canadian Solar', 'LONGi Solar', 'Trina Solar', 'JA Solar', 'Risen Energy', 'Astronergy (Chint)', 'DAH Solar'].map(b => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrandFilter(b)}
                      className={`px-2 py-0.5 rounded-full font-mono cursor-pointer transition-colors shrink-0 ${
                        selectedBrandFilter === b
                          ? 'bg-[#15803D] text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modules Grid */}
              {filteredModules.length === 0 ? (
                <div className="bg-white p-8 border border-dashed border-slate-300 rounded-xs text-center space-y-2">
                  <Sun className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600">No se encontraron fichas técnicas que coincidan con la búsqueda.</p>
                  <button
                    onClick={() => handleStartNewModule()}
                    className="px-3 py-1.5 bg-[#15803D] text-white text-xs font-bold rounded-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear esta Ficha Técnica Manualmente</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredModules.map((mod) => {
                    const isSelected = initialBrand === mod.brand && (initialModel === mod.model || initialModel?.includes(mod.model));
                    return (
                      <div
                        key={`${mod.brand}-${mod.model}`}
                        className={`bg-white p-3 border rounded-xs flex flex-col justify-between space-y-2.5 transition-all shadow-2xs ${
                          isSelected
                            ? 'border-[#15803D] ring-2 ring-[#15803D]/25 bg-emerald-50/20'
                            : 'border-slate-200 hover:border-[#15803D]/60 hover:shadow-xs'
                        }`}
                      >
                        <div>
                          {/* Card Header: Brand & Model */}
                          <div className="flex items-start justify-between gap-1.5 mb-1.5">
                            <div>
                              <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block font-mono">
                                {mod.brand}
                              </span>
                              <h3 className="text-xs font-bold text-[#0F172A] leading-tight">
                                {mod.model}
                              </h3>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <span className="text-xs font-mono font-extrabold text-[#14532D] bg-[#DCFCE7] px-2 py-0.5 rounded-xs border border-[#15803D]/30">
                                {mod.pMaxWatts} Wp
                              </span>
                              {mod.isCustom ? (
                                <span className="text-[8.5px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-2xs border border-amber-300 font-semibold">
                                  Personalizado
                                </span>
                              ) : (
                                <span className="text-[8.5px] font-mono bg-emerald-50 text-[#15803D] px-1.5 py-0.2 rounded-2xs border border-emerald-200 font-semibold">
                                  SEC Oficial
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Electrical Parameters Table */}
                          <div className="bg-[#F8FAF9] p-2 border border-slate-200 rounded-2xs space-y-1.5 text-[10px] font-mono">
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
                                <span className="text-slate-500">Vmp (Tensión máx):</span>
                                <strong className="text-[#0F172A] font-bold">{mod.vmp.toFixed(2)} V</strong>
                              </div>
                              <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
                                <span className="text-slate-500">Imp (Corriente máx):</span>
                                <strong className="text-[#0F172A] font-bold">{mod.imp.toFixed(2)} A</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Voc (Circuito abierto):</span>
                                <strong className="text-[#0F172A] font-bold">{mod.voc.toFixed(2)} V</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Isc (Cortocircuito):</span>
                                <strong className="text-[#0F172A] font-bold">{mod.isc.toFixed(2)} A</strong>
                              </div>
                            </div>

                            <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-600">
                              <span className="truncate max-w-[150px]" title={mod.technology}>
                                🏷️ {mod.technology || 'Monocristalino'}
                              </span>
                              <span>
                                {mod.tempCoeffPmax ? `γ: ${mod.tempCoeffPmax}%/°C` : ''} {mod.efficiency ? `• η: ${mod.efficiency}%` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartNewModule(mod)}
                              className="px-2 py-1 text-[10px] text-slate-700 bg-slate-100 hover:bg-slate-200 font-mono rounded-2xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Editar o clonar esta ficha técnica"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                              <span>{mod.isCustom ? 'Editar' : 'Clonar'}</span>
                            </button>
                            {mod.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteModule(mod)}
                                className="px-1.5 py-1 text-[10px] text-rose-700 bg-rose-50 hover:bg-rose-100 font-mono rounded-2xs flex items-center gap-0.5 transition-colors cursor-pointer"
                                title="Eliminar este módulo personalizado"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" />
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectModule(mod)}
                            className="px-3 py-1 text-[10.5px] font-bold font-mono uppercase tracking-wider bg-[#15803D] hover:bg-[#16A34A] text-white rounded-2xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Seleccionar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE / EDIT MODULE */}
          {activeTab === 'new_module' && (
            <div className="bg-white p-4 sm:p-5 border border-[#15803D]/30 rounded-xs space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#15803D]/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Sun className="w-4 h-4 text-[#15803D]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#14532D]">
                      {editingId ? 'Editar Ficha Técnica de Módulo' : 'Ingresar Nueva Ficha Técnica de Módulo'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Ingrese los parámetros STC indicados en la placa de características o ficha técnica del fabricante
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoEstimateSpecs}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10.5px] font-mono font-bold rounded-2xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Calcula automáticamente Vmp, Imp, Voc, Isc aproximados según la potencia"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Estimar Eléctricos</span>
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Marca */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Marca del Panel *
                  </label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  >
                    <option value="">Seleccione marca...</option>
                    {brandsList.filter(b => b !== 'Otra Marca (Certificada SEC)').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="OTRA_NUEVA">+ Escribir Nueva Marca Personalizada...</option>
                  </select>

                  {formBrand === 'OTRA_NUEVA' && (
                    <input
                      type="text"
                      value={customBrandInput}
                      onChange={(e) => setCustomBrandInput(e.target.value)}
                      placeholder="Escriba el nombre de la nueva marca..."
                      className="w-full mt-1.5 px-2.5 py-1.5 bg-white border border-[#15803D] text-xs text-[#0F172A] focus:outline-none rounded-xs font-mono"
                      autoFocus
                    />
                  )}
                </div>

                {/* Modelo */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Modelo Exacto del Panel *
                  </label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="Ej. Tiger Neo JKM585N-72HL4-V o CS6W-550MS"
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono font-semibold"
                  />
                </div>

                {/* Potencia Nominal Pmax */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-[#14532D] mb-1">
                    Potencia Máxima Pmax (Watts) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="1000"
                    value={formWatts}
                    onChange={(e) => setFormWatts(e.target.value)}
                    placeholder="Ej. 585"
                    className="w-full px-2.5 py-1.5 bg-[#ECFDF5] border border-[#15803D]/40 text-xs font-bold text-[#14532D] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  />
                </div>

                {/* Tensión a Máxima Potencia Vmp */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Tensión Máx. Potencia Vmp (Volts) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    max="100"
                    value={formVmp}
                    onChange={(e) => setFormVmp(e.target.value)}
                    placeholder="Ej. 42.61"
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  />
                </div>

                {/* Corriente a Máxima Potencia Imp */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Corriente Máx. Potencia Imp (Amperes) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="30"
                    value={formImp}
                    onChange={(e) => setFormImp(e.target.value)}
                    placeholder="Ej. 13.73"
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  />
                </div>

                {/* Tensión de Circuito Abierto Voc */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Tensión Circuito Abierto Voc (Volts) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="15"
                    max="120"
                    value={formVoc}
                    onChange={(e) => setFormVoc(e.target.value)}
                    placeholder="Ej. 51.10"
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  />
                </div>

                {/* Corriente de Cortocircuito Isc */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Corriente Cortocircuito Isc (Amperes) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="35"
                    value={formIsc}
                    onChange={(e) => setFormIsc(e.target.value)}
                    placeholder="Ej. 14.47"
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  />
                </div>

                {/* Tecnología de Celda */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Tecnología de Celda
                  </label>
                  <select
                    value={formTechnology}
                    onChange={(e) => setFormTechnology(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  >
                    <option value="N-Type TOPCon">N-Type TOPCon</option>
                    <option value="Mono PERC">Mono PERC (Half-Cell)</option>
                    <option value="Heterounión HJT">Heterounión HJT</option>
                    <option value="Bifacial Doble Vidrio">Bifacial Doble Vidrio</option>
                    <option value="HPBC / Back Contact">HPBC / Back Contact</option>
                    <option value="Shingled Monocristalino">Shingled Monocristalino</option>
                    <option value="Policristalino">Policristalino</option>
                  </select>
                </div>

                {/* Coeficiente de Temperatura TempCoeff */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Coeficiente Temp γ (%/°C)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max="0"
                    min="-1"
                    value={formTempCoeff}
                    onChange={(e) => setFormTempCoeff(e.target.value)}
                    placeholder="Ej. -0.30"
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  />
                </div>

                {/* Eficiencia */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Eficiencia Módulo (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="30"
                    value={formEfficiency}
                    onChange={(e) => setFormEfficiency(e.target.value)}
                    placeholder="Ej. 22.6"
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  />
                </div>

                {/* Dimensiones */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 mb-1">
                    Dimensiones / Peso (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formDimensions}
                    onChange={(e) => setFormDimensions(e.target.value)}
                    placeholder="Ej. 2278 x 1134 x 35 mm (28 kg)"
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-slate-300 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none rounded-xs font-mono"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="bg-[#ECFDF5] p-3 border border-[#15803D]/30 rounded-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#14532D] flex items-center gap-1 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-[#15803D]" />
                  Resumen de la Ficha Técnica Ingresada
                </span>
                <div className="text-xs font-mono text-[#14532D] flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span><strong>Equipo:</strong> {(formBrand === 'OTRA_NUEVA' ? customBrandInput : formBrand) || 'Marca'} - {formModel || 'Modelo'}</span>
                  <span><strong>Potencia:</strong> {formWatts || 0} Wp</span>
                  <span><strong>Vmp:</strong> {formVmp || 0} V</span>
                  <span><strong>Imp:</strong> {formImp || 0} A</span>
                  <span><strong>Voc:</strong> {formVoc || 0} V</span>
                  <span><strong>Isc:</strong> {formIsc || 0} A</span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold font-mono uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveModule(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <span>Guardar en Mi Catálogo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveModule(true)}
                  className="px-4 py-2 bg-[#15803D] hover:bg-[#16A34A] text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar & Seleccionar en Proyecto</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP / RESTORE */}
          {activeTab === 'backup' && (
            <div className="bg-white p-4 sm:p-6 border border-slate-200 rounded-xs space-y-5">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#15803D]" />
                  Copia de Seguridad & Restauración del Catálogo
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Exporte o importe sus fichas técnicas personalizadas en formato JSON para transferirlas a otros dispositivos
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="bg-[#F8FAF9] p-4 border border-slate-200 rounded-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
                    <Download className="w-4 h-4 text-[#15803D]" />
                    Exportar Catálogo Personalizado
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Descargue un archivo <code>.json</code> con todas las fichas técnicas ingresadas por usted en este navegador.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full py-2 bg-[#15803D] hover:bg-[#16A34A] text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Backup JSON</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-[#F8FAF9] p-4 border border-slate-200 rounded-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
                    <Upload className="w-4 h-4 text-[#15803D]" />
                    Importar Fichas Técnicas
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Seleccione un archivo JSON de respaldo para agregar o actualizar fichas técnicas en su base de datos local.
                  </p>
                  <label className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Seleccionar Archivo JSON</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            <span>Pliegos Técnicos SEC • STC 1000 W/m², 25°C, AM 1.5</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold font-mono uppercase tracking-wider rounded-xs cursor-pointer shadow-2xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
