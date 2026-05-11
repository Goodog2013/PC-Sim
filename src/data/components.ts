import type {
  BuildSlots,
  CpuSocket,
  FormFactor,
  PCPart,
  PartCategory,
  PartType,
  RamType,
  StorageType,
} from '../types'

export const partCategories: PartCategory[] = [
  { type: 'case', label: 'Корпус' },
  { type: 'motherboard', label: 'Материнская плата' },
  { type: 'cpu', label: 'Процессор' },
  { type: 'ram', label: 'Оперативная память' },
  { type: 'gpu', label: 'Видеокарта' },
  { type: 'storage', label: 'Накопитель' },
  { type: 'psu', label: 'Блок питания' },
  { type: 'cooler', label: 'Кулер' },
]

export const partLabels: Record<PartType, string> = partCategories.reduce(
  (labels, category) => ({ ...labels, [category.type]: category.label }),
  {} as Record<PartType, string>,
)

export const emptyBuild: BuildSlots = {
  case: null,
  motherboard: null,
  cpu: null,
  gpu: null,
  ram: null,
  storage: null,
  psu: null,
  cooler: null,
}

export const requiredPartTypes = partCategories.map((category) => category.type)

type PartDraft = Omit<PCPart, 'id' | 'type'> & { id?: string }

const allFormFactors: FormFactor[] = ['ATX', 'Micro-ATX', 'Mini-ITX']
const compactFormFactors: FormFactor[] = ['Micro-ATX', 'Mini-ITX']
const miniItxOnly: FormFactor[] = ['Mini-ITX']

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function makeParts(type: PartType, parts: PartDraft[]): PCPart[] {
  return parts.map((part) => ({
    ...part,
    id: part.id ?? `${type}-${slugify(part.name)}`,
    type,
  }))
}

function casePart(
  name: string,
  price: number,
  supportedFormFactors: FormFactor[],
  maxGpuLength: number,
  id?: string,
): PartDraft {
  return {
    id,
    name,
    price,
    powerDraw: 0,
    performanceScore: 0,
    supportedFormFactors,
    maxGpuLength,
    requiredSlot: supportedFormFactors.includes('ATX')
      ? 'ATX case frame'
      : 'Compact case frame',
  }
}

function motherboardPart(
  name: string,
  price: number,
  socket: CpuSocket,
  formFactor: FormFactor,
  ramType: RamType,
  performanceScore: number,
  id?: string,
): PartDraft {
  return {
    id,
    name,
    price,
    powerDraw: formFactor === 'Mini-ITX' ? 38 : formFactor === 'Micro-ATX' ? 46 : 56,
    performanceScore,
    socket,
    formFactor,
    ramType,
    storageSlots: ['M.2', 'SATA'],
    requiredSlot: `${formFactor} motherboard tray`,
  }
}

function cpuPart(
  name: string,
  price: number,
  socket: CpuSocket,
  powerDraw: number,
  performanceScore: number,
  id?: string,
): PartDraft {
  return {
    id,
    name,
    price,
    powerDraw,
    performanceScore,
    socket,
    requiredSlot: 'CPU socket',
  }
}

function gpuPart(
  name: string,
  price: number,
  powerDraw: number,
  performanceScore: number,
  length: number,
  id?: string,
): PartDraft {
  return {
    id,
    name,
    price,
    powerDraw,
    performanceScore,
    length,
    requiredSlot: 'PCIe x16',
  }
}

function ramPart(
  name: string,
  price: number,
  ramType: RamType,
  powerDraw: number,
  performanceScore: number,
  id?: string,
): PartDraft {
  return {
    id,
    name,
    price,
    powerDraw,
    performanceScore,
    ramType,
    requiredSlot: 'DIMM',
  }
}

function storagePart(
  name: string,
  price: number,
  storageType: StorageType,
  powerDraw: number,
  performanceScore: number,
  id?: string,
): PartDraft {
  return {
    id,
    name,
    price,
    powerDraw,
    performanceScore,
    storageType,
    requiredSlot: storageType,
  }
}

function psuPart(
  name: string,
  price: number,
  wattage: number,
  id?: string,
): PartDraft {
  return {
    id,
    name,
    price,
    powerDraw: 0,
    performanceScore: 0,
    wattage,
    requiredSlot: 'ATX PSU bay',
  }
}

function coolerPart(
  name: string,
  price: number,
  powerDraw: number,
  performanceScore: number,
  compatibleWith: CpuSocket[],
  requiredSlot: string,
  id?: string,
): PartDraft {
  return {
    id,
    name,
    price,
    powerDraw,
    performanceScore,
    compatibleWith,
    requiredSlot,
  }
}

