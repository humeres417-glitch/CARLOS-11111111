import React, { useState } from 'react';
import { User, MapPin, Cpu, ChevronDown, ChevronUp, UserCheck, Phone, ShieldCheck, Loader2, Check, Plus, X, Sun, Battery, Layers } from 'lucide-react';
import { InstallerInfo, ClientInfo, TechnicalInfo, SystemType, StringConfigItem } from '../types';

const CHILEAN_DISTRIBUTION_COMPANIES = [
  'Enel Distribución Chile',
  'CGE Distribución',
  'Chilquinta Distribución',
  'Grupo SAESA (Saesa)',
  'FRONTEL',
  'Luz Osorno',
  'Edelaysen',
  'Luzlinares',
  'Luzparral',
  'Codiner',
  'Cooperativa COPELEC',
  'Cooperativa COELCHA',
  'Cooperativa CEC (Curicó)',
  'Cooperativa SOCOEPA',
  'Cooperativa CRELL',
  'Cooperativa COOPELAN',
  'ELECDA',
  'EMELARI',
  'ELIQSA',
  'EGEA',
  'Otra / Personalizado'
];

interface InstallerFormProps {
  installer: InstallerInfo;
  client: ClientInfo;
  technical: TechnicalInfo;
  onChangeInstaller: (data: InstallerInfo) => void;
  onChangeClient: (data: ClientInfo) => void;
  onChangeTechnical: (data: TechnicalInfo) => void;
  onResetForm?: () => void;
}

