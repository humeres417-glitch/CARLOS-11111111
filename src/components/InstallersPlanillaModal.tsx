import React, { useState } from 'react';
import { InstallerInfo, SecClass } from '../types';
import { ShieldCheck, Plus, X, Check, Edit2, Trash2, RotateCcw, Search, UserCheck, Phone, Mail, Building, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { DEFAULT_INSTALLERS_REGISTRY } from '../data/defaultInstallers';

interface InstallersPlanillaModalProps {
  isOpen: boolean;
  onClose: () => void;
  installers: InstallerInfo[];
  onSaveInstallers: (installers: InstallerInfo[]) => void;
  onSelectInstaller: (installer: InstallerInfo) => void;
  currentSelectedName?: string;
}

export const InstallersPlanillaModal: React.FC<InstallersPlanillaModalProps> = ({
  isOpen,
  onClose,
  installers,
  onSaveInstallers,
  onSelectInstaller,
  currentSelectedName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form state for adding/editing an installer
  const [formData, setFormData] = useState<InstallerInfo>({
    name: '',
    rut: '',
    secClass: 'Clase A',
    secLicenceNumber: '',
    phone: '',
    email: '',
    companyName: 'SERVILEC ENERGÍA SpA',
  });

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleStartAdd = () => {
    setFormData({
      name: '',
      rut: '',
      secClass: 'Clase A',
      secLicenceNumber: '',
      phone: '+56 9 ',
      email: '',
      companyName: 'SERVILEC ENERGÍA SpA',
    });
    setEditingIndex(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (index: number) => {
    setFormData({ ...installers[index] });
    setEditingIndex(index);
    setIsAddingNew(false);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim().toUpperCase();

    if (!cleanName) {
      alert('Por favor ingrese el nombre del instalador.');
      return;
    }

    const updatedInstaller: InstallerInfo = {
      ...formData,
      name: cleanName,
      rut: formData.rut.trim().toUpperCase(),
      secLicenceNumber: formData.secLicenceNumber.trim().toUpperCase(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      companyName: formData.companyName.trim() || 'SERVILEC ENERGÍA SpA',
    };

    let updatedList: InstallerInfo[];

    if (isAddingNew) {
      // Check if already exists by name
      const existingIdx = installers.findIndex((i) => i.name.toUpperCase() === cleanName);
      if (existingIdx !== -1) {
        if (!confirm(`El instalador "${cleanName}" ya existe en la planilla. ¿Desea sobrescribir sus datos?`)) {
          return;
        }
        updatedList = [...installers];
        updatedList[existingIdx] = updatedInstaller;
      } else {
        updatedList = [...installers, updatedInstaller];
      }
      showFeedback(`Instalador ${cleanName} agregado exitosamente a la planilla`);
    } else if (editingIndex !== null) {
      updatedList = [...installers];
      updatedList[editingIndex] = updatedInstaller;
      showFeedback(`Instalador ${cleanName} actualizado correctamente`);
    } else {
      return;
    }

    onSaveInstallers(updatedList);
    setIsAddingNew(false);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const target = installers[index];
    if (confirm(`¿Está seguro de eliminar a "${target.name}" de la planilla de instaladores?`)) {
      const updatedList = installers.filter((_, i) => i !== index);
      onSaveInstallers(updatedList);
      showFeedback(`Instalador ${target.name} eliminado de la planilla`);
    }
  };

  const handleRestoreDefaults = () => {
    if (confirm('¿Restablecer la planilla a los instaladores predeterminados de SERVILEC ENERGÍA? Se reemplazarán los cambios actuales.')) {
      onSaveInstallers(DEFAULT_INSTALLERS_REGISTRY);
      showFeedback('Planilla restablecida a valores iniciales');
    }
  };

  const handleSelectAndClose = (inst: InstallerInfo) => {
    onSelectInstaller(inst);
    showFeedback(`Datos de ${inst.name} cargados en el formulario`);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const filteredInstallers = installers.filter((inst) => {
    const query = searchTerm.toLowerCase();
    return (
      inst.name.toLowerCase().includes(query) ||
      inst.rut.toLowerCase().includes(query) ||
      inst.secLicenceNumber.toLowerCase().includes(query) ||
      inst.secClass.toLowerCase().includes(query) ||
      (inst.email && inst.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border-2 border-[#15803D] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl rounded-xs overflow-hidden">
        {/* Header */}
        <div className="bg-[#15803D] text-white p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xs">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif italic font-bold flex items-center gap-2">
                Planilla de Instaladores Certificados SEC
              </h3>
              <p className="text-[11px] text-[#DCFCE7] opacity-90">
                Seleccione un instalador para auto-completar sus datos o edite la planilla para futuros proyectos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xs hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar planilla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="bg-[#DCFCE7] border-b border-[#15803D]/30 px-4 py-2 text-xs font-bold text-[#14532D] flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="p-3 bg-[#F8FAF9] border-b border-[#15803D]/20 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar instalador por nombre, RUT, licencia..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#15803D]/30 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D] rounded-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 rounded-2xs cursor-pointer transition-colors"
              title="Restablecer lista predeterminada"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Restablecer Predeterminados</span>
            </button>
            <button
              type="button"
              onClick={handleStartAdd}
              className="px-3 py-1.5 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 rounded-2xs cursor-pointer shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Instalador</span>
            </button>
          </div>
        </div>

        {/* Form to Add / Edit Inline */}
        {(isAddingNew || editingIndex !== null) && (
          <form onSubmit={handleSaveForm} className="bg-[#ECFDF5] p-3.5 border-b-2 border-[#15803D] space-y-3">
            <div className="flex items-center justify-between border-b border-[#15803D]/30 pb-1.5">
              <h4 className="text-xs font-serif italic text-[#14532D] font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                {isAddingNew ? 'Registrar Nuevo Instalador en la Planilla' : `Editar Datos de: ${formData.name}`}
              </h4>
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-[#14532D] mb-0.5">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. FELIPE VERAGUA"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-[#14532D] mb-0.5">
                  RUT *
                </label>
                <input
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  placeholder="Ej. 17.849.201-K"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-[#14532D] mb-0.5">
                  N° Licencia SEC *
                </label>
                <input
                  type="text"
                  required
                  value={formData.secLicenceNumber}
                  onChange={(e) => setFormData({ ...formData, secLicenceNumber: e.target.value })}
                  placeholder="Ej. SEC-84729"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-[#14532D] mb-0.5">
                  Clase de Licencia SEC *
                </label>
                <select
                  value={formData.secClass}
                  onChange={(e) => setFormData({ ...formData, secClass: e.target.value as SecClass })}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D] font-bold cursor-pointer"
                >
                  <option value="Clase A">Clase A (Sin límite)</option>
                  <option value="Clase B">Clase B (Hasta 500 kW)</option>
                  <option value="Clase C">Clase C (Hasta 100 kW)</option>
                  <option value="Clase D">Clase D (Hasta 10 kW)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-[#14532D] mb-0.5">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+56 9 1234 5678"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-[#14532D] mb-0.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@servilec.cl"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase tracking-wider font-bold text-[#14532D] mb-0.5">
                  Empresa Instaladora
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="SERVILEC ENERGÍA SpA"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#15803D]/30">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-3 py-1 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-2xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold flex items-center gap-1 rounded-2xs cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isAddingNew ? 'Guardar en Planilla' : 'Actualizar Registro'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Spreadsheet Table View */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 bg-slate-50">
          <div className="bg-white border border-[#15803D]/30 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#15803D]/10 border-b border-[#15803D]/30 text-[#14532D]">
                  <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">Instalador</th>
                  <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">RUT</th>
                  <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">Licencia SEC</th>
                  <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">Clase</th>
                  <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInstallers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                      No se encontraron instaladores que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredInstallers.map((inst, idx) => {
                    const isCurrent = currentSelectedName?.trim().toUpperCase() === inst.name.trim().toUpperCase();
                    return (
                      <tr
                        key={inst.name + idx}
                        className={`hover:bg-[#F0FDF4] transition-colors ${isCurrent ? 'bg-[#DCFCE7]/50 font-semibold' : ''}`}
                      >
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0F172A]">{inst.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-[#15803D] text-white px-1.5 py-0.2 rounded-2xs font-bold uppercase">
                                En Uso
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">{inst.companyName || 'SERVILEC ENERGÍA SpA'}</div>
                        </td>
                        <td className="p-2.5 font-mono text-slate-700">{inst.rut || '-'}</td>
                        <td className="p-2.5 font-mono font-bold text-[#15803D]">{inst.secLicenceNumber || '-'}</td>
                        <td className="p-2.5">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-2xs border ${
                              inst.secClass === 'Clase A'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : inst.secClass === 'Clase B'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : inst.secClass === 'Clase C'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            {inst.secClass}
                          </span>
                        </td>
                        <td className="p-2.5 hidden md:table-cell text-[11px] text-slate-600">
                          <div>{inst.phone || '-'}</div>
                          <div className="text-slate-400 text-[10px]">{inst.email || '-'}</div>
                        </td>
                        <td className="p-2.5 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleSelectAndClose(inst)}
                            className="px-2.5 py-1 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold rounded-2xs cursor-pointer shadow-2xs inline-flex items-center gap-1 transition-colors"
                            title="Cargar todos los datos de este instalador al formulario de inspección"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Cargar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(installers.indexOf(inst))}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-2xs cursor-pointer transition-colors inline-block"
                            title="Editar datos en planilla"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {installers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDelete(installers.indexOf(inst))}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-2xs cursor-pointer transition-colors inline-block"
                              title="Eliminar de planilla"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Total Instaladores Registrados: <strong>{installers.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-2xs cursor-pointer transition-colors"
          >
            Cerrar Planilla
          </button>
        </div>
      </div>
    </div>
  );
};