const cases = makeParts('case', [
  casePart('NZXT H5 Flow', 92, allFormFactors, 340, 'case-atlas-flow'),
  casePart('Fractal Design Pop Mini Air', 74, compactFormFactors, 275, 'case-nova-compact'),
  casePart('Corsair 4000D Airflow', 105, allFormFactors, 360),
  casePart('Lian Li Lancool 216', 110, allFormFactors, 392),
  casePart('Fractal Design North', 140, allFormFactors, 355),
  casePart('Phanteks Eclipse G360A', 90, allFormFactors, 400),
  casePart('Cooler Master MasterBox TD500 Mesh V2', 98, allFormFactors, 410),
  casePart('be quiet! Pure Base 500DX', 112, allFormFactors, 369),
  casePart('Montech Air 903 Max', 85, allFormFactors, 400),
  casePart('Antec P20C', 95, allFormFactors, 375),
  casePart('Hyte Y60', 199, allFormFactors, 375),
  casePart('Lian Li O11 Dynamic EVO', 169, allFormFactors, 422),
  casePart('NZXT H7 Flow', 130, allFormFactors, 400),
  casePart('Corsair 5000D Airflow', 175, allFormFactors, 420),
  casePart('Fractal Design Meshify 2 Compact', 125, allFormFactors, 341),
  casePart('Phanteks NV5', 110, allFormFactors, 440),
  casePart('Cooler Master NR200P', 110, miniItxOnly, 330),
  casePart('Fractal Design Terra', 180, miniItxOnly, 322),
  casePart('NZXT H210', 89, miniItxOnly, 325),
  casePart('Lian Li A4-H2O', 155, miniItxOnly, 322),
  casePart('Thermaltake The Tower 200', 150, miniItxOnly, 380),
  casePart('SilverStone SUGO 16', 88, miniItxOnly, 275),
  casePart('ASUS Prime AP201', 85, compactFormFactors, 338),
  casePart('Jonsbo D31 Mesh', 105, compactFormFactors, 330),
  casePart('Lian Li Lancool 205M Mesh', 90, compactFormFactors, 350),
  casePart('Cooler Master Q300L V2', 65, compactFormFactors, 360),
  casePart('Thermaltake S100 TG', 70, compactFormFactors, 330),
  casePart('Fractal Design Define 7 Compact', 125, allFormFactors, 341),
  casePart('Corsair 3000D Airflow', 80, allFormFactors, 360),
  casePart('DeepCool CH560 Digital', 130, allFormFactors, 380),
  casePart('MSI MPG Gungnir 300R Airflow', 160, allFormFactors, 360),
  casePart('Gigabyte C301 Glass', 100, allFormFactors, 400),
  casePart('Thermaltake View 270 TG ARGB', 95, allFormFactors, 420),
  casePart('Antec Performance 1 FT', 160, allFormFactors, 400),
  casePart('Fractal Design Torrent Compact', 150, allFormFactors, 330),
  casePart('Corsair 6500D Airflow', 200, allFormFactors, 400),
  casePart('be quiet! Shadow Base 800 FX', 180, allFormFactors, 430),
  casePart('Phanteks Eclipse P400A Digital', 90, allFormFactors, 420),
  casePart('NZXT H9 Flow', 160, allFormFactors, 435),
  casePart('Lian Li Lancool III', 150, allFormFactors, 435),
])

const motherboards = makeParts('motherboard', [
  motherboardPart('MSI PRO Z790-A WIFI', 186, 'LGA1700', 'ATX', 'DDR5', 42, 'mb-orion-z5'),
  motherboardPart('ASUS TUF Gaming B650M-PLUS WIFI', 189, 'AM5', 'Micro-ATX', 'DDR5', 40, 'mb-sable-m4'),
  motherboardPart('Gigabyte Z790 AORUS Elite AX', 240, 'LGA1700', 'ATX', 'DDR5', 50),
  motherboardPart('ASUS ROG Strix Z790-E Gaming WiFi', 420, 'LGA1700', 'ATX', 'DDR5', 64),
  motherboardPart('MSI MAG Z790 Tomahawk WIFI', 260, 'LGA1700', 'ATX', 'DDR5', 54),
  motherboardPart('ASRock Z790 Steel Legend WiFi', 230, 'LGA1700', 'ATX', 'DDR5', 50),
  motherboardPart('Gigabyte Z790 UD AX', 190, 'LGA1700', 'ATX', 'DDR5', 43),
  motherboardPart('ASUS PRIME Z790-P WIFI', 220, 'LGA1700', 'ATX', 'DDR5', 46),
  motherboardPart('MSI MAG B760 Tomahawk WIFI DDR4', 170, 'LGA1700', 'ATX', 'DDR4', 38),
  motherboardPart('ASUS PRIME B760M-A D4', 130, 'LGA1700', 'Micro-ATX', 'DDR4', 34),
  motherboardPart('ASRock B760M Pro RS/D4', 125, 'LGA1700', 'Micro-ATX', 'DDR4', 33),
  motherboardPart('Gigabyte B760M DS3H AX DDR4', 135, 'LGA1700', 'Micro-ATX', 'DDR4', 34),
  motherboardPart('MSI PRO B760-P WIFI DDR4', 150, 'LGA1700', 'ATX', 'DDR4', 36),
  motherboardPart('ASUS ROG Strix B760-I Gaming WiFi', 210, 'LGA1700', 'Mini-ITX', 'DDR5', 42),
  motherboardPart('Gigabyte B760I AORUS PRO', 200, 'LGA1700', 'Mini-ITX', 'DDR5', 41),
  motherboardPart('ASRock H610M-HDV/M.2', 85, 'LGA1700', 'Micro-ATX', 'DDR4', 24),
  motherboardPart('MSI PRO H610M-G DDR4', 78, 'LGA1700', 'Micro-ATX', 'DDR4', 22),
  motherboardPart('Gigabyte H610I DDR4', 110, 'LGA1700', 'Mini-ITX', 'DDR4', 24),
  motherboardPart('ASUS PRIME H770-PLUS D4', 145, 'LGA1700', 'ATX', 'DDR4', 34),
  motherboardPart('ASRock Z690 Phantom Gaming 4', 150, 'LGA1700', 'ATX', 'DDR4', 38),
  motherboardPart('MSI PRO B650-P WIFI', 180, 'AM5', 'ATX', 'DDR5', 42),
  motherboardPart('Gigabyte B650 AORUS Elite AX', 200, 'AM5', 'ATX', 'DDR5', 45),
  motherboardPart('ASRock B650M PG Riptide', 165, 'AM5', 'Micro-ATX', 'DDR5', 39),
  motherboardPart('ASUS ROG Strix B650E-F Gaming WiFi', 290, 'AM5', 'ATX', 'DDR5', 56),
  motherboardPart('MSI MAG B650 Tomahawk WIFI', 220, 'AM5', 'ATX', 'DDR5', 48),
  motherboardPart('ASRock B650E Taichi Lite', 280, 'AM5', 'ATX', 'DDR5', 58),
  motherboardPart('Gigabyte B650M AORUS Elite AX', 180, 'AM5', 'Micro-ATX', 'DDR5', 42),
  motherboardPart('ASUS PRIME B650M-A AX II', 155, 'AM5', 'Micro-ATX', 'DDR5', 36),
  motherboardPart('MSI PRO B650M-A WIFI', 160, 'AM5', 'Micro-ATX', 'DDR5', 37),
  motherboardPart('ASRock A620M Pro RS WiFi', 125, 'AM5', 'Micro-ATX', 'DDR5', 28),
  motherboardPart('Gigabyte A620I AX', 150, 'AM5', 'Mini-ITX', 'DDR5', 30),
  motherboardPart('ASUS ROG Strix X670E-E Gaming WiFi', 480, 'AM5', 'ATX', 'DDR5', 72),
  motherboardPart('MSI MPG X670E Carbon WIFI', 430, 'AM5', 'ATX', 'DDR5', 68),
  motherboardPart('Gigabyte X670E AORUS Master', 450, 'AM5', 'ATX', 'DDR5', 70),
  motherboardPart('ASRock X670E Steel Legend', 300, 'AM5', 'ATX', 'DDR5', 60),
  motherboardPart('ASUS TUF Gaming X670E-PLUS WIFI', 320, 'AM5', 'ATX', 'DDR5', 61),
  motherboardPart('MSI MPG B650I Edge WIFI', 250, 'AM5', 'Mini-ITX', 'DDR5', 46),
  motherboardPart('ASUS ROG Strix B650E-I Gaming WiFi', 320, 'AM5', 'Mini-ITX', 'DDR5', 55),
  motherboardPart('Gigabyte B650I AORUS Ultra', 260, 'AM5', 'Mini-ITX', 'DDR5', 48),
  motherboardPart('ASRock B650E PG-ITX WiFi', 290, 'AM5', 'Mini-ITX', 'DDR5', 52),
])

