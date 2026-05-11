export type PartType =
  | 'case'
  | 'motherboard'
  | 'cpu'
  | 'gpu'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'cooler'

export type GameState =
  | 'assembling'
  | 'checking'
  | 'post_error'
  | 'bios'
  | 'booting'
  | 'os_running'
  | 'shutdown'

export type CpuSocket = 'LGA1700' | 'AM5'
export type FormFactor = 'ATX' | 'Micro-ATX' | 'Mini-ITX'
export type RamType = 'DDR4' | 'DDR5'
export type StorageType = 'M.2' | 'SATA'

export type BuildSlots = Record<PartType, string | null>

export interface PCPart {
  id: string
  name: string
  type: PartType
  price: number
  powerDraw: number
  performanceScore: number
  socket?: CpuSocket
  formFactor?: FormFactor
  supportedFormFactors?: FormFactor[]
  maxGpuLength?: number
  length?: number
  ramType?: RamType
  storageType?: StorageType
  storageSlots?: StorageType[]
  wattage?: number
  compatibleWith?: CpuSocket[]
  requiredSlot?: string
}

export interface PartCategory {
  type: PartType
  label: string
}

export interface CompatibilityReport {
  isCompatible: boolean
  messages: string[]
  missingParts: PartType[]
  totalPowerDraw: number
  requiredWattage: number
}
