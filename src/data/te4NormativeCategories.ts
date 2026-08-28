import { ChecklistCategory } from '../types';

export const INITIAL_TE4_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'cat-sec-01',
    title: '1. Registro Instalaciones Domiciliarias (Ítems 1 al 12)',
    iconName: 'Sun',
    items: [
      {
        id: 'item-sec-01',
        code: '1',
        title: 'Numeración de la propiedad',
        normaSec: 'RIC N°02 / RIC N°10',
        description: 'Evidencia fotográfica de la numeración visible del inmueble o frontis/fachada de la propiedad (si no tiene numeración visible, registrar acceso o identificación del predio).',
        photoGuide: 'Foto de la numeración municipal o fachada de la propiedad.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-02',
        code: '2',
        title: 'Unidad de generación (Paneles fotovoltaicos o generadores eólicos, etc.), su aterrizaje y señalética',
        normaSec: 'RIC N°02 § 5.1 / RIC N°03 / RIC N°06',
        description: 'Verificar unidad de generación (módulos fotovoltaicos o generadores eólicos), fijación y montaje, aterrizaje a tierra de marcos y estructuras, y señalética de seguridad.',
        photoGuide: 'Foto general de la unidad de generación, aterrizaje a tierra y señalética visible.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-03',
        code: '3',
        title: 'Orden de cableado y conectores (por ejemplo, los conectores tipo MC4 bajo los paneles fotovoltaicos)',
        normaSec: 'RIC N°02 § 5.2 / RIC N°04 / RIC N°02 § 6.3',
        description: 'Verificar el ordenamiento del cableado solar DC, sujeción sin rozar techumbres y conectores tipo MC4 bien armados y protegidos bajo los paneles.',
        photoGuide: 'Foto del orden de cableado solar y conectores tipo MC4 protegidos bajo los paneles fotovoltaicos.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-04',
        code: '4',
        title: 'Canalización (conductores, tuberías, bandejas, cajas de derivación, accesorios, etc) de los conductores que salen de la unidad de generación e ingresan a inversores o tableros eléctricos',
        normaSec: 'RIC N°04 / RIC N°02 § 6 / RIC N°06 § 7.2',
        description: 'Canalización (conductores, tuberías EMT/PVC, bandejas, cajas de derivación, accesorios) de los conductores que salen de la unidad de generación e ingresan a inversores o tableros eléctricos. Incluye sección de comprobación en video de la continuidad de tierra en canalizaciones metálicas y cajas de derivación.',
        photoGuide: 'Fotos de canalizaciones, tuberías, bandejas y cajas + Sección de Video comprobando la continuidad de tierra en canalizaciones AC y DC con instrumento de prueba / multímetro.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-05',
        code: '5',
        title: 'Inversor/microinversor, su señalética y la configuración (ya sea en el monitor del inversor o en el computador, mostrando el N° de serie)',
        normaSec: 'RIC N°02 § 9 / Protocolo PE N°8/01',
        description: 'Inversor o microinversores, ubicación, espacio de ventilación, señalética reglamentaria y configuración (en display del inversor o app/computador mostrando N° de serie legible).',
        photoGuide: 'Foto del inversor con su señalética y captura del monitor/display/computador con el N° de serie.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-06',
        code: '6',
        title: 'Tablero eléctrico de distribución del sistema de generación (por ejemplo, el TDFV para sistemas fotovoltaicos), tablero general o tablero en el cual estén las protecciones del sistema de generación, junto a su rotulación y cableado interior',
        normaSec: 'RIC N°02 § 8 / RIC N°09 IP65',
        description: 'Tablero eléctrico de distribución del sistema de generación (ej. TDFV), tablero general o tablero con protecciones de generación, rotulación de circuitos, tapas y cableado interior ordenado.',
        photoGuide: 'Foto del tablero eléctrico abierto y cerrado mostrando protecciones, rotulación y cableado interior.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-07',
        code: '7',
        title: 'Mostrar el punto de inyección del sistema de generación (por ejemplo, una barra de distribución dentro de un tablero distribución, señalizada)',
        normaSec: 'RIC N°02 § 8.5 / RIC N°03',
        description: 'Mostrar el punto de inyección del sistema de generación (por ejemplo, una barra de distribución dentro de un tablero de distribución, debidamente señalizada).',
        photoGuide: 'Foto en detalle de la barra de distribución o bornera de inyección con su señalización.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-08',
        code: '8',
        title: 'Sistema de puesta a tierra empleado',
        normaSec: 'RIC N°06 § 6 y § 10 (Máx 20 Ω)',
        description: 'Sistema de puesta a tierra: cámara de inspección registrable, electrodo/jabalina, barra de tierra equipotencial, prensas y valor de resistencia de puesta a tierra.',
        photoGuide: 'Foto de la cámara de inspección de tierra abierta, prensa, electrodo y/o medición en telurómetro.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-09',
        code: '9',
        title: 'Medidor Rotulado',
        normaSec: 'RIC N°02 § 13.1 / Ley 20.571 / RIC N°10',
        description: 'Medidor de la empresa distribuidora rotulado con placa o etiqueta de advertencia de generación distribuida / inyección y N° de serie legible.',
        photoGuide: 'Foto del medidor de la empresa distribuidora con su rotulación normativa visible.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-10',
        code: '10',
        title: 'Tablero existente',
        normaSec: 'RIC N°02 § 8.3 / RIC N°10',
        description: 'Fotografía del tablero general / distribución existente del inmueble donde se aprecien claramente la capacidad de las protecciones y estado general.',
        photoGuide: 'Foto del tablero eléctrico existente de la propiedad y sus protecciones legibles.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-11',
        code: '11',
        title: 'Selector emergencia de AC y CC',
        normaSec: 'RIC N°02 § 8.4 / RIC N°09',
        description: 'Verificar selectores / interruptores de corte de emergencia de Corriente Continua (CC) y Corriente Alterna (AC) o selector conmutador ATS (GRID/BACKUP) rotulado.',
        photoGuide: 'Foto de los selectores/desconectadores de emergencia de AC y CC y conmutador ATS.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-12',
        code: '12',
        title: 'Batería panorámica y etiqueta',
        normaSec: 'RIC N°02 § 9.4 / RIC N°06',
        description: 'Banco de baterías (si aplica): vista panorámica del sistema de almacenamiento, fijación, canalizaciones y fotografía en detalle de la etiqueta técnica de placa.',
        photoGuide: 'Foto panorámica del banco de baterías y fotografía en detalle de su etiqueta técnica.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      }
    ]
  },
  {
    id: 'cat-sec-02',
    title: '2. Instalaciones de 10 kW hasta 30 kW',
    iconName: 'ShieldAlert',
    items: [
      {
        id: 'item-sec-13',
        code: '13',
        title: 'Instalaciones de 10 kw hasta 30kw',
        normaSec: 'RIC N°02 § 14 / DS N°59',
        description: 'Para proyectos con potencia instalada entre 10 kW y 30 kW: verificar cumplimiento de requisitos generales de seguridad, accesibilidad y protecciones técnicas SEC.',
        photoGuide: 'Foto general de la instalación de 10 kW a 30 kW y verificación de condiciones técnicas.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-14',
        code: '14',
        title: 'Escalera de acceso',
        normaSec: 'RIC N°02 / NCh 349 / DS N°59',
        description: 'Escalera de acceso seguro a la cubierta o techo para instalaciones de 10 kW a 30 kW.',
        photoGuide: 'Foto de la escalera de acceso seguro hacia la zona de paneles solares o techumbre.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-15',
        code: '15',
        title: 'Cuerda de vida',
        normaSec: 'RIC N°02 / NCh 1258',
        description: 'Línea de vida o cuerda de vida instalada para tránsito seguro y mantención sobre la techumbre (10 kW a 30 kW).',
        photoGuide: 'Foto de la cuerda de vida / línea de vida y sus puntos de anclaje en techumbre.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      }
    ]
  },
  {
    id: 'cat-sec-03',
    title: '3. Instalaciones de 30 kW hacia arriba',
    iconName: 'Zap',
    items: [
      {
        id: 'item-sec-16',
        code: '16',
        title: 'Instalaciones de 30 kw hacia arriba',
        normaSec: 'RIC N°02 § 15 / DS N°59',
        description: 'Para proyectos comerciales/industriales con potencia superior a 30 kW: verificar medidas de seguridad estructural y accesibilidad normativa SEC.',
        photoGuide: 'Foto general de la instalación para potencia de 30 kW hacia arriba.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-17',
        code: '17',
        title: 'Escalera de acceso gatera',
        normaSec: 'RIC N°02 / NCh 349 / DS N°59',
        description: 'Escalera fija tipo gatera con jaula de protección y guarda-hombre para acceso seguro a techumbre en instalaciones de 30 kW hacia arriba.',
        photoGuide: 'Foto de la escalera gatera con jaula de protección hacia la cubierta.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-18',
        code: '18',
        title: 'Cuerda de vida',
        normaSec: 'RIC N°02 / NCh 1258',
        description: 'Sistema de línea de vida permanente certificada para trabajos y mantención en techumbre en sistemas de 30 kW hacia arriba.',
        photoGuide: 'Foto del sistema de cuerda de vida / línea de vida permanente certificada.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-sec-19',
        code: '19',
        title: 'Pasillo tecnico',
        normaSec: 'RIC N°02 § 5.3 / DS N°59',
        description: 'Pasillo técnico antideslizante para circulación y mantenimiento de módulos solares en cubiertas de instalaciones superiores a 30 kW.',
        photoGuide: 'Foto del pasillo técnico de tránsito sobre la cubierta entre filas de paneles.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      }
    ]
  }
];