const cpus = makeParts('cpu', [
  cpuPart('Intel Core i5-13600K', 218, 'LGA1700', 125, 94, 'cpu-volt-560'),
  cpuPart('AMD Ryzen 5 7600X', 284, 'AM5', 105, 88, 'cpu-aurora-760'),
  cpuPart('Intel Core i3-12100F', 164, 'LGA1700', 58, 58, 'cpu-ember-410'),
  cpuPart('Intel Core i3-13100F', 120, 'LGA1700', 58, 62),
  cpuPart('Intel Core i3-14100F', 130, 'LGA1700', 58, 66),
  cpuPart('Intel Core i5-12400F', 145, 'LGA1700', 65, 70),
  cpuPart('Intel Core i5-12500', 180, 'LGA1700', 65, 74),
  cpuPart('Intel Core i5-12600K', 205, 'LGA1700', 125, 82),
  cpuPart('Intel Core i5-13400F', 185, 'LGA1700', 65, 78),
  cpuPart('Intel Core i5-13500', 230, 'LGA1700', 65, 84),
  cpuPart('Intel Core i5-14400F', 210, 'LGA1700', 65, 82),
  cpuPart('Intel Core i5-14500', 250, 'LGA1700', 65, 88),
  cpuPart('Intel Core i5-14600K', 300, 'LGA1700', 125, 102),
  cpuPart('Intel Core i7-12700F', 260, 'LGA1700', 65, 92),
  cpuPart('Intel Core i7-12700K', 300, 'LGA1700', 125, 98),
  cpuPart('Intel Core i7-13700F', 330, 'LGA1700', 65, 108),
  cpuPart('Intel Core i7-13700K', 380, 'LGA1700', 125, 116),
  cpuPart('Intel Core i7-14700F', 360, 'LGA1700', 65, 120),
  cpuPart('Intel Core i7-14700K', 420, 'LGA1700', 125, 128),
  cpuPart('Intel Core i9-12900K', 420, 'LGA1700', 125, 120),
  cpuPart('Intel Core i9-13900K', 520, 'LGA1700', 125, 140),
  cpuPart('Intel Core i9-13900KS', 620, 'LGA1700', 150, 145),
  cpuPart('Intel Core i9-14900K', 560, 'LGA1700', 125, 148),
  cpuPart('Intel Core i9-14900KS', 690, 'LGA1700', 150, 154),
  cpuPart('Intel Core i5-13600KF', 240, 'LGA1700', 125, 93),
  cpuPart('Intel Core i7-14700KF', 395, 'LGA1700', 125, 127),
  cpuPart('Intel Core i9-14900KF', 530, 'LGA1700', 125, 147),
  cpuPart('Intel Core i5-12600KF', 190, 'LGA1700', 125, 81),
  cpuPart('Intel Core i7-13700KF', 360, 'LGA1700', 125, 115),
  cpuPart('Intel Core i9-12900KF', 390, 'LGA1700', 125, 119),
  cpuPart('AMD Ryzen 5 7500F', 165, 'AM5', 65, 78),
  cpuPart('AMD Ryzen 5 7600', 210, 'AM5', 65, 84),
  cpuPart('AMD Ryzen 5 8500G', 180, 'AM5', 65, 72),
  cpuPart('AMD Ryzen 5 8600G', 230, 'AM5', 65, 82),
  cpuPart('AMD Ryzen 5 9600X', 280, 'AM5', 65, 94),
  cpuPart('AMD Ryzen 7 7700', 300, 'AM5', 65, 98),
  cpuPart('AMD Ryzen 7 7700X', 340, 'AM5', 105, 104),
  cpuPart('AMD Ryzen 7 7800X3D', 380, 'AM5', 120, 122),
  cpuPart('AMD Ryzen 7 8700G', 320, 'AM5', 65, 92),
  cpuPart('AMD Ryzen 7 9700X', 360, 'AM5', 65, 112),
  cpuPart('AMD Ryzen 7 9800X3D', 480, 'AM5', 120, 135),
  cpuPart('AMD Ryzen 9 7900', 380, 'AM5', 65, 118),
  cpuPart('AMD Ryzen 9 7900X', 430, 'AM5', 170, 126),
  cpuPart('AMD Ryzen 9 7900X3D', 500, 'AM5', 120, 132),
  cpuPart('AMD Ryzen 9 7950X', 560, 'AM5', 170, 146),
  cpuPart('AMD Ryzen 9 7950X3D', 650, 'AM5', 120, 152),
  cpuPart('AMD Ryzen 9 9900X', 480, 'AM5', 120, 138),
  cpuPart('AMD Ryzen 9 9950X', 650, 'AM5', 170, 158),
  cpuPart('AMD Ryzen 9 9900X3D', 600, 'AM5', 120, 148),
  cpuPart('AMD Ryzen 9 9950X3D', 730, 'AM5', 170, 166),
  cpuPart('AMD Ryzen 5 7600X3D', 300, 'AM5', 65, 104),
  cpuPart('AMD Ryzen 7 7700X3D', 360, 'AM5', 105, 112),
  cpuPart('AMD Ryzen 5 8400F', 170, 'AM5', 65, 76),
  cpuPart('AMD Ryzen 5 7400F', 150, 'AM5', 65, 72),
  cpuPart('AMD Ryzen 7 8700F', 270, 'AM5', 65, 88),
  cpuPart('AMD Ryzen 7 9700F', 330, 'AM5', 65, 106),
  cpuPart('AMD Ryzen 9 7900F', 350, 'AM5', 65, 112),
  cpuPart('AMD Ryzen 9 9900F', 430, 'AM5', 120, 132),
  cpuPart('AMD Ryzen 5 9500F', 220, 'AM5', 65, 86),
  cpuPart('AMD Ryzen 7 7800X', 340, 'AM5', 120, 108),
])

