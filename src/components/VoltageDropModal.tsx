import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Sun,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ArrowRight,
  TrendingDown,
  Info,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  Thermometer,
  ShieldCheck,
} from 'lucide-react';
import { TechnicalInfo } from '../types';
import {
  calculateDcVoltageDrop,
  calculateAcVoltageDrop,
  STANDARD_DC_SECTIONS,
  STANDARD_AC_SECTIONS,
  DcCalculationInput,
  AcCalculationInput,
  getResistivityAtTemp,
} from '../utils/voltageDropCalculator';

interface VoltageDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicalInfo?: TechnicalInfo;
  onApplyToInspectionNotes?: (summaryText: string) => void;
}

export const VoltageDropModal: React.FC<VoltageDropModalProps> = ({
  isOpen,
  onClose,
  technicalInfo,
  onApplyToInspectionNotes,
}) => {
  const [activeTab, setActiveTab] = useState<'DC' | 'AC' | 'NORMATIVA'>('DC');

  // -------------------------------------------------------------
  // DC State
  // -------------------------------------------------------------
  const [dcCalcMode, setDcCalcMode] = useState<'DIRECT' | 'MODULES'>('MODULES');
  const [dcModulesPerString, setDcModulesPerString] = useState<number>(8);
  const [dcVmpPerModule, setDcVmpPerModule] = useState<number>(41.8);
  const [dcVmpDirect, setDcVmpDirect] = useState<number>(334.4);
  const [dcImp, setDcImp] = useState<number>(13.2);
  const [dcLength, setDcLength] = useState<number>(25);
  const [dcSection, setDcSection] = useState<number>(4);
  const [dcTemp, setDcTemp] = useState<number>(70); // 70°C roof operating temp
  const [dcMaterial, setDcMaterial] = useState<'CU' | 'AL'>('CU');

  // -------------------------------------------------------------
  // AC State
  // -------------------------------------------------------------
  const [acSystemType, setAcSystemType] = useState<'MONO' | 'TRI'>('MONO');
  const [acVoltage, setAcVoltage] = useState<number>(220);
  const [acPowerKw, setAcPowerKw] = useState<number>(5.0);
  const [acPowerFactor, setAcPowerFactor] = useState<number>(1.0);
  const [acLength, setAcLength] = useState<number>(20);
  const [acSection, setAcSection] = useState<number>(6);
  const [acTemp, setAcTemp] = useState<number>(70);
  const [acMaterial, setAcMaterial] = useState<'CU' | 'AL'>('CU');

  // Copy feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  // Sync Vmp Direct when modules change
  useEffect(() => {
    if (dcCalcMode === 'MODULES') {
      const calculatedVmp = Math.round(dcModulesPerString * dcVmpPerModule * 10) / 10;
      setDcVmpDirect(calculatedVmp);
    }
  }, [dcModulesPerString, dcVmpPerModule, dcCalcMode]);

  // Load defaults from current TechnicalInfo if available
  const handleAutoLoadFromProject = () => {
    if (!technicalInfo) return;

    // AC System
    const isTri = technicalInfo.systemType.toLowerCase().includes('tri') || (parseFloat(technicalInfo.installedPowerKwp) > 8);
    setAcSystemType(isTri ? 'TRI' : 'MONO');
    setAcVoltage(isTri ? 380 : 220);

    const numericKw = parseFloat(technicalInfo.installedPowerKwp.replace(',', '.'));
    if (!isNaN(numericKw) && numericKw > 0) {
      setAcPowerKw(numericKw);
    }

    // DC String modules
    const match = technicalInfo.panelsPerString?.match(/(\d+)\s*(?:paneles|módulos|modulos)/i);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      if (count > 0 && count < 40) {
        setDcModulesPerString(count);
        setDcVmpDirect(Math.round(count * dcVmpPerModule * 10) / 10);
      }
    }

    setCopyFeedback('¡Datos del proyecto cargados automáticamente!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  if (!isOpen) return null;

  // DC Calculation
  const dcInput: DcCalculationInput = {
    vmpString: dcCalcMode === 'MODULES' ? dcModulesPerString * dcVmpPerModule : dcVmpDirect,
    impString: dcImp,
    lengthMeters: dcLength,
    conductorSectionMm2: dcSection,
    operatingTempC: dcTemp,
    conductorMaterial: dcMaterial,
  };
  const dcResult = calculateDcVoltageDrop(dcInput);

  // AC Calculation
  const acInput: AcCalculationInput = {
    systemType: acSystemType,
    nominalVoltage: acVoltage,
    powerKw: acPowerKw,
    powerFactor: acPowerFactor,
    lengthMeters: acLength,
    conductorSectionMm2: acSection,
    operatingTempC: acTemp,
    conductorMaterial: acMaterial,
  };
  const acResult = calculateAcVoltageDrop(acInput);

  // Generate textual calculation sheet
  const generateDcSummaryText = (): string => {
    return `=== MEMORIA DE CÁLCULO CAÍDA DE TENSIÓN STRING DC ===
• Tensión del String (Vmp): ${dcInput.vmpString.toFixed(1)} V (${dcModulesPerString} paneles x ${dcVmpPerModule} V)
• Corriente de Máxima Potencia (Imp): ${dcInput.impString} A
• Longitud de la canalización (1 sentido): ${dcInput.lengthMeters} m
• Sección del Conductor Solar: ${dcInput.conductorSectionMm2} mm² (${dcMaterial === 'CU' ? 'Cobre Solar H1Z2Z2-K' : 'Aluminio'})
• Temperatura de Servicio: ${dcInput.operatingTempC}°C (ρ = ${dcResult.rhoUsed.toFixed(5)} Ω·mm²/m)
------------------------------------------------------
RESULTADOS:
• Resistencia del bucle: ${dcResult.resistanceTotal.toFixed(4)} Ω
• Caída de Tensión (ΔV): ${dcResult.deltaV.toFixed(2)} V
• Porcentaje de Caída (%ΔV): ${dcResult.deltaVPercent.toFixed(2)}%
• Tensión en bornes MPPT Inversor: ${dcResult.vInverter.toFixed(1)} V
• Potencia Disipada (Joule): ${dcResult.powerLossWatts.toFixed(1)} W (${dcResult.powerLossPercent.toFixed(2)}%)
• Pérdida Anual Estimada: ${dcResult.estimatedAnnualKwhLoss.toFixed(1)} kWh/año
• Diagnóstico SEC / RIC N°19: ${dcResult.complianceMessage}
• Sección recomendada (≤1.5%): ${dcResult.recommendedSectionMm2} mm²`;
  };

  const generateAcSummaryText = (): string => {
    return `=== MEMORIA DE CÁLCULO ALIMENTADOR AC (RIC N°03 / RIC N°19) ===
• Sistema: ${acSystemType === 'MONO' ? 'Monofásico 1Φ (F+N+T)' : 'Trifásico 3Φ (3F+N+T)'} a ${acVoltage} V
• Potencia Inversor / Alimentador: ${acPowerKw} kW (cos φ = ${acPowerFactor})
• Corriente Nominal Calculada (Iac): ${acResult.nominalCurrent.toFixed(1)} A
• Longitud del Alimentador: ${acLength} m
• Conductor Seleccionado: ${acSection} mm² (${acMaterial === 'CU' ? 'Cobre EVA / THHN' : 'Aluminio'}) a ${acTemp}°C
------------------------------------------------------
RESULTADOS:
• Caída de Tensión (ΔV): ${acResult.deltaV.toFixed(2)} V
• Porcentaje de Caída (%ΔV): ${acResult.deltaVPercent.toFixed(2)}% (Límite RIC 03: ≤3.0%, Netbilling rec: ≤1.5%)
• Tensión en Bornes Inversor en Inyección: ${acResult.vAtInverterTerminals.toFixed(1)} V
• Pérdidas por Efecto Joule: ${acResult.powerLossWatts.toFixed(1)} W
• Diagnóstico SEC: ${acResult.complianceMessage}
• Sección mínima recomendada (≤1.5% Netbilling): ${acResult.recommendedSection15Percent} mm²
• Sección mínima reglamentaria (≤3.0% RIC N°03): ${acResult.recommendedSection30Percent} mm²`;
  };

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback('¡Memoria de cálculo copiada al portapapeles!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleApplyToNotes = (text: string) => {
    if (onApplyToInspectionNotes) {
      onApplyToInspectionNotes(text);
      setAppliedFeedback('¡Agregado a las observaciones de la inspección!');
      setTimeout(() => setAppliedFeedback(null), 3500);
    }
  };

  return (
    <div
      id="voltage-drop-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-white w-full max-w-5xl rounded-xs border-2 border-[#15803D] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#15803D] text-white px-4 py-3 flex items-center justify-between border-b-2 border-[#14532D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-[#25A238] flex items-center justify-center text-white shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight flex items-center gap-2">
                Calculadora de Caída de Tensión SEC
                <span className="text-[10px] font-mono font-normal bg-[#DCFCE7] text-[#14532D] px-2 py-0.5 rounded-2xs font-bold">
                  RIC N°03 • RIC N°19
                </span>
              </h2>
              <p className="text-[11px] text-[#DCFCE7] opacity-90">
                Dimensionamiento técnico y verificación normativa para Strings DC y Alimentadores AC en terreno
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {technicalInfo && (
              <button
                type="button"
                onClick={handleAutoLoadFromProject}
                className="hidden sm:flex items-center gap-1.5 text-xs bg-[#DCFCE7] text-[#14532D] hover:bg-white px-2.5 py-1.5 rounded-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="Cargar automáticamente datos de potencia y paneles desde el formulario de inspección"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Cargar del Proyecto</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1.5 rounded-xs transition-colors cursor-pointer"
              title="Cerrar calculadora"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#F0FDF4] border-b border-[#15803D]/30 px-4 pt-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('DC')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xs border-t-2 border-x transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'DC'
                  ? 'bg-white text-[#14532D] border-t-[#15803D] border-x-[#15803D]/30 border-b-white -mb-px shadow-2xs'
                  : 'bg-transparent text-slate-600 border-transparent hover:text-[#15803D]'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Strings DC (Fotovoltaico)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('AC')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xs border-t-2 border-x transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'AC'
                  ? 'bg-white text-[#14532D] border-t-[#15803D] border-x-[#15803D]/30 border-b-white -mb-px shadow-2xs'
                  : 'bg-transparent text-slate-600 border-transparent hover:text-[#15803D]'
              }`}
            >
              <Zap className="w-4 h-4 text-[#15803D]" />
              <span>Alimentador AC (Inversor a Tablero)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('NORMATIVA')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xs border-t-2 border-x transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'NORMATIVA'
                  ? 'bg-white text-[#14532D] border-t-[#15803D] border-x-[#15803D]/30 border-b-white -mb-px shadow-2xs'
                  : 'bg-transparent text-slate-600 border-transparent hover:text-[#15803D]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Tabla SEC & Límites</span>
            </button>
          </div>

          {technicalInfo && (
            <button
              type="button"
              onClick={handleAutoLoadFromProject}
              className="sm:hidden text-[10px] bg-[#DCFCE7] text-[#14532D] px-2 py-1 rounded-2xs font-bold border border-[#15803D]/30 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#15803D]" />
              <span>Cargar Datos</span>
            </button>
          )}
        </div>

        {/* Feedback Notifications */}
        {(copyFeedback || appliedFeedback) && (
          <div className="bg-[#DCFCE7] border-b border-[#15803D]/30 px-4 py-2 text-xs text-[#14532D] font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            <span>{copyFeedback || appliedFeedback}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#F8FAF9] space-y-6">
          {/* TAB 1: DC STRINGS */}
          {activeTab === 'DC' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs Left Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white p-4 border border-[#15803D]/30 rounded-xs space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#15803D]/20 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#14532D] flex items-center gap-1.5 font-mono">
                        <Sun className="w-4 h-4 text-amber-500" />
                        1. Parámetros del String Fotovoltaico
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] bg-slate-100 p-0.5 rounded-2xs">
                        <button
                          type="button"
                          onClick={() => setDcCalcMode('MODULES')}
                          className={`px-2 py-0.5 rounded-2xs font-bold transition-colors cursor-pointer ${
                            dcCalcMode === 'MODULES' ? 'bg-[#15803D] text-white shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          Por Módulos
                        </button>
                        <button
                          type="button"
                          onClick={() => setDcCalcMode('DIRECT')}
                          className={`px-2 py-0.5 rounded-2xs font-bold transition-colors cursor-pointer ${
                            dcCalcMode === 'DIRECT' ? 'bg-[#15803D] text-white shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          Vmp Directo
                        </button>
                      </div>
                    </div>

                    {/* Vmp inputs */}
                    {dcCalcMode === 'MODULES' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            N° de Paneles en Serie
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="35"
                              value={dcModulesPerString}
                              onChange={(e) => setDcModulesPerString(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">paneles</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Vmp por Módulo (V)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              min="10"
                              max="90"
                              value={dcVmpPerModule}
                              onChange={(e) => setDcVmpPerModule(parseFloat(e.target.value) || 40)}
                              className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">V / panel</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Tensión Total del String Vmp (V)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="20"
                          max="1500"
                          value={dcVmpDirect}
                          onChange={(e) => setDcVmpDirect(parseFloat(e.target.value) || 100)}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Corriente Imp del String (A)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="50"
                            value={dcImp}
                            onChange={(e) => setDcImp(parseFloat(e.target.value) || 10)}
                            className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">Amperes</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {[10.5, 13.2, 17.5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setDcImp(val)}
                              className="text-[9px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-2xs text-slate-700 font-mono"
                            >
                              {val}A
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Longitud de Canalización (m)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            max="500"
                            value={dcLength}
                            onChange={(e) => setDcLength(Math.max(1, parseFloat(e.target.value) || 1))}
                            className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">metros</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {[15, 25, 40, 60].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setDcLength(val)}
                              className="text-[9px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-2xs text-slate-700 font-mono"
                            >
                              {val}m
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conductor parameters */}
                  <div className="bg-white p-4 border border-[#15803D]/30 rounded-xs space-y-4 shadow-2xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#14532D] flex items-center gap-1.5 font-mono border-b border-[#15803D]/20 pb-2">
                      <Layers className="w-4 h-4 text-[#15803D]" />
                      2. Conductor Solar y Condiciones Térmicas
                    </h3>

                    {/* Section Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                          Sección del Conductor Solar: <strong className="text-sm font-bold text-[#15803D] font-mono">{dcSection} mm²</strong>
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">
                          {dcSection === 4 ? '12 AWG' : dcSection === 6 ? '10 AWG' : dcSection === 10 ? '8 AWG' : dcSection === 16 ? '6 AWG' : '4 AWG'}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {STANDARD_DC_SECTIONS.map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setDcSection(sec)}
                            className={`py-2 px-1 text-center rounded-xs border font-bold text-xs transition-all cursor-pointer ${
                              dcSection === sec
                                ? 'bg-[#15803D] text-white border-[#14532D] shadow-xs'
                                : 'bg-[#F8FAF9] text-slate-700 border-slate-300 hover:border-[#15803D]'
                            }`}
                          >
                            <span className="block font-mono text-sm">{sec}</span>
                            <span className="text-[9px] font-normal opacity-80 block">mm²</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                          Temperatura de Operación del Cable
                        </label>
                        <select
                          value={dcTemp}
                          onChange={(e) => setDcTemp(parseInt(e.target.value, 10))}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                        >
                          <option value={20}>20°C (Referencia Estándar STC)</option>
                          <option value={50}>50°C (Canalización Sombría)</option>
                          <option value={70}>70°C (Techo con Radiación / NOCT)</option>
                          <option value={90}>90°C (Temperatura Máxima Aislación)</option>
                        </select>
                        <span className="text-[9px] text-slate-500 mt-0.5 block">
                          Resistividad calculada: <strong className="font-mono">{dcResult.rhoUsed.toFixed(5)} Ω·mm²/m</strong>
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Material Conductor
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDcMaterial('CU')}
                            className={`py-1.5 px-2 rounded-2xs text-xs font-bold border transition-colors cursor-pointer ${
                              dcMaterial === 'CU'
                                ? 'bg-[#DCFCE7] text-[#14532D] border-[#15803D]'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            Cobre (Solar Cu)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDcMaterial('AL')}
                            className={`py-1.5 px-2 rounded-2xs text-xs font-bold border transition-colors cursor-pointer ${
                              dcMaterial === 'AL'
                                ? 'bg-[#DCFCE7] text-[#14532D] border-[#15803D]'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            Aluminio (Al)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Right Column */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Big Gauge / Result Card */}
                  <div
                    className={`p-5 rounded-xs border-2 shadow-md space-y-4 ${
                      dcResult.complianceStatus === 'OPTIMAL'
                        ? 'bg-emerald-50/70 border-[#15803D]'
                        : dcResult.complianceStatus === 'ACCEPTABLE'
                        ? 'bg-green-50/70 border-emerald-600'
                        : dcResult.complianceStatus === 'WARNING'
                        ? 'bg-amber-50/80 border-amber-500'
                        : 'bg-rose-50 border-rose-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-700">
                        Caída de Tensión en String DC
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-2xs font-mono flex items-center gap-1 ${
                          dcResult.complianceStatus === 'OPTIMAL'
                            ? 'bg-[#15803D] text-white'
                            : dcResult.complianceStatus === 'ACCEPTABLE'
                            ? 'bg-emerald-700 text-white'
                            : dcResult.complianceStatus === 'WARNING'
                            ? 'bg-amber-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {dcResult.complianceStatus === 'OPTIMAL' && <CheckCircle2 className="w-3 h-3" />}
                        {dcResult.complianceStatus === 'ACCEPTABLE' && <CheckCircle2 className="w-3 h-3" />}
                        {dcResult.complianceStatus === 'WARNING' && <AlertTriangle className="w-3 h-3" />}
                        {dcResult.complianceStatus === 'CRITICAL' && <XCircle className="w-3 h-3" />}
                        {dcResult.complianceStatus === 'OPTIMAL' && 'ÓPTIMO (≤ 1.5%)'}
                        {dcResult.complianceStatus === 'ACCEPTABLE' && 'CONFORME (≤ 2.0%)'}
                        {dcResult.complianceStatus === 'WARNING' && 'AL LÍMITE (≤ 3.0%)'}
                        {dcResult.complianceStatus === 'CRITICAL' && 'NO CONFORME (> 3.0%)'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between border-b border-slate-300/60 pb-3">
                      <div>
                        <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0F172A]">
                          {dcResult.deltaVPercent.toFixed(2)}
                          <span className="text-xl font-normal text-slate-600 ml-1">%</span>
                        </div>
                        <div className="text-xs text-slate-600 font-semibold mt-0.5">
                          ΔV = <strong className="font-mono text-slate-900">{dcResult.deltaV.toFixed(2)} V</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase text-slate-500 font-semibold">Tensión en Inversor MPPT</div>
                        <div className="text-xl font-bold font-mono text-[#15803D]">{dcResult.vInverter.toFixed(1)} V</div>
                        <div className="text-[10px] text-slate-500">de {dcInput.vmpString.toFixed(1)} V iniciales</div>
                      </div>
                    </div>

                    {/* Progress visual bar */}
                    <div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1">
                        <span>0%</span>
                        <span className="text-emerald-700 font-bold">1.5% (Óptimo)</span>
                        <span className="text-amber-700 font-bold">2.0%</span>
                        <span className="text-rose-700 font-bold">3.0% (Límite SEC)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-300 ${
                            dcResult.deltaVPercent <= 1.5
                              ? 'bg-[#15803D]'
                              : dcResult.deltaVPercent <= 2.0
                              ? 'bg-emerald-500'
                              : dcResult.deltaVPercent <= 3.0
                              ? 'bg-amber-500'
                              : 'bg-rose-600'
                          }`}
                          style={{ width: `${Math.min(100, (dcResult.deltaVPercent / 4) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {dcResult.complianceMessage}
                    </p>

                    {/* Energy Loss Cards */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-300/60">
                      <div className="bg-white/80 p-2.5 rounded-2xs border border-slate-200">
                        <span className="block text-[9px] uppercase font-semibold text-slate-500">Pérdida en Potencia</span>
                        <span className="text-sm font-bold font-mono text-slate-900">{dcResult.powerLossWatts.toFixed(1)} W</span>
                        <span className="text-[9px] text-slate-500 block">({dcResult.powerLossPercent.toFixed(2)}% del string)</span>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded-2xs border border-slate-200">
                        <span className="block text-[9px] uppercase font-semibold text-slate-500">Energía Anual Disipada</span>
                        <span className="text-sm font-bold font-mono text-[#15803D]">
                          ~{dcResult.estimatedAnnualKwhLoss.toFixed(1)} kWh
                        </span>
                        <span className="text-[9px] text-slate-500 block">estimado / año</span>
                      </div>
                    </div>

                    {/* Section Recommendation */}
                    {dcResult.deltaVPercent > 1.5 && (
                      <div className="bg-[#DCFCE7] p-2.5 rounded-2xs border border-[#15803D]/40 text-xs flex items-center justify-between gap-2">
                        <div>
                          <span className="block font-bold text-[#14532D] text-[11px]">Recomendación Técnica:</span>
                          <span className="text-[10px] text-slate-700">
                            Para reducir a ≤ 1.5%, utilice conductor solar de:
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDcSection(dcResult.recommendedSectionMm2)}
                          className="bg-[#15803D] hover:bg-[#14532D] text-white px-2.5 py-1 rounded-2xs font-bold text-xs font-mono shrink-0 cursor-pointer shadow-2xs"
                          title="Aplicar sección recomendada"
                        >
                          {dcResult.recommendedSectionMm2} mm² ↵
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopySummary(generateDcSummaryText())}
                      className="w-full py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xs text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copiar Memoria de Cálculo DC</span>
                    </button>

                    {onApplyToInspectionNotes && (
                      <button
                        type="button"
                        onClick={() => handleApplyToNotes(`[CÁLCULO STRING DC: Vmp=${dcInput.vmpString.toFixed(0)}V, Imp=${dcImp}A, L=${dcLength}m, S=${dcSection}mm², ΔV=${dcResult.deltaV.toFixed(2)}V (${dcResult.deltaVPercent.toFixed(2)}%) - ${dcResult.complianceStatus === 'OPTIMAL' ? 'Óptimo' : 'Conforme SEC'}]`)}
                        className="w-full py-2 bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#14532D] border border-[#15803D]/40 rounded-xs text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Insertar en Observaciones de Inspección</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AC FEEDERS */}
          {activeTab === 'AC' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs Left Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white p-4 border border-[#15803D]/30 rounded-xs space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#15803D]/20 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#14532D] flex items-center gap-1.5 font-mono">
                        <Zap className="w-4 h-4 text-[#15803D]" />
                        1. Características del Inversor y Red Eléctrica AC
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#14532D] px-2 py-0.5 rounded-2xs">
                        RIC N°03 / RIC N°19
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Tipo de Red Eléctrica AC
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAcSystemType('MONO');
                              setAcVoltage(220);
                            }}
                            className={`py-1.5 px-2 rounded-2xs text-xs font-bold border transition-colors cursor-pointer ${
                              acSystemType === 'MONO'
                                ? 'bg-[#15803D] text-white border-[#14532D]'
                                : 'bg-[#F8FAF9] text-slate-700 border-slate-300'
                            }`}
                          >
                            1Φ Monofásico (220V)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAcSystemType('TRI');
                              setAcVoltage(380);
                            }}
                            className={`py-1.5 px-2 rounded-2xs text-xs font-bold border transition-colors cursor-pointer ${
                              acSystemType === 'TRI'
                                ? 'bg-[#15803D] text-white border-[#14532D]'
                                : 'bg-[#F8FAF9] text-slate-700 border-slate-300'
                            }`}
                          >
                            3Φ Trifásico (380V)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Tensión Nominal de Red (V)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="1"
                            min="100"
                            max="500"
                            value={acVoltage}
                            onChange={(e) => setAcVoltage(parseFloat(e.target.value) || (acSystemType === 'MONO' ? 220 : 380))}
                            className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">Volts</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Potencia Inversor (kW)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="500"
                            value={acPowerKw}
                            onChange={(e) => setAcPowerKw(Math.max(0.1, parseFloat(e.target.value) || 3))}
                            className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 font-mono">kW</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {[3, 5, 8, 10, 15].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAcPowerKw(val)}
                              className="text-[9px] bg-slate-100 hover:bg-slate-200 px-1 py-0.5 rounded-2xs text-slate-700 font-mono"
                            >
                              {val}k
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Factor Potencia (cos φ)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.8"
                          max="1.0"
                          value={acPowerFactor}
                          onChange={(e) => setAcPowerFactor(parseFloat(e.target.value) || 1.0)}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                        />
                        <span className="text-[9px] text-slate-500 mt-0.5 block">Normalmente 1.00 en solar</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Distancia Inversor-Tablero (m)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            max="500"
                            value={acLength}
                            onChange={(e) => setAcLength(Math.max(1, parseFloat(e.target.value) || 1))}
                            className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 font-mono">m</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {[10, 20, 35, 50].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAcLength(val)}
                              className="text-[9px] bg-slate-100 hover:bg-slate-200 px-1 py-0.5 rounded-2xs text-slate-700 font-mono"
                            >
                              {val}m
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conductor parameters AC */}
                  <div className="bg-white p-4 border border-[#15803D]/30 rounded-xs space-y-4 shadow-2xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#14532D] flex items-center gap-1.5 font-mono border-b border-[#15803D]/20 pb-2">
                      <Layers className="w-4 h-4 text-[#15803D]" />
                      2. Conductor del Alimentador AC
                    </h3>

                    {/* Section Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                          Sección del Alimentador: <strong className="text-sm font-bold text-[#15803D] font-mono">{acSection} mm²</strong>
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">
                          {acSection === 2.5 ? '14 AWG' : acSection === 4 ? '12 AWG' : acSection === 6 ? '10 AWG' : acSection === 10 ? '8 AWG' : acSection === 16 ? '6 AWG' : acSection === 25 ? '4 AWG' : `${acSection} mm²`}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                        {STANDARD_AC_SECTIONS.slice(0, 7).map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setAcSection(sec)}
                            className={`py-1.5 px-1 text-center rounded-xs border font-bold text-xs transition-all cursor-pointer ${
                              acSection === sec
                                ? 'bg-[#15803D] text-white border-[#14532D] shadow-xs'
                                : 'bg-[#F8FAF9] text-slate-700 border-slate-300 hover:border-[#15803D]'
                            }`}
                          >
                            <span className="block font-mono text-xs sm:text-sm">{sec}</span>
                            <span className="text-[8px] sm:text-[9px] font-normal opacity-80 block">mm²</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                          Temperatura de Servicio Conductor
                        </label>
                        <select
                          value={acTemp}
                          onChange={(e) => setAcTemp(parseInt(e.target.value, 10))}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs font-bold text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                        >
                          <option value={20}>20°C (Referencia Estándar)</option>
                          <option value={50}>50°C (Carga media en tubería)</option>
                          <option value={70}>70°C (Servicio Continuo EVA/THHN)</option>
                          <option value={90}>90°C (XHE / Libre de Halógenos)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Material del Conductor AC
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAcMaterial('CU')}
                            className={`py-1.5 px-2 rounded-2xs text-xs font-bold border transition-colors cursor-pointer ${
                              acMaterial === 'CU'
                                ? 'bg-[#DCFCE7] text-[#14532D] border-[#15803D]'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            Cobre (Cu EVA/THHN)
                          </button>
                          <button
                            type="button"
                            onClick={() => setAcMaterial('AL')}
                            className={`py-1.5 px-2 rounded-2xs text-xs font-bold border transition-colors cursor-pointer ${
                              acMaterial === 'AL'
                                ? 'bg-[#DCFCE7] text-[#14532D] border-[#15803D]'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            Aluminio (Al)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Right Column AC */}
                <div className="lg:col-span-5 space-y-4">
                  <div
                    className={`p-5 rounded-xs border-2 shadow-md space-y-4 ${
                      acResult.complianceStatus === 'OPTIMAL'
                        ? 'bg-emerald-50/70 border-[#15803D]'
                        : acResult.complianceStatus === 'ACCEPTABLE'
                        ? 'bg-green-50/70 border-emerald-600'
                        : 'bg-rose-50 border-rose-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-700">
                        Caída en Alimentador AC (RIC N°03)
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-2xs font-mono flex items-center gap-1 ${
                          acResult.complianceStatus === 'OPTIMAL'
                            ? 'bg-[#15803D] text-white'
                            : acResult.complianceStatus === 'ACCEPTABLE'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {acResult.complianceStatus === 'OPTIMAL' && <CheckCircle2 className="w-3 h-3" />}
                        {acResult.complianceStatus === 'ACCEPTABLE' && <CheckCircle2 className="w-3 h-3" />}
                        {acResult.complianceStatus === 'CRITICAL' && <XCircle className="w-3 h-3" />}
                        {acResult.complianceStatus === 'OPTIMAL' && 'ÓPTIMO (≤ 1.5%)'}
                        {acResult.complianceStatus === 'ACCEPTABLE' && 'CONFORME SEC (≤ 3.0%)'}
                        {acResult.complianceStatus === 'CRITICAL' && 'NO CONFORME (> 3.0%)'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between border-b border-slate-300/60 pb-3">
                      <div>
                        <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0F172A]">
                          {acResult.deltaVPercent.toFixed(2)}
                          <span className="text-xl font-normal text-slate-600 ml-1">%</span>
                        </div>
                        <div className="text-xs text-slate-600 font-semibold mt-0.5">
                          ΔV = <strong className="font-mono text-slate-900">{acResult.deltaV.toFixed(2)} V</strong> | Iac ={' '}
                          <strong className="font-mono text-[#15803D]">{acResult.nominalCurrent.toFixed(1)} A</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase text-slate-500 font-semibold">Tensión Inversor en Inyección</div>
                        <div className={`text-xl font-bold font-mono ${acResult.overvoltageWarning ? 'text-rose-600 animate-pulse' : 'text-[#15803D]'}`}>
                          {acResult.vAtInverterTerminals.toFixed(1)} V
                        </div>
                        <div className="text-[10px] text-slate-500">en bornes AC inversor</div>
                      </div>
                    </div>

                    {/* Overvoltage Alert for Netbilling */}
                    {acResult.overvoltageWarning && (
                      <div className="bg-rose-100 border border-rose-300 p-2.5 rounded-2xs text-xs text-rose-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">¡Riesgo de Sobrevoltaje en Inyección (Netbilling)!</strong>
                          <span>
                            Con una caída de {acResult.deltaV.toFixed(1)}V, el inversor debe elevar la tensión a {acResult.vAtInverterTerminals.toFixed(1)}V. Si la red distribuidora sube a 230V+, el inversor podría desconectarse por protección de sobretensión (&gt;253V). Aumente el calibre a {acResult.recommendedSection15Percent} mm².
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Progress visual bar */}
                    <div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1">
                        <span>0%</span>
                        <span className="text-emerald-700 font-bold">1.5% (Netbilling Óptimo)</span>
                        <span className="text-rose-700 font-bold">3.0% (Límite RIC 03)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-300 ${
                            acResult.deltaVPercent <= 1.5
                              ? 'bg-[#15803D]'
                              : acResult.deltaVPercent <= 3.0
                              ? 'bg-amber-500'
                              : 'bg-rose-600'
                          }`}
                          style={{ width: `${Math.min(100, (acResult.deltaVPercent / 4) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {acResult.complianceMessage}
                    </p>

                    {/* Section Recommendations Box */}
                    <div className="bg-white/80 p-3 rounded-2xs border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 text-[11px]">Recomendado Netbilling (≤ 1.5%):</span>
                        <button
                          type="button"
                          onClick={() => setAcSection(acResult.recommendedSection15Percent)}
                          className="font-mono font-bold text-xs bg-[#DCFCE7] text-[#14532D] hover:bg-[#bbf7d0] px-2 py-0.5 rounded-2xs border border-[#15803D]/40 cursor-pointer"
                        >
                          {acResult.recommendedSection15Percent} mm²
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                        <span className="text-slate-600 text-[11px]">Límite Reglamentario RIC 03 (≤ 3.0%):</span>
                        <button
                          type="button"
                          onClick={() => setAcSection(acResult.recommendedSection30Percent)}
                          className="font-mono font-bold text-xs bg-slate-100 text-slate-800 hover:bg-slate-200 px-2 py-0.5 rounded-2xs border border-slate-300 cursor-pointer"
                        >
                          {acResult.recommendedSection30Percent} mm²
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons AC */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopySummary(generateAcSummaryText())}
                      className="w-full py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xs text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copiar Memoria de Cálculo AC</span>
                    </button>

                    {onApplyToInspectionNotes && (
                      <button
                        type="button"
                        onClick={() => handleApplyToNotes(`[ALIMENTADOR AC: P=${acPowerKw}kW, Iac=${acResult.nominalCurrent.toFixed(1)}A, L=${acLength}m, S=${acSection}mm², ΔV=${acResult.deltaV.toFixed(2)}V (${acResult.deltaVPercent.toFixed(2)}%) - ${acResult.complianceStatus === 'OPTIMAL' ? 'Óptimo Netbilling' : 'Conforme RIC 03'}]`)}
                        className="w-full py-2 bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#14532D] border border-[#15803D]/40 rounded-xs text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Insertar en Observaciones de Inspección</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NORMATIVA SEC & TABLAS */}
          {activeTab === 'NORMATIVA' && (
            <div className="space-y-4 bg-white p-5 rounded-xs border border-[#15803D]/30 shadow-2xs text-xs">
              <div className="border-b border-[#15803D]/20 pb-3">
                <h3 className="text-sm font-bold text-[#14532D] font-serif flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                  Resumen de Exigencias Normativas SEC (RIC N°03, RIC N°09 y RIC N°19)
                </h3>
                <p className="text-slate-600 text-xs mt-1">
                  Criterios obligatorios de diseño y fiscalización para instalaciones fotovoltaicas de generación distribuida (Netbilling / Ley 21.118).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#F8FAF9] p-3.5 border-l-4 border-l-amber-500 border border-slate-200 rounded-2xs space-y-1.5">
                  <span className="font-bold text-amber-900 block text-xs">☀️ Strings Fotovoltaicos DC</span>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    • <strong>Límite recomendado:</strong> ≤ 1.5% a 2.0% de caída de tensión.<br />
                    • <strong>Conductor obligatorio:</strong> Cable solar certificado tipo H1Z2Z2-K (retardante a la llama, resistente a UV y 120°C).<br />
                    • <strong>Sección mínima:</strong> 4 mm² (Cu).
                  </p>
                </div>

                <div className="bg-[#F8FAF9] p-3.5 border-l-4 border-l-[#15803D] border border-slate-200 rounded-2xs space-y-1.5">
                  <span className="font-bold text-[#14532D] block text-xs">⚡ Alimentadores AC (RIC N°03)</span>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    • <strong>Límite máximo SEC:</strong> ≤ 3.0% entre el inversor y el empalme/TGE.<br />
                    • <strong>Recomendación Netbilling:</strong> ≤ 1.5% para evitar cortes por sobretensión en inyección.<br />
                    • <strong>Sección mínima:</strong> 2.5 mm² para alimentadores monofásicos.
                  </p>
                </div>

                <div className="bg-[#F8FAF9] p-3.5 border-l-4 border-l-blue-600 border border-slate-200 rounded-2xs space-y-1.5">
                  <span className="font-bold text-blue-900 block text-xs">📐 Fórmulas Reglamentarias</span>
                  <p className="text-slate-700 text-[11px] font-mono leading-relaxed">
                    • <strong>DC 2 hilos:</strong> ΔV = (2·ρ·L·I) / S<br />
                    • <strong>AC 1Φ:</strong> ΔV = (2·ρ·L·I·cosφ) / S<br />
                    • <strong>AC 3Φ:</strong> ΔV = (√3·ρ·L·I·cosφ) / S<br />
                    • <strong>ρ Cobre 20°C:</strong> 0.0178 Ω·mm²/m
                  </p>
                </div>
              </div>

              {/* Conductor table */}
              <div className="mt-4">
                <h4 className="font-bold text-[#14532D] text-xs uppercase tracking-wider mb-2 font-mono">
                  Tabla de Referencia de Calibres y Ampacidades Comunes en Chile
                </h4>
                <div className="overflow-x-auto border border-slate-300 rounded-xs">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#15803D] text-white font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Sección (mm²)</th>
                        <th className="p-2">Equivalente AWG</th>
                        <th className="p-2">Ampacidad Solar DC (H1Z2Z2-K al aire)</th>
                        <th className="p-2">Ampacidad AC (EVA en tubería 30°C)</th>
                        <th className="p-2">Resistencia Cu a 70°C (Ω/km)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 font-bold font-mono">2.5 mm²</td>
                        <td className="p-2 font-mono">14 AWG</td>
                        <td className="p-2 font-mono">41 A</td>
                        <td className="p-2 font-mono">20 A</td>
                        <td className="p-2 font-mono">8.54 Ω/km</td>
                      </tr>
                      <tr className="hover:bg-slate-50 bg-[#F0FDF4]">
                        <td className="p-2 font-bold font-mono text-[#15803D]">4.0 mm²</td>
                        <td className="p-2 font-mono">12 AWG</td>
                        <td className="p-2 font-mono font-bold">55 A</td>
                        <td className="p-2 font-mono">28 A</td>
                        <td className="p-2 font-mono">5.34 Ω/km</td>
                      </tr>
                      <tr className="hover:bg-slate-50 bg-[#F0FDF4]">
                        <td className="p-2 font-bold font-mono text-[#15803D]">6.0 mm²</td>
                        <td className="p-2 font-mono">10 AWG</td>
                        <td className="p-2 font-mono font-bold">70 A</td>
                        <td className="p-2 font-mono">36 A</td>
                        <td className="p-2 font-mono">3.56 Ω/km</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 font-bold font-mono">10.0 mm²</td>
                        <td className="p-2 font-mono">8 AWG</td>
                        <td className="p-2 font-mono">98 A</td>
                        <td className="p-2 font-mono">50 A</td>
                        <td className="p-2 font-mono">2.14 Ω/km</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 font-bold font-mono">16.0 mm²</td>
                        <td className="p-2 font-mono">6 AWG</td>
                        <td className="p-2 font-mono">132 A</td>
                        <td className="p-2 font-mono">68 A</td>
                        <td className="p-2 font-mono">1.33 Ω/km</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 font-bold font-mono">25.0 mm²</td>
                        <td className="p-2 font-mono">4 AWG</td>
                        <td className="p-2 font-mono">176 A</td>
                        <td className="p-2 font-mono">89 A</td>
                        <td className="p-2 font-mono">0.85 Ω/km</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-300 p-3 px-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Los cálculos aplican corrección de resistividad por temperatura en tiempo real.</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