export const InstallerForm: React.FC<InstallerFormProps> = ({
  installer,
  client,
  technical,
  onChangeInstaller,
  onChangeClient,
  onChangeTechnical,
  onResetForm,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const [pvBrandsList, setPvBrandsList] = useState<string[]>([
    'Jinko Solar',
    'Canadian Solar',
    'LONGi Solar',
    'JA Solar',
    'Risen Energy',
    'Astronergy (Chint)',
    'DAH Solar',
    'Anhui Solar',
    'Ulica Solar',
    'Otra Marca (Certificada SEC)'
  ]);

  const [pvModelsMap, setPvModelsMap] = useState<Record<string, string[]>>({
    'Jinko Solar': [
      'JKM550M-72HL4 550W Mono PERC Half-Cell',
      'JKM555M-72HL4 555W Mono PERC Half-Cell',
      'JKM560M-72HL4 560W Mono PERC Half-Cell',
      'JKM565M-72HL4-V 565W Mono PERC 1500V',
      'JKM570M-72HL4-V 570W Mono PERC 1500V',
      'JKM575M-72HL4-V 575W Mono PERC 1500V',
      'JKM580M-72HL4-V 580W Mono PERC 1500V',
      'Tiger Neo N-type JKM585N-72HL4-V',
      'Tiger Neo N-type JKM590N-72HL4-V',
      'Tiger Neo N-type JKM595N-72HL4-V',
      'Tiger Neo N-type JKM600N-72HL4-V',
      'Tiger Neo N-type JKM615N-78HL4-V',
      'Tiger Neo N-type JKM620N-78HL4-V',
      'Tiger Neo N-type JKM625N-78HL4-V',
      'Tiger Neo N-type JKM630N-78HL4-V',
      'Otro Modelo Jinko Solar'
    ],
    'Canadian Solar': [
      'HiKu6 CS6W-545MS',
      'HiKu6 CS6W-550MS',
      'HiKu6 CS6W-555MS',
      'CS6W-585T',
      'CS6.2-66TB-615',
      'CS6.2-66TB-620 (620W TOPCon Bifacial)',
      'LR7-72HVH-640M',
      'BiHiKu6 CS6W-540MB-AG',
      'BiHiKu6 CS6W-550MB-AG',
      'BiHiKu6 CS6W-555MB-AG',
      'HiKu7 CS7N-650MS',
      'HiKu7 CS7N-655MS',
      'HiKu7 CS7N-660MS',
      'HiKu7 CS7N-670MS',
      'BiHiKu7 CS7N-665TB-AG',
      'BiHiKu7 CS7N-690TB-AG',
      'Otro Modelo Canadian Solar'
    ],
    'LONGi Solar': [
      'LR5-72HPH-550M',
      'LR5-72HPH-555M',
      'LR5-72HTH-565M',
      'LR5-72HTH-570M',
      'LR5-72HTH-575M',
      'LR5-72HTH-580M',
      'LR5-72HGB-590M',
      'LR5-72HGB-600M',
      'LR8-66HGD-615M',
      'LR8-66HGD-620M',
      'LR8-66HGD-625M',
      'LR7-72HVH-640M',
      'Otro Modelo LONGi Solar'
    ],
    'JA Solar': [
      'JAM72S30-540/MR',
      'JAM72S30-545/MR',
      'JAM72S30-550/MR',
      'JAM72S30-555/MR',
      'JAM72S30-560/MR',
      'JAM72D30-540/MB',
      'JAM72D30-550/MB',
      'JAM72D40-570/GB',
      'JAM72D40-580/GB',
      'JAM72D42-620/LB',
      'Otro Modelo JA Solar'
    ],
    'Risen Energy': [
      'Titan RSM110-8-535M',
      'Titan RSM110-8-540M',
      'Titan RSM110-8-545M',
      'Titan RSM110-8-550M',
      'Titan RSM110-8-555M',
      'Titan RSM130-8-650M',
      'Titan RSM130-8-660M',
      'Titan HJT Hyper-ion RSM110-8-700H',
      'Otro Modelo Risen Energy'
    ],
    'Astronergy (Chint)': [
      'CHSM54M-HC 410W',
      'CHSM54M-HC 415W',
      'CHSM72M-HC 540W',
      'CHSM72M-HC 545W',
      'CHSM72M-HC 550W',
      'CHSM72M-HC 555W',
      'Astro N5 CHSM72N(DG)/F-BH 570W',
      'Astro N5 CHSM72N(DG)/F-BH 580W',
      'Otro Modelo Astronergy'
    ],
    'DAH Solar': [
      'DHN-72X16/FS-550W',
      'DHN-72X16/FS-555W',
      'DHN-72X16/FS-560W',
      'DHN-72X16/DG-585W',
      'Otro Modelo DAH Solar'
    ],
    'Anhui Solar': [
      'PF620M-SN',
      'PF625BC-SN',
      'PF630M-SN',
      'PF635BC-SN',
      'PF640M-SN',
      'PF645BC-SN',
      'Otro Modelo Anhui Solar'
    ],
    'Ulica Solar': [
      'UL-540M-144HV 540W Mono PERC',
      'UL-545M-144HV 545W Mono PERC',
      'UL-550M-144HV 550W Mono PERC',
      'UL-555M-144HV 555W Mono PERC',
      'UL-580M-144HV 580W N-type TOPCon',
      'UL-585M-144HV 585W N-type TOPCon',
      'UL-590M-144HV 590W N-type TOPCon',
      'Otro Modelo Ulica Solar'
    ],
    'Otra Marca (Certificada SEC)': [
      'Panel Fotovoltaico Monocristalino 400W - 450W',
      'Panel Fotovoltaico Monocristalino 500W - 550W',
      'Panel Fotovoltaico Monocristalino 550W - 600W',
      'Panel Fotovoltaico N-Type TOPCon 600W - 650W',
      'Panel Fotovoltaico Bifacial N-Type 650W - 700W',
      'Panel Fotovoltaico Personalizado'
    ]
  });

  const [isAddingCustomPanel, setIsAddingCustomPanel] = useState(false);
  const [customPanelBrand, setCustomPanelBrand] = useState('');
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [newCustomBrandInput, setNewCustomBrandInput] = useState('');
  const [customPanelModelName, setCustomPanelModelName] = useState('');
  const [customPanelWatts, setCustomPanelWatts] = useState('550');

  const [isAddingCustomPvBrand, setIsAddingCustomPvBrand] = useState(false);
  const [newPvBrandName, setNewPvBrandName] = useState('');
  const [newPvBrandFirstModel, setNewPvBrandFirstModel] = useState('');
  const [newPvBrandWatts, setNewPvBrandWatts] = useState('550');

  const [isAddingCustomBatteryBrand, setIsAddingCustomBatteryBrand] = useState(false);
  const [newBatteryBrandName, setNewBatteryBrandName] = useState('');
  const [newBatteryFirstModelName, setNewBatteryFirstModelName] = useState('');
  const [newBatteryFirstModelKwh, setNewBatteryFirstModelKwh] = useState('5.12');

  const [isAddingCustomBatteryModel, setIsAddingCustomBatteryModel] = useState(false);
  const [customBatteryBrandForModel, setCustomBatteryBrandForModel] = useState('');
  const [newBatteryModelName, setNewBatteryModelName] = useState('');
  const [newBatteryModelKwh, setNewBatteryModelKwh] = useState('5.12');

  const [installerList, setInstallerList] = useState<string[]>([
    'FELIPE VERAGUA',
    'SEBASTIAN LEIVA',
    'CARLOS HUMERES',
    'XAVIER CORNEJO',
    'BASTIAN HIDALGO'
  ]);
  const [isAddingCustomInstaller, setIsAddingCustomInstaller] = useState(false);
  const [newInstallerName, setNewInstallerName] = useState('');

  const systemTypes: SystemType[] = ['On-Grid (Netbilling)', 'Off-Grid (Aislado)', 'Híbrido (Con Baterías)'];

  const inverterPowers = [
    '1 kW', '1.5 kW', '2 kW', '2.5 kW', '3 kW', '3.6 kW', '4 kW', '4.6 kW',
    '5 kW', '6 kW', '7 kW', '8 kW', '9 kW', '10 kW', '12 kW', '15 kW',
    '17 kW', '20 kW', '25 kW', '30 kW', '33 kW', '36 kW', '40 kW', '50 kW',
    '60 kW', '75 kW', '80 kW', '90 kW', '100 kW'
  ];

  const mpptOptions = [
    '1 MPPT', '2 MPPTs', '3 MPPTs', '4 MPPTs', '6 MPPTs', '8 MPPTs', '10 MPPTs', '12 MPPTs'
  ];

  const stringOptions = [
    '1 String', '2 Strings', '3 Strings', '4 Strings', '5 Strings', '6 Strings', '8 Strings', '10 Strings', '12 Strings', '16 Strings', '20 Strings'
  ];

  const parseNumStrings = (val?: string): number => {
    if (!val) return 0;
    const match = val.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const extractPanelWattage = (modelStr?: string): number => {
    if (!modelStr) return 550;
    const wMatch = modelStr.match(/(\d{3,4})\s*W/i);
    if (wMatch && wMatch[1]) {
      const val = parseInt(wMatch[1], 10);
      if (val >= 100 && val <= 1000) return val;
    }
    const numMatches = modelStr.match(/(?:-|\s|^)(\d{3})(?:M|T|MS|W|BC|SN|DG|MB|AG|\b)/gi);
    if (numMatches) {
      for (const m of numMatches) {
        const digits = m.match(/\d{3}/);
        if (digits) {
          const val = parseInt(digits[0], 10);
          if (val >= 300 && val <= 800) return val;
        }
      }
    }
    const genericMatch = modelStr.match(/\b(3\d\d|4\d\d|5\d\d|6\d\d|7\d\d)\b/);
    if (genericMatch) {
      return parseInt(genericMatch[1], 10);
    }
    return 550;
  };

  const numStrings = parseNumStrings(technical.stringsCount);
  const unitPanelWattage = extractPanelWattage(technical.panelsCountAndPower);

  const secCertifiedPvBrands = [
    'Jinko Solar',
    'Canadian Solar',
    'LONGi Solar',
    'JA Solar',
    'Risen Energy',
    'Astronergy (Chint)',
    'DAH Solar',
    'Anhui Solar',
    'Ulica Solar',
    'Otra Marca (Certificada SEC)'
  ];

  const secCertifiedPvModels: Record<string, string[]> = {
    'Jinko Solar': [
      'JKM550M-72HL4 550W Mono PERC Half-Cell',
      'JKM555M-72HL4 555W Mono PERC Half-Cell',
      'JKM560M-72HL4 560W Mono PERC Half-Cell',
      'JKM565M-72HL4-V 565W Mono PERC 1500V',
      'JKM570M-72HL4-V 570W Mono PERC 1500V',
      'JKM575M-72HL4-V 575W Mono PERC 1500V',
      'JKM580M-72HL4-V 580W Mono PERC 1500V',
      'Tiger Neo N-type JKM585N-72HL4-V',
      'Tiger Neo N-type JKM590N-72HL4-V',
      'Tiger Neo N-type JKM595N-72HL4-V',
      'Tiger Neo N-type JKM600N-72HL4-V',
      'Tiger Neo N-type JKM615N-78HL4-V',
      'Tiger Neo N-type JKM620N-78HL4-V',
      'Tiger Neo N-type JKM625N-78HL4-V',
      'Tiger Neo N-type JKM630N-78HL4-V',
      'Otro Modelo Jinko Solar'
    ],
    'Canadian Solar': [
      'HiKu6 CS6W-545MS',
      'HiKu6 CS6W-550MS',
      'HiKu6 CS6W-555MS',
      'CS6W-585T',
      'CS6.2-66TB-615',
      'CS6.2-66TB-620 (620W TOPCon Bifacial)',
      'LR7-72HVH-640M',
      'BiHiKu6 CS6W-540MB-AG',
      'BiHiKu6 CS6W-550MB-AG',
      'BiHiKu6 CS6W-555MB-AG',
      'HiKu7 CS7N-650MS',
      'HiKu7 CS7N-655MS',
      'HiKu7 CS7N-660MS',
      'HiKu7 CS7N-670MS',
      'BiHiKu7 CS7N-665TB-AG',
      'BiHiKu7 CS7N-690TB-AG',
      'Otro Modelo Canadian Solar'
    ],
    'LONGi Solar': [
      'LR5-72HPH-550M',
      'LR5-72HPH-555M',
      'LR5-72HTH-565M',
      'LR5-72HTH-570M',
      'LR5-72HTH-575M',
      'LR5-72HTH-580M',
      'LR5-72HGB-590M',
      'LR5-72HGB-600M',
      'LR8-66HGD-615M',
      'LR8-66HGD-620M',
      'LR8-66HGD-625M',
      'LR7-72HVH-640M',
      'Otro Modelo LONGi Solar'
    ],
    'JA Solar': [
      'JAM72S30-540/MR',
      'JAM72S30-545/MR',
      'JAM72S30-550/MR',
      'JAM72S30-555/MR',
      'JAM72S30-560/MR',
      'JAM72D30-540/MB',
      'JAM72D30-550/MB',
      'JAM72D40-570/GB',
      'JAM72D40-580/GB',
      'JAM72D42-620/LB',
      'Otro Modelo JA Solar'
    ],
    'Risen Energy': [
      'Titan RSM110-8-535M',
      'Titan RSM110-8-540M',
      'Titan RSM110-8-545M',
      'Titan RSM110-8-550M',
      'Titan RSM110-8-555M',
      'Titan RSM130-8-650M',
      'Titan RSM130-8-660M',
      'Titan HJT Hyper-ion RSM110-8-700H',
      'Otro Modelo Risen Energy'
    ],
    'Astronergy (Chint)': [
      'CHSM54M-HC 410W',
      'CHSM54M-HC 415W',
      'CHSM72M-HC 540W',
      'CHSM72M-HC 545W',
      'CHSM72M-HC 550W',
      'CHSM72M-HC 555W',
      'Astro N5 CHSM72N(DG)/F-BH 570W',
      'Astro N5 CHSM72N(DG)/F-BH 575W',
      'Astro N5 CHSM72N(DG)/F-BH 580W',
      'Otro Modelo Astronergy'
    ],
    'DAH Solar': [
      'DHN-72X16/FS-550W',
      'DHN-72X16/FS-555W',
      'DHN-72X16/FS-560W',
      'DHN-72X16/DG-585W',
      'Otro Modelo DAH Solar'
    ],
    'Anhui Solar': [
      'PF620M-SN',
      'PF625BC-SN',
      'Otro Modelo Anhui Solar'
    ],
    'Ulica Solar': [
      'PF620MDG-UL (620W Bifacial Dual Glass)',
      'Otro Modelo Ulica Solar'
    ],
    'Otra Marca (Certificada SEC)': [
      'Monocristalino PERC 400W - 450W',
      'Monocristalino PERC 500W - 560W',
      'TOPCon N-Type 570W - 600W',
      'Bifacial PERC/TOPCon 540W - 700W',
      'Otro Modelo Panel Fotovoltaico'
    ]
  };

  const secCertifiedInverterBrands = [
    'Victron Energy (Off-Grid / Híbrido)',
    'Voltronic Power / Axpert (Off-Grid)',
    'Huawei',
    'Fronius',
    'GoodWe',
    'Solis',
    'Must Energy (Off-Grid)',
    'Otra Marca Inversor'
  ];

  const secInverterModels: Record<string, string[]> = {
    'Victron Energy (Off-Grid / Híbrido)': [
      'MultiPlus-II 48/3000/35-32 (3 kVA)',
      'MultiPlus-II 48/5000/70-50 (5 kVA)',
      'MultiPlus-II 48/8000/110-100 (8 kVA)',
      'MultiPlus-II 48/10000/140-100 (10 kVA)',
      'MultiPlus-II 24/3000/70-32 (3 kVA)',
      'Quattro 48/8000/110-100/100 (8 kVA)',
      'Quattro 48/10000/140-100/100 (10 kVA)',
      'Quattro 48/15000/200-100/100 (15 kVA)',
      'EasySolar-II 48/3000/35-32 MPPT 250/70',
      'EasySolar-II 48/5000/70-50 MPPT 250/100',
      'Phoenix Inverter VE.Direct 12V 1200VA',
      'Phoenix Inverter VE.Direct 24V 3000VA',
      'Phoenix Inverter VE.Direct 48V 5000VA',
      'RS Smart Solar 48/6000',
      'Inverter RS Smart Solar 48/6000 230V',
      'Otro Modelo Victron Energy'
    ],
    'Voltronic Power / Axpert (Off-Grid)': [
      'Axpert VM III 3000W-24V',
      'Axpert VM III 5000W-48V',
      'Axpert VM IV 3600W-24V',
      'Axpert VM IV 5600W-48V',
      'Axpert KING II 5KW 48V',
      'Axpert KING II 6KW 48V',
      'Axpert MAX 7200W-48V Dual MPPT',
      'Axpert MAX II 8000W-48V',
      'Axpert MAX II 11000W-48V',
      'Axpert MKS III 3000W 24V',
      'Axpert MKS III 5000W 48V',
      'InfiniSolar V II 3KW (Híbrido)',
      'InfiniSolar V II 5KW (Híbrido)',
      'InfiniSolar WP 10KW Three Phase',
      'InfiniSolar WP 15KW Three Phase',
      'Otro Modelo Voltronic / Axpert'
    ],
    'Huawei': [
      'SUN2000-2KTL-L1 (2kW Monofásico)',
      'SUN2000-3KTL-L1 (3kW Monofásico)',
      'SUN2000-4KTL-L1 (4kW Monofásico)',
      'SUN2000-4.6KTL-L1 (4.6kW Monofásico)',
      'SUN2000-5KTL-L1 (5kW Monofásico)',
      'SUN2000-6KTL-L1 (6kW Monofásico)',
      'SUN2000-3KTL-M1 (3kW Trifásico Híbrido)',
      'SUN2000-4KTL-M1 (4kW Trifásico Híbrido)',
      'SUN2000-5KTL-M1 (5kW Trifásico Híbrido)',
      'SUN2000-6KTL-M1 (6kW Trifásico Híbrido)',
      'SUN2000-8KTL-M1 (8kW Trifásico Híbrido)',
      'SUN2000-10KTL-M1 (10kW Trifásico Híbrido)',
      'SUN2000-12KTL-M3 (12kW Trifásico)',
      'SUN2000-15KTL-M3 (15kW Trifásico)',
      'SUN2000-17KTL-M3 (17kW Trifásico)',
      'SUN2000-20KTL-M3 (20kW Trifásico)',
      'SUN2000-30KTL-M3 (30kW Trifásico)',
      'SUN2000-40KTL-M3 (40kW Trifásico)',
      'SUN2000-50KTL-M3 (50kW Trifásico)',
      'SUN2000-100KTL-M2 (100kW Trifásico)',
      'SUN2000-115KTL-M1 (115kW Trifásico)',
      'Otro Modelo Huawei'
    ],
    'Fronius': [
      'Primo 3.0-1 (3kW Monofásico)',
      'Primo 3.6-1 (3.6kW Monofásico)',
      'Primo 4.0-1 (4kW Monofásico)',
      'Primo 4.6-1 (4.6kW Monofásico)',
      'Primo 5.0-1 (5kW Monofásico)',
      'Primo 6.0-1 (6kW Monofásico)',
      'Primo 8.2-1 (8.2kW Monofásico)',
      'Primo GEN24 3.0 Plus (Híbrido 3kW)',
      'Primo GEN24 4.0 Plus (Híbrido 4kW)',
      'Primo GEN24 5.0 Plus (Híbrido 5kW)',
      'Primo GEN24 6.0 Plus (Híbrido 6kW)',
      'Symo 3.0-3-M (3kW Trifásico)',
      'Symo 4.5-3-M (4.5kW Trifásico)',
      'Symo 5.0-3-M (5kW Trifásico)',
      'Symo 6.0-3-M (6kW Trifásico)',
      'Symo 8.2-3-M (8.2kW Trifásico)',
      'Symo 10.0-3-M (10kW Trifásico)',
      'Symo 12.5-3-M (12.5kW Trifásico)',
      'Symo 15.0-3-M (15kW Trifásico)',
      'Symo 20.0-3-M (20kW Trifásico)',
      'Symo GEN24 6.0 Plus (Híbrido 6kW)',
      'Symo GEN24 8.0 Plus (Híbrido 8kW)',
      'Symo GEN24 10.0 Plus (Híbrido 10kW)',
      'Tauro 50-3-P (50kW Industrial)',
      'Tauro ECO 50-3-P (50kW Eco)',
      'Tauro ECO 100-3-P (100kW Eco)',
      'Otro Modelo Fronius'
    ],
    'GoodWe': [
      'GW3000D-NS (3kW Monofásico)',
      'GW4200D-NS (4.2kW Monofásico)',
      'GW5000D-NS (5kW Monofásico)',
      'GW6000D-NS (6kW Monofásico)',
      'GW5000-MS (5kW Monofásico)',
      'GW8500-MS (8.5kW Monofásico)',
      'GW3000-EH (3kW Híbrido Monofásico)',
      'GW5000-EH (5kW Híbrido Monofásico)',
      'GW6000-EH (6kW Híbrido Monofásico)',
      'GW5K-ET (5kW Híbrido Trifásico)',
      'GW8K-ET (8kW Híbrido Trifásico)',
      'GW10K-ET (10kW Híbrido Trifásico)',
      'GW5000-ES-20 (5kW Off-Grid / Hybrid)',
      'GW10K-DT (10kW Trifásico)',
      'GW15K-DT (15kW Trifásico)',
      'GW20K-DT (20kW Trifásico)',
      'GW25K-DT (25kW Trifásico)',
      'GW50KS-MT (50kW Trifásico)',
      'GW80KS-MT (80kW Trifásico)',
      'GW100K-HT (100kW Trifásico)',
      'Otro Modelo GoodWe'
    ],
    'Solis': [
      'S6-EH1P3K-L-PLUS (3kW Híbrido Monofásico 48V)',
      'S6-EH1P3.6K-L-PLUS (3.6kW Híbrido Monofásico 48V)',
      'S6-EH1P4.6K-L-PLUS (4.6kW Híbrido Monofásico 48V)',
      'S6-EH1P5K-L-PLUS (5kW Híbrido Monofásico 48V)',
      'S6-EH1P6K-L-PLUS (6kW Híbrido Monofásico 48V)',
      'S6-EH1P8K-L-PLUS (8kW Híbrido Monofásico 48V)',
      'S6-EH1P5K-L-PRO (5kW Híbrido Pro Monofásico)',
      'S6-EH1P6K-L-PRO (6kW Híbrido Pro Monofásico)',
      'S6-EH1P8K-L-PRO (8kW Híbrido Pro Monofásico)',
      'RHI-3K-48ES-5G (3kW Híbrido 48V)',
      'RHI-3.6K-48ES-5G (3.6kW Híbrido 48V)',
      'RHI-4.6K-48ES-5G (4.6kW Híbrido 48V)',
      'RHI-5K-48ES-5G (5kW Híbrido 48V)',
      'RHI-6K-48ES-5G (6kW Híbrido 48V)',
      'S6-EH3P3K-H-EU (3kW Híbrido Trifásico HV)',
      'S6-EH3P4K-H-EU (4kW Híbrido Trifásico HV)',
      'S6-EH3P5K-H-EU (5kW Híbrido Trifásico HV)',
      'S6-EH3P6K-H-EU (6kW Híbrido Trifásico HV)',
      'S6-EH3P8K-H-EU (8kW Híbrido Trifásico HV)',
      'S6-EH3P10K-H-EU (10kW Híbrido Trifásico HV)',
      'S6-EH3P12K-H-EU (12kW Híbrido Trifásico HV)',
      'S6-EH3P15K-H-EU (15kW Híbrido Trifásico HV)',
      'S6-EH3P20K-H-EU (20kW Híbrido Trifásico HV)',
      'S6-EH3P30K-H-EU (30kW Híbrido Trifásico HV)',
      'S6-EH3P40K-H-EU (40kW Híbrido Comercial HV)',
      'S6-EH3P50K-H-EU (50kW Híbrido Comercial HV)',
      'RHI-3P5K-HPE-5G / RHI-3P10K-HPE-5G (Trifásico Híbrido)',
      'RAI-3K-48ES-5G (3kW AC-Coupled Retrofit)',
      'S6-GR1P2.5K-M (2.5kW Monofásico On-Grid)',
      'S6-GR1P3K-M (3kW Monofásico On-Grid)',
      'S6-GR1P4K-M (4kW Monofásico On-Grid)',
      'S6-GR1P5K-M (5kW Monofásico On-Grid)',
      'S6-GR1P6K-M (6kW Monofásico On-Grid)',
      'S5-GC15K (15kW Trifásico On-Grid)',
      'S5-GC20K (20kW Trifásico On-Grid)',
      'S5-GC30K (30kW Trifásico On-Grid)',
      'S5-GC50K (50kW Trifásico On-Grid)',
      'S5-GC80K (80kW Trifásico On-Grid)',
      'S5-GC110K (110kW Trifásico On-Grid)',
      'Otro Modelo Solis'
    ],
    'Must Energy (Off-Grid)': [
      'PV18-1012 VPM (1KW 12V Off-Grid)',
      'PV18-3024 VPM (3KW 24V Off-Grid)',
      'PV18-5048 VPK (5KW 48V Off-Grid)',
      'PV18-5248 VHM (5.2KW 48V Off-Grid)',
      'PH18-3024 PRO (3KW 24V Híbrido Off-Grid)',
      'PH18-5048 PRO (5KW 48V Híbrido Off-Grid)',
      'PH18-5548 PRO (5.5KW 48V Híbrido Off-Grid)',
      'Otro Modelo Must Energy'
    ],
    'Otra Marca Inversor': [
      'Inversor Monofásico On-Grid (1kW - 6kW)',
      'Inversor Monofásico On-Grid (7kW - 10kW)',
      'Inversor Trifásico On-Grid (5kW - 20kW)',
      'Inversor Trifásico On-Grid (25kW - 100kW)',
      'Inversor Híbrido Monofásico Con Baterías',
      'Inversor Híbrido Trifásico Con Baterías',
      'Inversor Off-Grid / Isla Personalizado'
    ]
  };

  const [lithiumBatteryBrandsList, setLithiumBatteryBrandsList] = useState<string[]>([
    'Sin Baterías (On-Grid / Sin almacenamiento)',
    'Dyness',
    'Pylontech',
    'Nimac',
    'Narada',
    'Huawei',
    'BYD',
    'Growatt',
    'Felicitysolar',
    'GoodWe',
    'Victron Energy',
    'Otra marca / Personalizado'
  ]);

  const [lithiumBatteryModelsMap, setLithiumBatteryModelsMap] = useState<Record<string, string[]>>({
    'Dyness': [
      'DL5.0C, 100Ah - 5.12 kWh',
      'PowerBrick wheel-Top cover Battery 51.2V 280Ah 14.341 kWh',
      'PowerBrick SC Battery 51.2V 314Ah 16.076 kWh'
    ],
    'Pylontech': [
      'Fidus Plus 16 kWh',
      '48V UP5000 4.8 kWh',
      '48V US5000 4.8 kWh'
    ],
    'Nimac': [
      '48V - 100AH NM48100 (4.8 kWh)',
      '51.2V NM51.2-200 10.24 kWh',
      '51.2V NM51.2-300 15.36 kWh',
      '51.2V NM51.2-400 20.48 kWh'
    ],
    'Narada': [
      '48V - 100AH NESR48100 (4.8 kWh)'
    ],
    'Huawei': [
      'LUNA2000-5-S0 (5 kWh)',
      'LUNA2000-10-S0 (10 kWh)',
      'LUNA2000-15-S0 (15 kWh)',
      'LUNA2000-7-S1 (7 kWh)',
      'LUNA2000-14-S1 (14 kWh)',
      'LUNA2000-21-S1 (21 kWh)'
    ],
    'BYD': [
      'Battery-Box Premium HVS 5.1 (5.1 kWh)',
      'Battery-Box Premium HVS 7.7 (7.7 kWh)',
      'Battery-Box Premium HVS 10.2 (10.2 kWh)',
      'Battery-Box Premium HVM 11.0 (11.0 kWh)',
      'Battery-Box Premium HVM 13.8 (13.8 kWh)',
      'Battery-Box Premium LVS 4.0 (3.84 kWh)',
      'Battery-Box Premium LVS 8.0 (7.68 kWh)',
      'Battery-Box Premium LVS 12.0 (11.52 kWh)'
    ],
    'Growatt': [
      'ARK 2.5L-A1 (2.56 kWh Low Voltage)',
      'ARK 5.1L (5.12 kWh Low Voltage)',
      'ARK 2.5H-A1 (High Voltage)',
      'AXE 5.0L (5.0 kWh Low Voltage)'
    ],
    'Felicitysolar': [
      'LPBF48100-H (5.12 kWh / 48V 100Ah)',
      'LPBF48200-H (10.24 kWh / 48V 200Ah)',
      'LPBA48100-OL (5.12 kWh / 48V 100Ah)',
      'LPBA48200-OL (10.24 kWh / 48V 200Ah)',
      'LUX-E-48100LG01 (5.12 kWh / 48V 100Ah)'
    ],
    'GoodWe': [
      'Lynx Home U Series (5.4 kWh Low Voltage)',
      'Lynx Home F Series (6.6 kWh - 16.4 kWh High Voltage)',
      'Lynx Home F Plus+ Series'
    ],
    'Victron Energy': [
      'Lithium Battery Smart 12.8V / 200Ah (2.56 kWh)',
      'Lithium Battery Smart 25.6V / 200Ah (5.12 kWh)',
      'SuperPack 12.8V / 100Ah (1.28 kWh LFP con BMS integrado)',
      'SuperPack 25.6V / 50Ah (1.28 kWh LFP)'
    ],
    'Otra marca / Personalizado': [
      'Batería Litio LFP 48V / 100Ah (5.12 kWh)',
      'Batería Litio LFP 48V / 200Ah (10.24 kWh)',
      'Batería Litio LFP 24V / 100Ah (2.56 kWh)',
      'Batería Litio High Voltage (HV)',
      'Banco de Baterías de Litio Personalizado'
    ]
  });

  const parseBrandAndModel = (val: string) => {
    if (!val) return { brand: '', model: '' };
    const foundBrand = pvBrandsList.find(b => val.startsWith(b));
    if (foundBrand) {
      const remainder = val.slice(foundBrand.length).replace(/^ - /, '').trim();
      return { brand: foundBrand, model: remainder };
    }
    return { brand: '', model: val };
  };

  const parseInverterBrandAndModel = (val: string) => {
    if (!val) return { brand: '', model: '' };
    const foundBrand = secCertifiedInverterBrands.find(b => val.startsWith(b));
    if (foundBrand) {
      const remainder = val.slice(foundBrand.length).replace(/^ - /, '').trim();
      return { brand: foundBrand, model: remainder };
    }
    return { brand: '', model: val };
  };

  const parseBatteryBrandAndModel = (val: string) => {
    if (!val) return { brand: '', model: '' };
    const foundBrand = lithiumBatteryBrandsList.find(b => val.startsWith(b));
    if (foundBrand) {
      const remainder = val.slice(foundBrand.length).replace(/^ - /, '').replace(/ x \d+ u\..*$/, '').trim();
      return { brand: foundBrand, model: remainder };
    }
    return { brand: '', model: val };
  };

  const extractBatteryKwh = (modelStr?: string): number => {
    if (!modelStr) return 0;
    const match = modelStr.match(/(\d+(?:[\.,]\d+)?)\s*kWh/i);
    if (match && match[1]) {
      const val = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(val) && val > 0) return val;
    }
    return 0;
  };

  const formatBatteryInfo = (brand: string, model: string, count: number) => {
    if (!brand || brand.startsWith('Sin Baterías')) {
      return {
        info: 'Sin Baterías',
        totalKwhStr: '0.00 kWh'
      };
    }
    const unitKwh = extractBatteryKwh(model);
    const totalKwhNum = unitKwh * count;
    const totalKwhFormatted = totalKwhNum.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalKwhStr = `${totalKwhFormatted} kWh`;

    const modelPart = model ? `${brand} - ${model}` : brand;
    let info = modelPart;
    if (unitKwh > 0) {
      info = `${modelPart} x ${count} u. | Capacidad Total: ${totalKwhStr}`;
    } else if (count > 1) {
      info = `${modelPart} x ${count} u.`;
    }

    return { info, totalKwhStr };
  };

  const handleSaveCustomPanel = () => {
    const brandToUse = isCustomBrand ? newCustomBrandInput.trim() : customPanelBrand.trim();
    const modelToUse = customPanelModelName.trim();
    const wattsToUse = parseInt(customPanelWatts, 10) || 550;

    if (!brandToUse) {
      alert('Por favor ingrese o seleccione una marca de panel.');
      return;
    }
    if (!modelToUse) {
      alert('Por favor ingrese el modelo del panel.');
      return;
    }

    let formattedModel = modelToUse;
    if (!formattedModel.toLowerCase().includes('w')) {
      formattedModel = `${modelToUse} ${wattsToUse}W`;
    }

    setPvBrandsList((prev) => {
      if (!prev.includes(brandToUse)) {
        const copy = [...prev];
        const otraIdx = copy.indexOf('Otra Marca (Certificada SEC)');
        if (otraIdx !== -1) {
          copy.splice(otraIdx, 0, brandToUse);
        } else {
          copy.push(brandToUse);
        }
        return copy;
      }
      return prev;
    });

    setPvModelsMap((prev) => {
      const existing = prev[brandToUse] || [];
      if (!existing.includes(formattedModel)) {
        return {
          ...prev,
          [brandToUse]: [formattedModel, ...existing]
        };
      }
      return prev;
    });

    const fullStr = `${brandToUse} - ${formattedModel}`;

    const currentConfigs = getStringConfigList();
    const updatedConfigs = currentConfigs.map(c => ({
      ...c,
      panelBrand: brandToUse,
      panelModel: formattedModel,
      panelWatts: wattsToUse
    }));
    const updatedSummary = formatPanelsSummaryFromConfigs(updatedConfigs);

    onChangeTechnical({
      ...technical,
      panelsCountAndPower: fullStr,
      stringConfigs: updatedConfigs,
      stringPanelCounts: updatedConfigs.map(c => c.panelsCount),
      panelsPerString: updatedSummary || technical.panelsPerString
    });

    setIsAddingCustomPanel(false);
    setCustomPanelModelName('');
    setIsCustomBrand(false);
    setNewCustomBrandInput('');
  };

  const handleSaveCustomInstaller = () => {
    const formattedName = newInstallerName.trim().toUpperCase();

    if (!formattedName) {
      alert('Por favor ingrese el nombre del nuevo instalador.');
      return;
    }

    setInstallerList((prev) => {
      if (!prev.includes(formattedName)) {
        return [...prev, formattedName];
      }
      return prev;
    });

    onChangeInstaller({
      ...installer,
      name: formattedName
    });

    setIsAddingCustomInstaller(false);
    setNewInstallerName('');
  };

  const handleSaveCustomPvBrand = () => {
    const brandName = newPvBrandName.trim();
    const modelName = newPvBrandFirstModel.trim();
    const watts = parseInt(newPvBrandWatts, 10) || 550;

    if (!brandName) {
      alert('Por favor ingrese el nombre de la nueva marca de panel.');
      return;
    }
    if (!modelName) {
      alert('Por favor ingrese un modelo para la nueva marca.');
      return;
    }

    let formattedModel = modelName;
    if (!formattedModel.toLowerCase().includes('w')) {
      formattedModel = `${modelName} ${watts}W`;
    }

    setPvBrandsList((prev) => {
      if (!prev.includes(brandName)) {
        const copy = [...prev];
        const otraIdx = copy.indexOf('Otra Marca (Certificada SEC)');
        if (otraIdx !== -1) {
          copy.splice(otraIdx, 0, brandName);
        } else {
          copy.push(brandName);
        }
        return copy;
      }
      return prev;
    });

    setPvModelsMap((prev) => {
      const existing = prev[brandName] || [];
      if (!existing.includes(formattedModel)) {
        return {
          ...prev,
          [brandName]: [formattedModel, ...existing]
        };
      }
      return prev;
    });

    const fullStr = `${brandName} - ${formattedModel}`;

    const currentConfigs = getStringConfigList();
    const updatedConfigs = currentConfigs.map(c => ({
      ...c,
      panelBrand: brandName,
      panelModel: formattedModel,
      panelWatts: watts
    }));
    const updatedSummary = formatPanelsSummaryFromConfigs(updatedConfigs);

    onChangeTechnical({
      ...technical,
      panelsCountAndPower: fullStr,
      stringConfigs: updatedConfigs,
      stringPanelCounts: updatedConfigs.map(c => c.panelsCount),
      panelsPerString: updatedSummary || technical.panelsPerString
    });

    setIsAddingCustomPvBrand(false);
    setNewPvBrandName('');
    setNewPvBrandFirstModel('');
  };

  const handleSaveCustomBatteryBrand = () => {
    const brandName = newBatteryBrandName.trim();
    const modelName = newBatteryFirstModelName.trim();
    const kwhNum = parseFloat(newBatteryFirstModelKwh.replace(',', '.')) || 5.12;

    if (!brandName) {
      alert('Por favor ingrese el nombre de la nueva marca de batería.');
      return;
    }
    if (!modelName) {
      alert('Por favor ingrese un modelo para la nueva marca.');
      return;
    }

    let formattedModel = modelName;
    if (!formattedModel.toLowerCase().includes('kwh')) {
      formattedModel = `${modelName} (${kwhNum} kWh)`;
    }

    setLithiumBatteryBrandsList((prev) => {
      if (!prev.includes(brandName)) {
        const copy = [...prev];
        const otraIdx = copy.indexOf('Otra marca / Personalizado');
        if (otraIdx !== -1) {
          copy.splice(otraIdx, 0, brandName);
        } else {
          copy.push(brandName);
        }
        return copy;
      }
      return prev;
    });

    setLithiumBatteryModelsMap((prev) => {
      const existing = prev[brandName] || [];
      if (!existing.includes(formattedModel)) {
        return {
          ...prev,
          [brandName]: [formattedModel, ...existing]
        };
      }
      return prev;
    });

    const count = technical.batteryCount || 1;
    const { info, totalKwhStr } = formatBatteryInfo(brandName, formattedModel, count);

    onChangeTechnical({
      ...technical,
      batteryBrand: brandName,
      batteryModel: formattedModel,
      batteryCount: count,
      batteryTotalKwh: totalKwhStr,
      batteryInfo: info
    });

    setIsAddingCustomBatteryBrand(false);
    setNewBatteryBrandName('');
    setNewBatteryFirstModelName('');
  };

  const handleSaveCustomBatteryModel = () => {
    const brandName = customBatteryBrandForModel.trim();
    const modelName = newBatteryModelName.trim();
    const kwhNum = parseFloat(newBatteryModelKwh.replace(',', '.')) || 5.12;

    if (!brandName) {
      alert('Por favor seleccione o ingrese una marca para la batería.');
      return;
    }
    if (!modelName) {
      alert('Por favor ingrese el nombre o código del modelo de batería.');
      return;
    }

    let formattedModel = modelName;
    if (!formattedModel.toLowerCase().includes('kwh')) {
      formattedModel = `${modelName} (${kwhNum} kWh)`;
    }

    setLithiumBatteryModelsMap((prev) => {
      const existing = prev[brandName] || [];
      if (!existing.includes(formattedModel)) {
        return {
          ...prev,
          [brandName]: [formattedModel, ...existing]
        };
      }
      return prev;
    });

    const count = technical.batteryCount || 1;
    const { info, totalKwhStr } = formatBatteryInfo(brandName, formattedModel, count);

    onChangeTechnical({
      ...technical,
      batteryBrand: brandName,
      batteryModel: formattedModel,
      batteryCount: count,
      batteryTotalKwh: totalKwhStr,
      batteryInfo: info
    });

    setIsAddingCustomBatteryModel(false);
    setNewBatteryModelName('');
  };

  const { brand: currentBrand, model: currentModel } = parseBrandAndModel(technical.panelsCountAndPower);
  const availableModels = currentBrand ? (pvModelsMap[currentBrand] || []) : [];

  const { brand: currentInverterBrand, model: currentInverterModel } = parseInverterBrandAndModel(technical.inverterBrandModel);
  const availableInverterModels = currentInverterBrand ? (secInverterModels[currentInverterBrand] || []) : [];

  const { brand: currentBatteryBrand, model: currentBatteryModel } = parseBatteryBrandAndModel(technical.batteryInfo || '');
  const availableBatteryModels = currentBatteryBrand ? (lithiumBatteryModelsMap[currentBatteryBrand] || []) : [];

  // String configuration list resolver
  const getStringConfigList = (): StringConfigItem[] => {
    const configs = technical.stringConfigs || [];
    const counts = technical.stringPanelCounts || [];
    const defaultBrand = currentBrand || pvBrandsList[0] || 'Jinko Solar';
    const defaultModel = currentModel || pvModelsMap[defaultBrand]?.[0] || '';
    const defaultFull = defaultModel ? `${defaultBrand} - ${defaultModel}` : defaultBrand;
    const defaultWatts = extractPanelWattage(defaultFull);

    const result: StringConfigItem[] = [];
    for (let i = 0; i < numStrings; i++) {
      const existing = configs[i];
      const pCount = existing?.panelsCount !== undefined 
        ? existing.panelsCount 
        : (counts[i] !== undefined ? counts[i] : 10);
      const brand = existing?.panelBrand || defaultBrand;
      const model = existing?.panelModel || defaultModel;
      const fullStr = model ? `${brand} - ${model}` : brand;
      const watts = existing?.panelWatts || extractPanelWattage(fullStr);

      result.push({
        stringIndex: i + 1,
        panelsCount: pCount,
        panelBrand: brand,
        panelModel: model,
        panelWatts: watts
      });
    }
    return result;
  };

  const activeStringConfigs = getStringConfigList();
  const totalPanelsCalculated = activeStringConfigs.reduce((acc, curr) => acc + (curr.panelsCount || 0), 0);
  const totalPvWattsCalculated = activeStringConfigs.reduce((acc, curr) => acc + ((curr.panelsCount || 0) * (curr.panelWatts || 550)), 0);
  const totalPvKwpCalculated = (totalPvWattsCalculated / 1000).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatPanelsSummaryFromConfigs = (configs: StringConfigItem[]): string => {
    if (!configs || configs.length === 0) return '';
    const totalPanels = configs.reduce((acc, curr) => acc + (curr.panelsCount || 0), 0);
    const totalWatts = configs.reduce((acc, curr) => acc + ((curr.panelsCount || 0) * (curr.panelWatts || 550)), 0);
    const kwp = (totalWatts / 1000).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const allSameCount = configs.every(c => c.panelsCount === configs[0]?.panelsCount);
    const allSameBrand = configs.every(c => c.panelBrand === configs[0]?.panelBrand);
    const allSameModel = configs.every(c => c.panelModel === configs[0]?.panelModel);

    let panelsText = '';
    if (allSameCount && allSameBrand && allSameModel && (configs[0]?.panelsCount || 0) > 0) {
      panelsText = `${configs[0].panelsCount} paneles por string (${totalPanels} total)`;
    } else {
      const breakdown = configs.map((c, i) => {
        const brandShort = c.panelBrand ? c.panelBrand.split(' ')[0] : 'Panel';
        return `S${i + 1}: ${c.panelsCount || 0}p (${brandShort} ${c.panelWatts || 550}W)`;
      }).join(', ');
      panelsText = `${breakdown} (Total: ${totalPanels} paneles)`;
    }

    if (totalPanels > 0) {
      return `${panelsText} | Potencia Total: ${totalWatts.toLocaleString('es-CL')} W (${kwp} kWp)`;
    }
    return panelsText;
  };

  const handleStringPanelCountChange = (idx: number, count: number) => {
    const configs = [...getStringConfigList()];
    if (configs[idx]) {
      configs[idx] = {
        ...configs[idx],
        panelsCount: count
      };
      const counts = configs.map(c => c.panelsCount);
      const summary = formatPanelsSummaryFromConfigs(configs);
      onChangeTechnical({
        ...technical,
        stringConfigs: configs,
        stringPanelCounts: counts,
        panelsPerString: summary
      });
    }
  };

  const handleStringBrandChange = (idx: number, newBrand: string) => {
    const configs = [...getStringConfigList()];
    if (configs[idx]) {
      const firstModel = pvModelsMap[newBrand]?.[0] || '';
      const fullStr = firstModel ? `${newBrand} - ${firstModel}` : newBrand;
      const watts = extractPanelWattage(fullStr);
      configs[idx] = {
        ...configs[idx],
        panelBrand: newBrand,
        panelModel: firstModel,
        panelWatts: watts
      };
      const counts = configs.map(c => c.panelsCount);
      const summary = formatPanelsSummaryFromConfigs(configs);
      onChangeTechnical({
        ...technical,
        stringConfigs: configs,
        stringPanelCounts: counts,
        panelsPerString: summary
      });
    }
  };

  const handleStringModelChange = (idx: number, newModel: string) => {
    const configs = [...getStringConfigList()];
    if (configs[idx]) {
      const brand = configs[idx].panelBrand || currentBrand || pvBrandsList[0] || 'Jinko Solar';
      const fullStr = newModel ? `${brand} - ${newModel}` : brand;
      const watts = extractPanelWattage(fullStr);
      configs[idx] = {
        ...configs[idx],
        panelModel: newModel,
        panelWatts: watts
      };
      const counts = configs.map(c => c.panelsCount);
      const summary = formatPanelsSummaryFromConfigs(configs);
      onChangeTechnical({
        ...technical,
        stringConfigs: configs,
        stringPanelCounts: counts,
        panelsPerString: summary
      });
    }
  };

  const handleCopyStringToAll = (idx: number) => {
    const configs = getStringConfigList();
    const source = configs[idx];
    if (!source) return;
    const updated = configs.map(c => ({
      ...c,
      panelBrand: source.panelBrand,
      panelModel: source.panelModel,
      panelWatts: source.panelWatts
    }));
    const counts = updated.map(c => c.panelsCount);
    const summary = formatPanelsSummaryFromConfigs(updated);
    onChangeTechnical({
      ...technical,
      stringConfigs: updated,
      stringPanelCounts: counts,
      panelsPerString: summary
    });
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por su navegador o dispositivo.');
      return;
    }
    setIsFetchingGps(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const formattedCoords = `Lat: ${lat}, Long: ${lng}`;
        onChangeTechnical({
          ...technical,
          gpsCoordinates: formattedCoords,
        });
        setIsFetchingGps(false);
        setGpsMessage('¡Coordenadas GPS capturadas exitosamente!');
        setTimeout(() => setGpsMessage(null), 3000);
      },
      (error) => {
        console.error('Error al obtener GPS:', error);
        setIsFetchingGps(false);
        let msg = 'Error al obtener la ubicación GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso de geolocalización denegado en el navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Información de ubicación no disponible.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Tiempo de espera agotado al obtener la ubicación GPS.';
        }
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div id="installer-client-form-card" className="bg-white border border-[#15803D]/40 mb-4 overflow-hidden shadow-xs">
      {/* Header Toggle */}
      <button
        id="btn-toggle-form"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-[#0F172A] via-[#14532D] to-[#15803D] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between transition-colors cursor-pointer border-b border-[#25A238]"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h2 className="text-sm sm:text-base font-serif italic text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#25A238]" />
              Información de Proyecto, Instalador & Cliente
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-emerald-100/80 font-sans">
              {client.name ? `${client.name} — ${client.address || 'Sin dirección'}` : 'Requisitos de la declaración TE4 ante la SEC'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {installer.name && client.name ? (
            <span className="bg-[#25A238] text-white border border-[#25A238] text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 font-bold shadow-xs">
              ✓ Registrado
            </span>
          ) : (
            <span className="border border-white/60 text-white text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5">
              Pendiente
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
        </div>
      </button>

      {/* Form Fields */}
      {isOpen && (
        <div className="p-3 sm:p-5 space-y-4 bg-[#F8FAF9]">
          {/* Grid 1: Instalador Certificado SEC */}
          <div className="bg-white p-3.5 border-l-4 border-l-[#15803D] border border-[#15803D]/20 space-y-2.5 shadow-2xs">
            <div className="border-b border-[#15803D]/30 pb-1.5 flex items-baseline justify-between">
              <h3 className="text-base font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                Datos del Instalador Certificado SEC
              </h3>
              <div className="flex items-center gap-2">
                {onResetForm && (
                  <button
                    type="button"
                    onClick={onResetForm}
                    className="text-[9px] font-bold text-[#E11D48] hover:text-[#BE123C] bg-rose-50 hover:bg-rose-100 border border-[#E11D48]/30 px-2 py-0.5 rounded-2xs cursor-pointer flex items-center gap-1 transition-colors"
                    title="Limpiar todos los datos del formulario e iniciar nuevo proceso"
                  >
                    <span>Limpiar Planilla</span>
                  </button>
                )}
                <label className="text-[9px] uppercase font-mono tracking-wider text-[#15803D] font-bold">Sección 01</label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70">
                    Nombre Completo Instalador *
                  </label>
                  <button
                    id="btn-add-custom-installer"
                    type="button"
                    onClick={() => setIsAddingCustomInstaller(true)}
                    className="text-[9px] font-bold text-[#15803D] hover:text-[#14532D] flex items-center gap-0.5 cursor-pointer bg-[#DCFCE7] hover:bg-[#bbf7d0] px-1.5 py-0.5 border border-[#15803D]/40 rounded-2xs transition-colors"
                    title="Agregar un nuevo instalador"
                  >
                    <Plus className="w-3 h-3 text-[#15803D]" />
                    <span>+ Instalador Nuevo</span>
                  </button>
                </div>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-40 pointer-events-none z-10" />
                  <select
                    id="select-installer-name"
                    value={installer.name}
                    onChange={(e) => onChangeInstaller({ ...installer, name: e.target.value })}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                  >
                    <option value="">Seleccione Instalador...</option>
                    {installerList.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  RUT del Instalador
                </label>
                <input
                  id="input-installer-rut"
                  type="text"
                  value={installer.rut}
                  onChange={(e) => onChangeInstaller({ ...installer, rut: e.target.value })}
                  placeholder="Ej. 12.345.678-9"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Número de Licencia SEC *
                </label>
                <input
                  id="input-installer-sec-licence"
                  type="text"
                  value={installer.secLicenceNumber}
                  onChange={(e) => onChangeInstaller({ ...installer, secLicenceNumber: e.target.value })}
                  placeholder="Ej. SEC-84729"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Clase de Licencia SEC *
                </label>
                <select
                  id="select-installer-sec-class"
                  value={installer.secClass}
                  onChange={(e) => onChangeInstaller({ ...installer, secClass: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer font-bold"
                >
                  <option value="Clase A">Clase A (Sin límite de potencia)</option>
                  <option value="Clase B">Clase B (Hasta 500 kW)</option>
                  <option value="Clase C">Clase C (Hasta 100 kW)</option>
                  <option value="Clase D">Clase D (Hasta 10 kW)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Teléfono Contacto Instalador
                </label>
                <input
                  id="input-installer-phone"
                  type="text"
                  value={installer.phone}
                  onChange={(e) => onChangeInstaller({ ...installer, phone: e.target.value })}
                  placeholder="Ej. +56 9 1234 5678"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Email / Correo Electrónico
                </label>
                <input
                  id="input-installer-email"
                  type="email"
                  value={installer.email}
                  onChange={(e) => onChangeInstaller({ ...installer, email: e.target.value })}
                  placeholder="Ej. contacto@servilec.cl"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grid 2: Cliente y Dirección de la Instalación */}
          <div className="bg-white p-3.5 border-l-4 border-l-[#15803D] border border-[#15803D]/20 space-y-2.5 shadow-2xs">
            <div className="border-b border-[#15803D]/30 pb-1.5 flex items-baseline justify-between">
              <h3 className="text-base font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-[#15803D]" />
                Datos del Cliente & Ubicación del Proyecto
              </h3>
              <label className="text-[9px] uppercase font-mono tracking-wider text-[#15803D] font-bold">Sección 02</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Nombre Completo Cliente *
                </label>
                <input
                  id="input-client-name"
                  type="text"
                  value={client.name}
                  onChange={(e) => onChangeClient({ ...client, name: e.target.value })}
                  placeholder="Ej. Inmobiliaria San Pedro"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>



              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Dirección de Instalación *
                </label>
                <input
                  id="input-client-address"
                  type="text"
                  value={client.address}
                  onChange={(e) => onChangeClient({ ...client, address: e.target.value })}
                  placeholder="Ej. Calle de los Álamos 450"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Comuna *
                </label>
                <input
                  id="input-client-comuna"
                  type="text"
                  value={client.comuna}
                  onChange={(e) => onChangeClient({ ...client, comuna: e.target.value })}
                  placeholder="Ej. Vitacura / Colina / Rancagua"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grid 3: Especificaciones Técnicas Solar */}
          <div className="bg-white p-3.5 border-l-4 border-l-[#15803D] border border-[#15803D]/20 space-y-2.5 shadow-2xs">
            <div className="border-b border-[#15803D]/30 pb-1.5 flex items-baseline justify-between">
              <h3 className="text-base font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#15803D]" />
                Especificaciones del Sistema Fotovoltaico
              </h3>
              <label className="text-[9px] uppercase font-mono tracking-wider text-[#15803D] font-bold">Sección 03</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Tipo de Sistema *
                </label>
                <select
                  id="select-system-type"
                  value={technical.systemType}
                  onChange={(e) => onChangeTechnical({ ...technical, systemType: e.target.value as SystemType })}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                >
                  {systemTypes.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Empresa Distribuidora Eléctrica (SEC / TE4) *
                </label>
                <select
                  id="select-distribution-company"
                  value={
                    CHILEAN_DISTRIBUTION_COMPANIES.includes(technical.distributionCompany || '')
                      ? technical.distributionCompany
                      : (technical.distributionCompany ? 'Otra / Personalizado' : 'Enel Distribución Chile')
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Otra / Personalizado') {
                      onChangeTechnical({
                        ...technical,
                        distributionCompany: '',
                      });
                    } else {
                      onChangeTechnical({
                        ...technical,
                        distributionCompany: val,
                      });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer font-bold"
                >
                  <option value="">Seleccione Distribuidora Eléctrica...</option>
                  {CHILEAN_DISTRIBUTION_COMPANIES.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>

                {(!CHILEAN_DISTRIBUTION_COMPANIES.includes(technical.distributionCompany || '') ||
                  technical.distributionCompany === '') && (
                  <input
                    type="text"
                    id="input-custom-distribution-company"
                    value={technical.distributionCompany || ''}
                    onChange={(e) =>
                      onChangeTechnical({
                        ...technical,
                        distributionCompany: e.target.value,
                      })
                    }
                    placeholder="Escriba el nombre de la distribuidora..."
                    className="w-full mt-1 px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70">
                    Marca Panel Fotovoltaico *
                  </label>
                  <button
                    id="btn-add-custom-pv-brand"
                    type="button"
                    onClick={() => setIsAddingCustomPvBrand(true)}
                    className="text-[9px] font-bold text-[#15803D] hover:text-[#14532D] flex items-center gap-0.5 cursor-pointer bg-[#DCFCE7] hover:bg-[#bbf7d0] px-1.5 py-0.5 border border-[#15803D]/40 rounded-2xs transition-colors"
                    title="Agregar una nueva marca de panel fotovoltaico"
                  >
                    <Plus className="w-3 h-3 text-[#15803D]" />
                    <span>+ Marca Nueva</span>
                  </button>
                </div>
                <select
                  id="select-pv-module-brand"
                  value={currentBrand}
                  onChange={(e) => {
                    const newBrand = e.target.value;
                    if (!newBrand) {
                      onChangeTechnical({ ...technical, panelsCountAndPower: '' });
                    } else {
                      const firstModel = pvModelsMap[newBrand]?.[0] || '';
                      const fullStr = firstModel ? `${newBrand} - ${firstModel}` : newBrand;
                      const newWatts = extractPanelWattage(fullStr);
                      const currentConfigs = getStringConfigList();
                      const updatedConfigs = currentConfigs.map(c => ({
                        ...c,
                        panelBrand: newBrand,
                        panelModel: firstModel,
                        panelWatts: newWatts
                      }));
                      const updatedSummary = formatPanelsSummaryFromConfigs(updatedConfigs);
                      onChangeTechnical({
                        ...technical,
                        panelsCountAndPower: fullStr,
                        stringConfigs: updatedConfigs,
                        stringPanelCounts: updatedConfigs.map(c => c.panelsCount),
                        panelsPerString: updatedSummary || technical.panelsPerString
                      });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                >
                  <option value="">Seleccione Marca de Panel (Certificado SEC)...</option>
                  {pvBrandsList.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70">
                    Modelo Panel Fotovoltaico *
                  </label>
                  <button
                    id="btn-add-custom-panel"
                    type="button"
                    onClick={() => {
                      setCustomPanelBrand(currentBrand || pvBrandsList[0] || 'Jinko Solar');
                      setIsAddingCustomPanel(true);
                    }}
                    className="text-[9px] font-bold text-[#15803D] hover:text-[#14532D] flex items-center gap-0.5 cursor-pointer bg-[#DCFCE7] hover:bg-[#bbf7d0] px-1.5 py-0.5 border border-[#15803D]/40 rounded-2xs transition-colors"
                    title="Agregar un nuevo modelo de panel fotovoltaico"
                  >
                    <Plus className="w-3 h-3 text-[#15803D]" />
                    <span>+ Panel Nuevo</span>
                  </button>
                </div>
                <select
                  id="select-pv-module-model"
                  value={currentModel}
                  disabled={!currentBrand}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    const brandPrefix = currentBrand || '';
                    const fullStr = newModel ? `${brandPrefix} - ${newModel}` : brandPrefix;
                    const newWatts = extractPanelWattage(fullStr);
                    const currentConfigs = getStringConfigList();
                    const updatedConfigs = currentConfigs.map(c => ({
                      ...c,
                      panelBrand: brandPrefix,
                      panelModel: newModel,
                      panelWatts: newWatts
                    }));
                    const updatedSummary = formatPanelsSummaryFromConfigs(updatedConfigs);
                    onChangeTechnical({
                      ...technical,
                      panelsCountAndPower: fullStr,
                      stringConfigs: updatedConfigs,
                      stringPanelCounts: updatedConfigs.map(c => c.panelsCount),
                      panelsPerString: updatedSummary || technical.panelsPerString
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {currentBrand ? 'Seleccione Modelo...' : 'Primero seleccione marca...'}
                  </option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Marca Inversor *
                </label>
                <select
                  id="select-inverter-brand"
                  value={currentInverterBrand}
                  onChange={(e) => {
                    const newBrand = e.target.value;
                    if (!newBrand) {
                      onChangeTechnical({ ...technical, inverterBrandModel: '' });
                    } else {
                      const firstModel = secInverterModels[newBrand]?.[0] || '';
                      onChangeTechnical({
                        ...technical,
                        inverterBrandModel: firstModel ? `${newBrand} - ${firstModel}` : newBrand
                      });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                >
                  <option value="">Seleccione Marca Inversor (Certificado / Off-Grid)...</option>
                  {secCertifiedInverterBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Modelo Inversor *
                </label>
                <select
                  id="select-inverter-model"
                  value={currentInverterModel}
                  disabled={!currentInverterBrand}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    const brandPrefix = currentInverterBrand || '';
                    onChangeTechnical({
                      ...technical,
                      inverterBrandModel: newModel ? `${brandPrefix} - ${newModel}` : brandPrefix
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {currentInverterBrand ? 'Seleccione Modelo...' : 'Primero seleccione marca...'}
                  </option>
                  {availableInverterModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Battery selection fields - Hidden when system is On-Grid (Netbilling) */}
              {technical.systemType !== 'On-Grid (Netbilling)' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70">
                        Marca Baterías Litio
                      </label>
                      <button
                        id="btn-add-custom-battery-brand"
                        type="button"
                        onClick={() => setIsAddingCustomBatteryBrand(true)}
                        className="text-[9px] font-bold text-[#15803D] hover:text-[#14532D] flex items-center gap-0.5 cursor-pointer bg-[#DCFCE7] hover:bg-[#bbf7d0] px-1.5 py-0.5 border border-[#15803D]/40 rounded-2xs transition-colors"
                        title="Agregar una nueva marca de batería de litio"
                      >
                        <Plus className="w-3 h-3 text-[#15803D]" />
                        <span>+ Marca Nueva</span>
                      </button>
                    </div>
                    <select
                      id="select-battery-brand"
                      value={currentBatteryBrand}
                      onChange={(e) => {
                        const newBrand = e.target.value;
                        if (!newBrand || newBrand.startsWith('Sin Baterías')) {
                          onChangeTechnical({
                            ...technical,
                            batteryBrand: newBrand,
                            batteryModel: '',
                            batteryCount: 0,
                            batteryTotalKwh: '0.00 kWh',
                            batteryInfo: newBrand || 'Sin Baterías'
                          });
                        } else {
                          const firstModel = lithiumBatteryModelsMap[newBrand]?.[0] || '';
                          const count = technical.batteryCount || 1;
                          const { info, totalKwhStr } = formatBatteryInfo(newBrand, firstModel, count);
                          onChangeTechnical({
                            ...technical,
                            batteryBrand: newBrand,
                            batteryModel: firstModel,
                            batteryCount: count,
                            batteryTotalKwh: totalKwhStr,
                            batteryInfo: info
                          });
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                    >
                      <option value="">Seleccione Marca de Batería de Litio...</option>
                      {lithiumBatteryBrandsList.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70">
                        Modelo Batería de Litio
                      </label>
                      <button
                        id="btn-add-custom-battery-model"
                        type="button"
                        onClick={() => {
                          setCustomBatteryBrandForModel(currentBatteryBrand || lithiumBatteryBrandsList[1] || 'Dyness');
                          setIsAddingCustomBatteryModel(true);
                        }}
                        className="text-[9px] font-bold text-[#15803D] hover:text-[#14532D] flex items-center gap-0.5 cursor-pointer bg-[#DCFCE7] hover:bg-[#bbf7d0] px-1.5 py-0.5 border border-[#15803D]/40 rounded-2xs transition-colors"
                        title="Agregar un nuevo modelo de batería de litio"
                      >
                        <Plus className="w-3 h-3 text-[#15803D]" />
                        <span>+ Modelo Nuevo</span>
                      </button>
                    </div>
                    <select
                      id="select-battery-model"
                      value={currentBatteryModel}
                      disabled={!currentBatteryBrand || currentBatteryBrand.startsWith('Sin Baterías')}
                      onChange={(e) => {
                        const newModel = e.target.value;
                        const count = technical.batteryCount || 1;
                        const { info, totalKwhStr } = formatBatteryInfo(currentBatteryBrand, newModel, count);
                        onChangeTechnical({
                          ...technical,
                          batteryModel: newModel,
                          batteryCount: count,
                          batteryTotalKwh: totalKwhStr,
                          batteryInfo: info
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!currentBatteryBrand
                          ? 'Primero seleccione marca de batería...'
                          : currentBatteryBrand.startsWith('Sin Baterías')
                          ? 'No aplica'
                          : 'Seleccione Modelo / Capacidad...'}
                      </option>
                      {availableBatteryModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                      Cantidad de Baterías
                    </label>
                    <select
                      id="select-battery-count"
                      value={technical.batteryCount || 1}
                      disabled={!currentBatteryBrand || currentBatteryBrand.startsWith('Sin Baterías')}
                      onChange={(e) => {
                        const newCount = parseInt(e.target.value, 10) || 1;
                        const { info, totalKwhStr } = formatBatteryInfo(currentBatteryBrand, currentBatteryModel, newCount);
                        onChangeTechnical({
                          ...technical,
                          batteryCount: newCount,
                          batteryTotalKwh: totalKwhStr,
                          batteryInfo: info
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!currentBatteryBrand || currentBatteryBrand.startsWith('Sin Baterías') ? (
                        <option value={0}>0 (No aplica)</option>
                      ) : (
                        Array.from({ length: 32 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Batería' : 'Baterías'}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5 text-[#15803D]">
                      Suma Total Capacidad Baterías (kWh)
                    </label>
                    <input
                      id="input-battery-total-kwh"
                      type="text"
                      readOnly
                      value={
                        !currentBatteryBrand || currentBatteryBrand.startsWith('Sin Baterías')
                          ? 'Sin Baterías (0 kWh)'
                          : (() => {
                              const count = technical.batteryCount || 1;
                              const unitKwh = extractBatteryKwh(currentBatteryModel);
                              const total = (unitKwh * count).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                              return `${total} kWh (${count} x ${unitKwh} kWh)`;
                            })()
                      }
                      placeholder="Total capacidad acumulada"
                      className="w-full px-2.5 py-1.5 bg-[#ECFDF5] border border-[#15803D]/40 text-xs font-bold text-[#14532D] focus:outline-none cursor-default"
                    />
                  </div>
                </>
              )}



              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  N° Total de Strings (Cadenas)
                </label>
                <select
                  id="select-strings-count"
                  value={technical.stringsCount || ''}
                  onChange={(e) => {
                    const newStrCountVal = e.target.value;
                    const num = parseNumStrings(newStrCountVal);
                    const currentConfigs = getStringConfigList();
                    const defaultBrand = currentBrand || pvBrandsList[0] || 'Jinko Solar';
                    const defaultModel = currentModel || pvModelsMap[defaultBrand]?.[0] || '';
                    const defaultFull = defaultModel ? `${defaultBrand} - ${defaultModel}` : defaultBrand;
                    const defaultWatts = extractPanelWattage(defaultFull);

                    const newConfigs: StringConfigItem[] = [];
                    const newCounts: number[] = [];
                    for (let i = 0; i < num; i++) {
                      if (currentConfigs[i]) {
                        newConfigs.push(currentConfigs[i]);
                        newCounts.push(currentConfigs[i].panelsCount);
                      } else {
                        newConfigs.push({
                          stringIndex: i + 1,
                          panelsCount: 10,
                          panelBrand: defaultBrand,
                          panelModel: defaultModel,
                          panelWatts: defaultWatts
                        });
                        newCounts.push(10);
                      }
                    }

                    const summary = formatPanelsSummaryFromConfigs(newConfigs);
                    onChangeTechnical({
                      ...technical,
                      stringsCount: newStrCountVal,
                      stringConfigs: newConfigs,
                      stringPanelCounts: newCounts,
                      panelsPerString: summary
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                >
                  <option value="">Seleccione N° Strings...</option>
                  {stringOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Paneles por String / Resumen
                </label>
                <input
                  id="input-panels-per-string"
                  type="text"
                  value={technical.panelsPerString || ''}
                  onChange={(e) => onChangeTechnical({ ...technical, panelsPerString: e.target.value })}
                  placeholder="Ej. 10 paneles por string (Total: 20)"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5 text-[#15803D]">
                  Potencia Total FV (Watts Suma Strings)
                </label>
                <input
                  id="input-total-pv-watts"
                  type="text"
                  readOnly
                  value={totalPanelsCalculated > 0 ? `${totalPvWattsCalculated.toLocaleString('es-CL')} Watts (${totalPvKwpCalculated} kWp)` : ''}
                  placeholder="Suma de todos los strings en Watts"
                  className="w-full px-2.5 py-1.5 bg-[#ECFDF5] border border-[#15803D]/40 text-xs font-bold text-[#14532D] focus:outline-none cursor-default"
                />
              </div>

              {numStrings > 0 && (
                <div className="sm:col-span-2 md:col-span-4 bg-[#F0FDF4] p-3 border border-[#15803D]/30 space-y-2 mt-1 rounded-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#15803D]/20 pb-1.5 gap-1.5">
                    <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wide flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#15803D]" />
                      Configuración por String ({numStrings} String{numStrings > 1 ? 's' : ''})
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#15803D] bg-white px-2 py-0.5 border border-[#15803D]/30 rounded-xs">
                        Total: {totalPanelsCalculated} Paneles
                      </span>
                      <span className="text-[10px] font-bold text-[#14532D] bg-[#DCFCE7] px-2.5 py-0.5 border border-[#15803D]/40 rounded-xs">
                        Potencia Total: {totalPvWattsCalculated.toLocaleString('es-CL')} W ({totalPvKwpCalculated} kWp)
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 pt-1">
                    {activeStringConfigs.map((strConfig, idx) => {
                      const stringNum = strConfig.stringIndex;
                      const stringPowerWatts = (strConfig.panelsCount || 0) * (strConfig.panelWatts || 550);
                      const stringPowerKwp = (stringPowerWatts / 1000).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      const modelsForString = strConfig.panelBrand ? (pvModelsMap[strConfig.panelBrand] || []) : [];

                      return (
                        <div key={stringNum} className="flex flex-col bg-white p-2.5 border border-[#15803D]/30 shadow-2xs space-y-2 rounded-xs">
                          <div className="flex items-center justify-between border-b border-[#15803D]/15 pb-1.5 gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-[#14532D] bg-[#DCFCE7] px-2 py-0.5 border border-[#15803D]/40 rounded-2xs flex items-center gap-1">
                                <Sun className="w-3 h-3 text-[#15803D]" />
                                String #{stringNum}
                              </span>
                              {strConfig.panelsCount > 0 && (
                                <span className="text-[9px] font-semibold text-[#15803D] bg-emerald-50 px-1.5 py-0.5 rounded-2xs border border-[#15803D]/20">
                                  {strConfig.panelsCount}p ({stringPowerWatts.toLocaleString('es-CL')}W / {stringPowerKwp} kWp)
                                </span>
                              )}
                            </div>
                            {numStrings > 1 && (
                              <button
                                type="button"
                                onClick={() => handleCopyStringToAll(idx)}
                                className="text-[9px] font-semibold text-[#15803D] hover:text-[#14532D] hover:bg-emerald-100 px-1.5 py-0.5 border border-[#15803D]/30 rounded-2xs transition-colors cursor-pointer"
                                title="Copiar marca y modelo de este string a todos los demás strings"
                              >
                                Copiar a todos
                              </button>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            {/* Cantidad de paneles */}
                            <div>
                              <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                                Cantidad de Paneles *
                              </label>
                              <select
                                id={`select-string-${stringNum}-panels`}
                                value={strConfig.panelsCount}
                                onChange={(e) => handleStringPanelCountChange(idx, parseInt(e.target.value, 10) || 0)}
                                className="w-full px-2 py-1 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                              >
                                <option value={0}>0 (Inactivo / Desconectado)</option>
                                {Array.from({ length: 45 }).map((_, pIndex) => {
                                  const pVal = pIndex + 1;
                                  return (
                                    <option key={pVal} value={pVal}>
                                      {pVal} {pVal === 1 ? 'panel' : 'paneles'} ({pVal * (strConfig.panelWatts || 550)}W)
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Marca de Panel */}
                            <div>
                              <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                                Marca del Panel (String #{stringNum}) *
                              </label>
                              <select
                                id={`select-string-${stringNum}-brand`}
                                value={strConfig.panelBrand || ''}
                                onChange={(e) => handleStringBrandChange(idx, e.target.value)}
                                className="w-full px-2 py-1 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                              >
                                <option value="">Seleccione marca para String #{stringNum}...</option>
                                {pvBrandsList.map((brand) => (
                                  <option key={brand} value={brand}>{brand}</option>
                                ))}
                              </select>
                            </div>

                            {/* Modelo de Panel */}
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70">
                                  Modelo del Panel (String #{stringNum}) *
                                </label>
                                {strConfig.panelWatts && (
                                  <span className="text-[8.5px] font-bold text-[#15803D] bg-[#DCFCE7] px-1 py-0.2 rounded-2xs">
                                    {strConfig.panelWatts}W
                                  </span>
                                )}
                              </div>
                              <select
                                id={`select-string-${stringNum}-model`}
                                value={strConfig.panelModel || ''}
                                disabled={!strConfig.panelBrand}
                                onChange={(e) => handleStringModelChange(idx, e.target.value)}
                                className="w-full px-2 py-1 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="">
                                  {strConfig.panelBrand ? 'Seleccione modelo...' : 'Primero seleccione marca...'}
                                </option>
                                {modelsForString.map((model) => (
                                  <option key={model} value={model}>{model}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-[#15803D] italic pt-0.5">
                    * Cada string calcula su potencia de forma independiente según la marca, modelo y cantidad de paneles seleccionados.
                  </p>
                </div>
              )}





              <div className="sm:col-span-2 md:col-span-2">
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Coordenadas GPS de la Instalación
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-60 text-emerald-600" />
                    <input
                      id="input-gps-coordinates"
                      type="text"
                      value={technical.gpsCoordinates || ''}
                      onChange={(e) => onChangeTechnical({ ...technical, gpsCoordinates: e.target.value })}
                      placeholder="Ej. Lat: -33.437200, Long: -70.650600"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                    />
                  </div>
                  <button
                    id="btn-capture-gps"
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isFetchingGps}
                    className="px-3 py-1.5 bg-[#15803D] text-white border border-[#14532D] text-xs uppercase font-mono tracking-wider font-bold flex items-center gap-1.5 hover:bg-[#25A238] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-2xs"
                    title="Obtener ubicación GPS en vivo del dispositivo"
                  >
                    {isFetchingGps ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Capturando...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Capturar GPS</span>
                      </>
                    )}
                  </button>
                </div>
                {gpsMessage && (
                  <p className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                    ✓ {gpsMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Panel Nuevo */}
      {isAddingCustomPanel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#15803D] max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4 relative rounded-xs">
            <div className="flex items-center justify-between border-b border-[#15803D]/30 pb-2.5">
              <h3 className="text-sm font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#15803D]" />
                Agregar Nuevo Modelo de Panel Fotovoltaico
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCustomPanel(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Marca del Panel *
                </label>
                <div className="space-y-1.5">
                  <select
                    value={isCustomBrand ? 'CUSTOM_NEW_BRAND' : customPanelBrand}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM_NEW_BRAND') {
                        setIsCustomBrand(true);
                      } else {
                        setIsCustomBrand(false);
                        setCustomPanelBrand(e.target.value);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                  >
                    {pvBrandsList.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                    <option value="CUSTOM_NEW_BRAND">+ Ingresar Otra Marca Nueva...</option>
                  </select>

                  {isCustomBrand && (
                    <input
                      type="text"
                      value={newCustomBrandInput}
                      onChange={(e) => setNewCustomBrandInput(e.target.value)}
                      placeholder="Nombre de la nueva marca (Ej. Suntech, Trina...)"
                      className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Modelo / Código del Panel *
                </label>
                <input
                  type="text"
                  value={customPanelModelName}
                  onChange={(e) => setCustomPanelModelName(e.target.value)}
                  placeholder="Ej. Tiger Neo N-Type JKM650N-78HL4-V"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Potencia Nominal (Watts) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={customPanelWatts}
                    onChange={(e) => setCustomPanelWatts(e.target.value)}
                    placeholder="Ej. 650"
                    className="w-full pl-2.5 pr-8 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-500">W</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddingCustomPanel(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomPanel}
                className="px-4 py-1.5 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar e Incluir Panel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Instalador Nuevo */}
      {isAddingCustomInstaller && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#15803D] max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4 relative rounded-xs">
            <div className="flex items-center justify-between border-b border-[#15803D]/30 pb-2.5">
              <h3 className="text-sm font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                Agregar Nuevo Instalador Certificado
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCustomInstaller(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Nombre Completo del Instalador *
                </label>
                <input
                  type="text"
                  value={newInstallerName}
                  onChange={(e) => setNewInstallerName(e.target.value)}
                  placeholder="Ej. JUAN PÉREZ MENDOZA"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddingCustomInstaller(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomInstaller}
                className="px-4 py-1.5 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar y Seleccionar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Marca Nueva de Panel Fotovoltaico */}
      {isAddingCustomPvBrand && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#15803D] max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4 relative rounded-xs">
            <div className="flex items-center justify-between border-b border-[#15803D]/30 pb-2.5">
              <h3 className="text-sm font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#15803D]" />
                Agregar Nueva Marca de Panel Fotovoltaico
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCustomPvBrand(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Nombre de la Nueva Marca *
                </label>
                <input
                  type="text"
                  value={newPvBrandName}
                  onChange={(e) => setNewPvBrandName(e.target.value)}
                  placeholder="Ej. TRINA SOLAR"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Modelo Inicial *
                </label>
                <input
                  type="text"
                  value={newPvBrandFirstModel}
                  onChange={(e) => setNewPvBrandFirstModel(e.target.value)}
                  placeholder="Ej. Vertex S+ TSM-450NEG9R.28 450W"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Potencia del Modelo (Watts)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={newPvBrandWatts}
                    onChange={(e) => setNewPvBrandWatts(e.target.value)}
                    placeholder="Ej. 550"
                    className="w-full pl-2.5 pr-8 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-500">W</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddingCustomPvBrand(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomPvBrand}
                className="px-4 py-1.5 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Marca y Seleccionar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Nueva Marca de Batería de Litio */}
      {isAddingCustomBatteryBrand && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#15803D] max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4 relative rounded-xs">
            <div className="flex items-center justify-between border-b border-[#15803D]/30 pb-2.5">
              <h3 className="text-sm font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <Battery className="w-4 h-4 text-[#15803D]" />
                Agregar Nueva Marca de Batería de Litio
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCustomBatteryBrand(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Nombre de la Marca de Batería *
                </label>
                <input
                  type="text"
                  value={newBatteryBrandName}
                  onChange={(e) => setNewBatteryBrandName(e.target.value)}
                  placeholder="Ej. TESLA"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Modelo Inicial *
                </label>
                <input
                  type="text"
                  value={newBatteryFirstModelName}
                  onChange={(e) => setNewBatteryFirstModelName(e.target.value)}
                  placeholder="Ej. Powerwall 3 (13.5 kWh)"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Capacidad de Almacenamiento (kWh)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={newBatteryFirstModelKwh}
                    onChange={(e) => setNewBatteryFirstModelKwh(e.target.value)}
                    placeholder="Ej. 13.5"
                    className="w-full pl-2.5 pr-12 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-500">kWh</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddingCustomBatteryBrand(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomBatteryBrand}
                className="px-4 py-1.5 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Marca y Seleccionar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Nuevo Modelo de Batería de Litio */}
      {isAddingCustomBatteryModel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#15803D] max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4 relative rounded-xs">
            <div className="flex items-center justify-between border-b border-[#15803D]/30 pb-2.5">
              <h3 className="text-sm font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#15803D]" />
                Agregar Nuevo Modelo de Batería de Litio
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCustomBatteryModel(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Marca de Batería *
                </label>
                <select
                  value={customBatteryBrandForModel}
                  onChange={(e) => setCustomBatteryBrandForModel(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                >
                  {lithiumBatteryBrandsList.filter(b => !b.startsWith('Sin Baterías')).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Nombre / Código del Modelo *
                </label>
                <input
                  type="text"
                  value={newBatteryModelName}
                  onChange={(e) => setNewBatteryModelName(e.target.value)}
                  placeholder="Ej. B4850 48V 50Ah"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 text-[#0F172A]">
                  Capacidad de la Unidad (kWh)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={newBatteryModelKwh}
                    onChange={(e) => setNewBatteryModelKwh(e.target.value)}
                    placeholder="Ej. 2.4"
                    className="w-full pl-2.5 pr-12 py-1.5 bg-[#F8FAF9] border border-[#15803D]/40 text-xs text-[#0F172A] focus:outline-none focus:border-[#15803D]"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-500">kWh</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddingCustomBatteryModel(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomBatteryModel}
                className="px-4 py-1.5 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Modelo y Seleccionar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