const gpus = makeParts('gpu', [
  gpuPart('GeForce RTX 4060', 226, 115, 74, 200, 'gpu-rift-220'),
  gpuPart('Radeon RX 7800 XT', 392, 263, 112, 267, 'gpu-rift-480'),
  gpuPart('GeForce RTX 4090 Founders Edition', 618, 450, 148, 304, 'gpu-titan-slate'),
  gpuPart('GeForce GTX 1660 SUPER', 180, 125, 48, 229),
  gpuPart('GeForce RTX 2060', 220, 160, 58, 229),
  gpuPart('GeForce RTX 3060 12GB', 290, 170, 70, 242),
  gpuPart('GeForce RTX 3060 Ti', 340, 200, 82, 242),
  gpuPart('GeForce RTX 3070', 420, 220, 92, 242),
  gpuPart('GeForce RTX 3070 Ti', 470, 290, 98, 267),
  gpuPart('GeForce RTX 3080 10GB', 590, 320, 114, 285),
  gpuPart('GeForce RTX 3080 Ti', 700, 350, 122, 285),
  gpuPart('GeForce RTX 3090', 850, 350, 128, 313),
  gpuPart('GeForce RTX 3090 Ti', 1000, 450, 134, 313),
  gpuPart('GeForce RTX 4060 Ti 8GB', 350, 160, 88, 240),
  gpuPart('GeForce RTX 4060 Ti 16GB', 420, 165, 90, 240),
  gpuPart('GeForce RTX 4070', 550, 200, 104, 244),
  gpuPart('GeForce RTX 4070 SUPER', 600, 220, 114, 244),
  gpuPart('GeForce RTX 4070 Ti', 760, 285, 122, 285),
  gpuPart('GeForce RTX 4070 Ti SUPER', 820, 285, 130, 285),
  gpuPart('GeForce RTX 4080', 1050, 320, 138, 304),
  gpuPart('GeForce RTX 4080 SUPER', 1000, 320, 142, 304),
  gpuPart('GeForce RTX 5070', 600, 250, 130, 280),
  gpuPart('GeForce RTX 5070 Ti', 750, 300, 140, 300),
  gpuPart('GeForce RTX 5080', 1100, 360, 158, 304),
  gpuPart('GeForce RTX 5090', 1800, 575, 185, 360),
  gpuPart('Radeon RX 6500 XT', 160, 107, 42, 191),
  gpuPart('Radeon RX 6600', 210, 132, 58, 241),
  gpuPart('Radeon RX 6600 XT', 250, 160, 66, 241),
  gpuPart('Radeon RX 6650 XT', 270, 180, 70, 241),
  gpuPart('Radeon RX 6700 XT', 350, 230, 84, 267),
  gpuPart('Radeon RX 6750 XT', 380, 250, 88, 267),
  gpuPart('Radeon RX 6800', 460, 250, 96, 267),
  gpuPart('Radeon RX 6800 XT', 520, 300, 108, 267),
  gpuPart('Radeon RX 6900 XT', 600, 300, 116, 267),
  gpuPart('Radeon RX 6950 XT', 680, 335, 122, 305),
  gpuPart('Radeon RX 7600', 260, 165, 68, 204),
  gpuPart('Radeon RX 7600 XT', 330, 190, 76, 204),
  gpuPart('Radeon RX 7700 XT', 420, 245, 96, 267),
  gpuPart('Radeon RX 7900 GRE', 550, 260, 116, 276),
  gpuPart('Radeon RX 7900 XT', 750, 315, 132, 287),
  gpuPart('Radeon RX 7900 XTX', 950, 355, 144, 287),
  gpuPart('Radeon RX 9060 XT', 330, 170, 86, 230),
  gpuPart('Radeon RX 9070', 550, 220, 126, 270),
  gpuPart('Radeon RX 9070 XT', 650, 304, 138, 290),
  gpuPart('Intel Arc A380', 120, 75, 36, 190),
  gpuPart('Intel Arc A580', 180, 185, 58, 267),
  gpuPart('Intel Arc A750', 230, 225, 70, 280),
  gpuPart('Intel Arc A770 16GB', 300, 225, 78, 280),
  gpuPart('Intel Arc B570', 230, 150, 72, 240),
  gpuPart('Intel Arc B580', 270, 190, 84, 250),
  gpuPart('ASUS Dual GeForce RTX 3060 V2 OC', 300, 170, 71, 200),
  gpuPart('MSI Ventus 2X GeForce RTX 4060 OC', 300, 115, 75, 199),
  gpuPart('Gigabyte Eagle Radeon RX 6600', 220, 132, 59, 282),
  gpuPart('Sapphire Pulse Radeon RX 7600 XT', 340, 190, 77, 250),
  gpuPart('PowerColor Hellhound Radeon RX 7900 XT', 760, 315, 133, 320),
  gpuPart('Zotac Gaming GeForce RTX 4070 Twin Edge', 560, 200, 105, 226),
  gpuPart('PNY GeForce RTX 4080 SUPER Verto', 1000, 320, 141, 331),
  gpuPart('MSI Gaming X Slim GeForce RTX 4070 Ti SUPER', 850, 285, 131, 307),
  gpuPart('ASUS TUF Gaming GeForce RTX 4090 OC', 1700, 450, 150, 348),
  gpuPart('Sapphire Nitro+ Radeon RX 7900 XTX Vapor-X', 1050, 355, 146, 320),
])

