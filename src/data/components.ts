import type { BuildSlots, PCPart, PartCategory, PartType } from '../types'

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

export const components: PCPart[] = [
  {
    id: 'case-atlas-flow',
    name: 'Atlas Flow Tower',
    type: 'case',
    price: 92,
    powerDraw: 0,
    performanceScore: 0,
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLength: 340,
    requiredSlot: 'Tower frame',
  },
  {
    id: 'case-nova-compact',
    name: 'Nova Compact M',
    type: 'case',
    price: 74,
    powerDraw: 0,
    performanceScore: 0,
    supportedFormFactors: ['Micro-ATX', 'Mini-ITX'],
    maxGpuLength: 275,
    requiredSlot: 'Compact frame',
  },
  {
    id: 'mb-orion-z5',
    name: 'Orion Z5 ATX',
    type: 'motherboard',
    price: 186,
    powerDraw: 55,
    performanceScore: 42,
    socket: 'LGA1700',
    formFactor: 'ATX',
    ramType: 'DDR5',
    storageSlots: ['M.2', 'SATA'],
    requiredSlot: 'ATX motherboard tray',
  },
  {
    id: 'mb-sable-m4',
    name: 'Sable M4 Micro',
    type: 'motherboard',
    price: 132,
    powerDraw: 42,
    performanceScore: 35,
    socket: 'AM5',
    formFactor: 'Micro-ATX',
    ramType: 'DDR4',
    storageSlots: ['SATA'],
    requiredSlot: 'Micro-ATX motherboard tray',
  },
  {
    id: 'cpu-volt-560',
    name: 'VoltCore 560',
    type: 'cpu',
    price: 218,
    powerDraw: 95,
    performanceScore: 76,
    socket: 'LGA1700',
    requiredSlot: 'CPU socket',
  },
  {
    id: 'cpu-aurora-760',
    name: 'Aurora 760X',
    type: 'cpu',
    price: 284,
    powerDraw: 125,
    performanceScore: 92,
    socket: 'AM5',
    requiredSlot: 'CPU socket',
  },
  {
    id: 'cpu-ember-410',
    name: 'Ember 410',
    type: 'cpu',
    price: 164,
    powerDraw: 65,
    performanceScore: 58,
    socket: 'LGA1700',
    requiredSlot: 'CPU socket',
  },
  {
    id: 'gpu-rift-220',
    name: 'Rift 220 Mini',
    type: 'gpu',
    price: 226,
    powerDraw: 120,
    performanceScore: 74,
    length: 218,
    requiredSlot: 'PCIe x16',
  },
  {
    id: 'gpu-rift-480',
    name: 'Rift 480 Twin',
    type: 'gpu',
    price: 392,
    powerDraw: 215,
    performanceScore: 112,
    length: 286,
    requiredSlot: 'PCIe x16',
  },
  {
    id: 'gpu-titan-slate',
    name: 'Titan Slate X',
    type: 'gpu',
    price: 618,
    powerDraw: 320,
    performanceScore: 148,
    length: 330,
    requiredSlot: 'PCIe x16',
  },
  {
    id: 'ram-luma-16-ddr4',
    name: 'Luma 16 DDR4',
    type: 'ram',
    price: 58,
    powerDraw: 8,
    performanceScore: 34,
    ramType: 'DDR4',
    requiredSlot: 'DIMM',
  },
  {
    id: 'ram-luma-32-ddr5',
    name: 'Luma 32 DDR5',
    type: 'ram',
    price: 112,
    powerDraw: 10,
    performanceScore: 58,
    ramType: 'DDR5',
    requiredSlot: 'DIMM',
  },
  {
    id: 'ram-zenith-64-ddr5',
    name: 'Zenith 64 DDR5',
    type: 'ram',
    price: 198,
    powerDraw: 16,
    performanceScore: 82,
    ramType: 'DDR5',
    requiredSlot: 'DIMM',
  },
  {
    id: 'ssd-spark-m2',
    name: 'Spark NV 1TB',
    type: 'storage',
    price: 84,
    powerDraw: 6,
    performanceScore: 55,
    storageType: 'M.2',
    requiredSlot: 'M.2',
  },
  {
    id: 'ssd-dock-sata',
    name: 'Dock SATA 2TB',
    type: 'storage',
    price: 72,
    powerDraw: 8,
    performanceScore: 34,
    storageType: 'SATA',
    requiredSlot: 'SATA',
  },
  {
    id: 'psu-bronze-450',
    name: 'BronzeRail 450W',
    type: 'psu',
    price: 64,
    powerDraw: 0,
    performanceScore: 0,
    wattage: 450,
    requiredSlot: 'ATX PSU bay',
  },
  {
    id: 'psu-gold-750',
    name: 'GoldRail 750W',
    type: 'psu',
    price: 118,
    powerDraw: 0,
    performanceScore: 0,
    wattage: 750,
    requiredSlot: 'ATX PSU bay',
  },
  {
    id: 'cooler-breeze-120',
    name: 'Breeze 120 Air',
    type: 'cooler',
    price: 38,
    powerDraw: 4,
    performanceScore: 4,
    compatibleWith: ['LGA1700', 'AM5'],
    requiredSlot: 'CPU cooler mount',
  },
  {
    id: 'cooler-frost-240',
    name: 'FrostLoop 240',
    type: 'cooler',
    price: 86,
    powerDraw: 9,
    performanceScore: 10,
    compatibleWith: ['AM5'],
    requiredSlot: 'AM5 liquid bracket',
  },
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