const ram = makeParts('ram', [
  ramPart('Corsair Vengeance LPX 16GB DDR4', 58, 'DDR4', 8, 34, 'ram-luma-16-ddr4'),
  ramPart('Kingston Fury Beast 32GB DDR5', 112, 'DDR5', 10, 58, 'ram-luma-32-ddr5'),
  ramPart('G.Skill Trident Z5 RGB 64GB DDR5', 198, 'DDR5', 16, 82, 'ram-zenith-64-ddr5'),
  ramPart('G.Skill Ripjaws V 16GB DDR4-3200', 45, 'DDR4', 8, 30),
  ramPart('G.Skill Ripjaws V 32GB DDR4-3600', 68, 'DDR4', 9, 42),
  ramPart('Corsair Vengeance RGB Pro 16GB DDR4-3200', 55, 'DDR4', 8, 32),
  ramPart('Corsair Vengeance RGB Pro 32GB DDR4-3600', 85, 'DDR4', 10, 44),
  ramPart('Kingston Fury Renegade 16GB DDR4-3600', 58, 'DDR4', 8, 35),
  ramPart('Kingston Fury Renegade 32GB DDR4-3600', 90, 'DDR4', 10, 46),
  ramPart('Crucial Ballistix 16GB DDR4-3200', 50, 'DDR4', 8, 31),
  ramPart('TeamGroup T-Force Vulcan Z 16GB DDR4-3200', 42, 'DDR4', 8, 29),
  ramPart('TeamGroup T-Force Delta RGB 32GB DDR4-3600', 82, 'DDR4', 10, 45),
  ramPart('Patriot Viper Steel 16GB DDR4-4400', 70, 'DDR4', 10, 42),
  ramPart('Patriot Viper Steel 32GB DDR4-3600', 88, 'DDR4', 10, 46),
  ramPart('ADATA XPG Spectrix D50 16GB DDR4-3600', 62, 'DDR4', 9, 36),
  ramPart('ADATA XPG Spectrix D50 32GB DDR4-3600', 95, 'DDR4', 10, 47),
  ramPart('PNY XLR8 Gaming 16GB DDR4-3200', 46, 'DDR4', 8, 30),
  ramPart('PNY XLR8 Gaming 32GB DDR4-3600', 78, 'DDR4', 10, 44),
  ramPart('Silicon Power XPOWER Turbine 16GB DDR4-3200', 40, 'DDR4', 8, 28),
  ramPart('Silicon Power XPOWER Turbine 32GB DDR4-3200', 70, 'DDR4', 9, 40),
  ramPart('Mushkin Redline 16GB DDR4-3600', 56, 'DDR4', 8, 34),
  ramPart('Mushkin Redline 32GB DDR4-3600', 86, 'DDR4', 10, 45),
  ramPart('Thermaltake TOUGHRAM RGB 16GB DDR4-3600', 68, 'DDR4', 9, 37),
  ramPart('Thermaltake TOUGHRAM RGB 32GB DDR4-3600', 105, 'DDR4', 10, 48),
  ramPart('GeIL Orion RGB 16GB DDR4-3600', 58, 'DDR4', 8, 35),
  ramPart('GeIL Orion RGB 32GB DDR4-3600', 88, 'DDR4', 10, 46),
  ramPart('Kingston Fury Beast 16GB DDR5-5200', 60, 'DDR5', 8, 44),
  ramPart('Kingston Fury Beast 32GB DDR5-5600', 95, 'DDR5', 10, 54),
  ramPart('Kingston Fury Beast 64GB DDR5-6000', 180, 'DDR5', 16, 76),
  ramPart('Corsair Vengeance 32GB DDR5-5600', 92, 'DDR5', 10, 53),
  ramPart('Corsair Vengeance 32GB DDR5-6000', 110, 'DDR5', 10, 59),
  ramPart('Corsair Dominator Titanium 32GB DDR5-6400', 180, 'DDR5', 12, 66),
  ramPart('Corsair Dominator Titanium 64GB DDR5-6600', 330, 'DDR5', 18, 90),
  ramPart('G.Skill Ripjaws S5 32GB DDR5-6000', 105, 'DDR5', 10, 58),
  ramPart('G.Skill Flare X5 32GB DDR5-6000', 110, 'DDR5', 10, 60),
  ramPart('G.Skill Trident Z5 Neo RGB 32GB DDR5-6000', 125, 'DDR5', 11, 62),
  ramPart('G.Skill Trident Z5 RGB 48GB DDR5-7200', 210, 'DDR5', 15, 84),
  ramPart('TeamGroup T-Force Delta RGB 32GB DDR5-6000', 112, 'DDR5', 10, 60),
  ramPart('TeamGroup T-Force Delta RGB 64GB DDR5-6000', 210, 'DDR5', 16, 78),
  ramPart('TeamGroup T-Create Expert 32GB DDR5-6000', 100, 'DDR5', 10, 57),
  ramPart('Crucial Pro 32GB DDR5-5600', 85, 'DDR5', 10, 51),
  ramPart('Crucial Pro Overclocking 32GB DDR5-6000', 98, 'DDR5', 10, 56),
  ramPart('ADATA XPG Lancer RGB 32GB DDR5-6000', 112, 'DDR5', 10, 59),
  ramPart('ADATA XPG Lancer Blade 32GB DDR5-6400', 125, 'DDR5', 11, 64),
  ramPart('Patriot Viper Venom RGB 32GB DDR5-6000', 108, 'DDR5', 10, 58),
  ramPart('Patriot Viper Xtreme 5 48GB DDR5-8000', 260, 'DDR5', 16, 92),
  ramPart('PNY XLR8 MAKO 32GB DDR5-6000', 110, 'DDR5', 10, 58),
  ramPart('PNY XLR8 Gaming 64GB DDR5-6000', 205, 'DDR5', 16, 78),
  ramPart('Lexar ARES RGB 32GB DDR5-6400', 120, 'DDR5', 11, 64),
  ramPart('Lexar THOR OC 32GB DDR5-6000', 105, 'DDR5', 10, 58),
  ramPart('KLEVV CRAS V RGB 32GB DDR5-6400', 125, 'DDR5', 11, 64),
  ramPart('KLEVV BOLT V 32GB DDR5-6000', 100, 'DDR5', 10, 57),
  ramPart('Silicon Power XPOWER Zenith 32GB DDR5-6000', 98, 'DDR5', 10, 56),
  ramPart('Silicon Power XPOWER Zenith RGB 64GB DDR5-6000', 190, 'DDR5', 16, 76),
  ramPart('Thermaltake TOUGHRAM XG RGB 32GB DDR5-6000', 130, 'DDR5', 11, 62),
  ramPart('Thermaltake TOUGHRAM XG RGB 64GB DDR5-6000', 240, 'DDR5', 16, 80),
  ramPart('GeIL Polaris RGB 32GB DDR5-6000', 115, 'DDR5', 10, 59),
  ramPart('GeIL EVO V 32GB DDR5-6200', 125, 'DDR5', 11, 62),
  ramPart('V-Color Manta XPrism 32GB DDR5-7200', 180, 'DDR5', 13, 78),
  ramPart('V-Color Manta XSky 64GB DDR5-6000', 210, 'DDR5', 16, 78),
])

const storage = makeParts('storage', [
  storagePart('Samsung 980 PRO 1TB', 84, 'M.2', 6, 55, 'ssd-spark-m2'),
  storagePart('Crucial MX500 2TB', 72, 'SATA', 8, 34, 'ssd-dock-sata'),
  storagePart('Samsung 990 PRO 1TB', 105, 'M.2', 7, 68),
  storagePart('Samsung 990 PRO 2TB', 170, 'M.2', 8, 76),
  storagePart('Samsung 970 EVO Plus 1TB', 75, 'M.2', 6, 50),
  storagePart('WD Black SN850X 1TB', 95, 'M.2', 7, 66),
  storagePart('WD Black SN850X 2TB', 155, 'M.2', 8, 75),
  storagePart('WD Blue SN580 1TB', 65, 'M.2', 5, 48),
  storagePart('Crucial P3 Plus 1TB', 58, 'M.2', 5, 46),
  storagePart('Crucial P5 Plus 2TB', 125, 'M.2', 7, 64),
  storagePart('Crucial T500 2TB', 150, 'M.2', 7, 74),
  storagePart('Solidigm P44 Pro 1TB', 90, 'M.2', 6, 64),
  storagePart('SK hynix Platinum P41 2TB', 160, 'M.2', 7, 76),
  storagePart('Kingston KC3000 2TB', 145, 'M.2', 8, 72),
  storagePart('Kingston NV2 1TB', 55, 'M.2', 5, 42),
  storagePart('Seagate FireCuda 530 2TB', 170, 'M.2', 8, 78),
  storagePart('Sabrent Rocket 4 Plus 2TB', 160, 'M.2', 8, 74),
  storagePart('Corsair MP600 PRO LPX 2TB', 155, 'M.2', 8, 74),
  storagePart('ADATA XPG Gammix S70 Blade 1TB', 80, 'M.2', 7, 62),
  storagePart('TeamGroup Cardea A440 Pro 2TB', 135, 'M.2', 7, 70),
  storagePart('Lexar NM790 2TB', 120, 'M.2', 6, 68),
  storagePart('PNY CS3140 1TB', 95, 'M.2', 7, 62),
  storagePart('Patriot Viper VP4300 Lite 2TB', 125, 'M.2', 7, 69),
  storagePart('Inland Performance Plus 2TB', 140, 'M.2', 8, 70),
  storagePart('Samsung 870 EVO 1TB', 80, 'SATA', 7, 32),
  storagePart('Samsung 870 EVO 2TB', 140, 'SATA', 8, 36),
  storagePart('Samsung 870 QVO 4TB', 220, 'SATA', 8, 38),
  storagePart('Crucial BX500 1TB', 55, 'SATA', 6, 25),
  storagePart('WD Blue SA510 1TB', 70, 'SATA', 6, 28),
  storagePart('Kingston A400 960GB', 50, 'SATA', 5, 24),
  storagePart('Kingston KC600 1TB', 85, 'SATA', 6, 32),
  storagePart('SanDisk Ultra 3D 1TB', 75, 'SATA', 6, 31),
  storagePart('Seagate BarraCuda 2TB HDD', 55, 'SATA', 8, 18),
  storagePart('Seagate BarraCuda 4TB HDD', 85, 'SATA', 9, 22),
  storagePart('WD Blue 2TB HDD', 55, 'SATA', 8, 18),
  storagePart('WD Black 4TB HDD', 130, 'SATA', 10, 26),
  storagePart('Toshiba X300 6TB HDD', 140, 'SATA', 10, 27),
  storagePart('TeamGroup GX2 1TB', 48, 'SATA', 5, 24),
  storagePart('Patriot P210 1TB', 45, 'SATA', 5, 23),
  storagePart('PNY CS900 1TB', 50, 'SATA', 5, 24),
])

const psus = makeParts('psu', [
  psuPart('Corsair CX450M 450W', 64, 450, 'psu-bronze-450'),
  psuPart('Corsair RM750e 750W', 118, 750, 'psu-gold-750'),
  psuPart('Corsair CX550M 550W', 75, 550),
  psuPart('Corsair CX650M 650W', 85, 650),
  psuPart('Corsair RM650e 650W', 105, 650),
  psuPart('Corsair RM850e 850W', 135, 850),
  psuPart('Corsair RM850x 850W', 150, 850),
  psuPart('Corsair RM1000x 1000W', 190, 1000),
  psuPart('Corsair HX1000i 1000W', 240, 1000),
  psuPart('Seasonic Focus GX-550 550W', 95, 550),
  psuPart('Seasonic Focus GX-650 650W', 110, 650),
  psuPart('Seasonic Focus GX-750 750W', 130, 750),
  psuPart('Seasonic Focus GX-850 850W', 150, 850),
  psuPart('Seasonic Vertex GX-1000 1000W', 240, 1000),
  psuPart('EVGA SuperNOVA 650 GT 650W', 100, 650),
  psuPart('EVGA SuperNOVA 750 GT 750W', 120, 750),
  psuPart('EVGA SuperNOVA 850 G6 850W', 155, 850),
  psuPart('EVGA SuperNOVA 1000 G6 1000W', 205, 1000),
  psuPart('be quiet! Pure Power 12 M 550W', 95, 550),
  psuPart('be quiet! Pure Power 12 M 650W', 110, 650),
  psuPart('be quiet! Pure Power 12 M 750W', 130, 750),
  psuPart('be quiet! Straight Power 12 850W', 180, 850),
  psuPart('be quiet! Dark Power 13 1000W', 270, 1000),
  psuPart('Thermaltake Toughpower GF A3 650W', 95, 650),
  psuPart('Thermaltake Toughpower GF A3 750W', 115, 750),
  psuPart('Thermaltake Toughpower GF3 850W', 155, 850),
  psuPart('Thermaltake Toughpower GF3 1000W', 200, 1000),
  psuPart('Cooler Master MWE Gold 650 V2', 95, 650),
  psuPart('Cooler Master MWE Gold 750 V2', 115, 750),
  psuPart('Cooler Master V850 Gold V2', 145, 850),
  psuPart('Cooler Master V1100 SFX Platinum', 290, 1100),
  psuPart('MSI MAG A650GL 650W', 90, 650),
  psuPart('MSI MAG A750GL PCIE5 750W', 110, 750),
  psuPart('MSI MPG A850G PCIE5 850W', 150, 850),
  psuPart('MSI MEG Ai1000P PCIE5 1000W', 260, 1000),
  psuPart('ASUS TUF Gaming 750W Gold', 130, 750),
  psuPart('ASUS ROG Strix 850W Gold Aura', 180, 850),
  psuPart('ASUS ROG Thor 1000W Platinum II', 330, 1000),
  psuPart('FSP Hydro G Pro 850W', 150, 850),
  psuPart('SilverStone SX750 Platinum 750W SFX', 170, 750),
])

const coolers = makeParts('cooler', [
  coolerPart('Cooler Master Hyper 212 Black Edition', 38, 4, 4, ['LGA1700', 'AM5'], 'CPU cooler mount', 'cooler-breeze-120'),
  coolerPart('NZXT Kraken 240', 86, 9, 10, ['LGA1700', 'AM5'], '240mm radiator mount', 'cooler-frost-240'),
  coolerPart('DeepCool AK400', 35, 3, 5, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('DeepCool AK500', 55, 4, 7, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('DeepCool AK620', 65, 5, 9, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Noctua NH-U12S Redux', 55, 2, 7, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Noctua NH-U12A', 120, 3, 10, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Noctua NH-D15 chromax.black', 120, 4, 12, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('be quiet! Pure Rock 2', 45, 3, 6, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('be quiet! Dark Rock 4', 75, 3, 8, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('be quiet! Dark Rock Pro 5', 100, 4, 11, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Thermalright Peerless Assassin 120 SE', 38, 4, 10, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Thermalright Phantom Spirit 120 SE', 42, 4, 11, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Scythe Fuma 3', 50, 4, 9, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Arctic Freezer 36', 35, 3, 7, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Arctic Freezer 34 eSports DUO', 48, 4, 8, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('ID-Cooling SE-224-XTS', 28, 3, 5, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('ID-Cooling FROZN A620', 60, 5, 9, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Corsair A115', 100, 4, 11, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Cooler Master Hyper 622 Halo', 70, 5, 9, ['LGA1700', 'AM5'], 'CPU cooler mount'),
  coolerPart('Arctic Liquid Freezer III 240', 90, 8, 12, ['LGA1700', 'AM5'], '240mm radiator mount'),
  coolerPart('Arctic Liquid Freezer III 280', 105, 9, 14, ['LGA1700', 'AM5'], '280mm radiator mount'),
  coolerPart('Arctic Liquid Freezer III 360', 125, 10, 16, ['LGA1700', 'AM5'], '360mm radiator mount'),
  coolerPart('Corsair iCUE H100i Elite Capellix XT', 150, 9, 13, ['LGA1700', 'AM5'], '240mm radiator mount'),
  coolerPart('Corsair iCUE H150i Elite Capellix XT', 190, 11, 16, ['LGA1700', 'AM5'], '360mm radiator mount'),
  coolerPart('NZXT Kraken 280', 150, 10, 14, ['LGA1700', 'AM5'], '280mm radiator mount'),
  coolerPart('NZXT Kraken Elite 360', 290, 12, 18, ['LGA1700', 'AM5'], '360mm radiator mount'),
  coolerPart('DeepCool LS520 SE', 90, 9, 12, ['LGA1700', 'AM5'], '240mm radiator mount'),
  coolerPart('DeepCool LS720 SE', 115, 11, 15, ['LGA1700', 'AM5'], '360mm radiator mount'),
  coolerPart('Lian Li Galahad II Trinity 240', 120, 9, 13, ['LGA1700', 'AM5'], '240mm radiator mount'),
  coolerPart('Lian Li Galahad II Trinity 360', 160, 11, 16, ['LGA1700', 'AM5'], '360mm radiator mount'),
  coolerPart('be quiet! Pure Loop 2 FX 240', 120, 9, 12, ['LGA1700', 'AM5'], '240mm radiator mount'),
  coolerPart('be quiet! Silent Loop 2 360', 170, 11, 15, ['LGA1700', 'AM5'], '360mm radiator mount'),
  coolerPart('MSI MAG CoreLiquid E240', 100, 9, 12, ['LGA1700', 'AM5'], '240mm radiator mount'),
  coolerPart('MSI MAG CoreLiquid E360', 135, 11, 15, ['LGA1700', 'AM5'], '360mm radiator mount'),
  coolerPart('ASUS ROG Ryujin III 240', 260, 10, 15, ['LGA1700', 'AM5'], '240mm radiator mount'),
  coolerPart('ASUS ROG Ryujin III 360', 330, 12, 18, ['LGA1700', 'AM5'], '360mm radiator mount'),
  coolerPart('EK Nucleus AIO CR240 Lux D-RGB', 130, 9, 13, ['LGA1700', 'AM5'], '240mm radiator mount'),
  coolerPart('EK Nucleus AIO CR360 Lux D-RGB', 180, 11, 16, ['LGA1700', 'AM5'], '360mm radiator mount'),
  coolerPart('Thermaltake TH360 V2 Ultra ARGB', 180, 12, 16, ['LGA1700', 'AM5'], '360mm radiator mount'),
])

export const components: PCPart[] = [
  ...cases,
  ...motherboards,
  ...cpus,
  ...gpus,
  ...ram,
  ...storage,
  ...psus,
  ...coolers,
]

export const componentsById = components.reduce(
  (index, part) => ({ ...index, [part.id]: part }),
  {} as Record<string, PCPart>,
)

export const componentsByType = components.reduce(
  (groups, part) => {
    groups[part.type].push(part)
    return groups
  },
  {
    case: [],
    motherboard: [],
    cpu: [],
    gpu: [],
    ram: [],
    storage: [],
    psu: [],
    cooler: [],
  } as Record<PartType, PCPart[]>,
)

export function createEmptyBuild(): BuildSlots {
  return { ...emptyBuild }
}

export function getInstalledPart(build: BuildSlots, type: PartType) {
  const partId = build[type]
  return partId ? componentsById[partId] : undefined
}

export function getInstalledParts(build: BuildSlots) {
  return requiredPartTypes
    .map((type) => getInstalledPart(build, type))
    .filter((part): part is PCPart => Boolean(part))
}
