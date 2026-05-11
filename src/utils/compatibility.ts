import {
  getInstalledPart,
  partLabels,
  requiredPartTypes,
} from '../data/components'
import type { BuildSlots, CompatibilityReport } from '../types'

export function checkBuildCompatibility(
  build: BuildSlots,
): CompatibilityReport {
  const pcCase = getInstalledPart(build, 'case')
  const motherboard = getInstalledPart(build, 'motherboard')
  const cpu = getInstalledPart(build, 'cpu')
  const gpu = getInstalledPart(build, 'gpu')
  const ram = getInstalledPart(build, 'ram')
  const storage = getInstalledPart(build, 'storage')
  const psu = getInstalledPart(build, 'psu')
  const cooler = getInstalledPart(build, 'cooler')

  const missingParts = requiredPartTypes.filter((type) => !build[type])
  const messages: string[] = []
  const totalPowerDraw = [motherboard, cpu, gpu, ram, storage, cooler].reduce(
    (total, part) => total + (part?.powerDraw ?? 0),
    0,
  )
  const requiredWattage = Math.ceil((totalPowerDraw * 1.2) / 10) * 10

  if (missingParts.length > 0) {
    messages.push(
      `Не установлено: ${missingParts.map((type) => partLabels[type]).join(', ')}`,
    )
  }

  if (cpu && motherboard && cpu.socket !== motherboard.socket) {
    messages.push(
      `CPU socket ${cpu.socket} не подходит к материнской плате ${motherboard.socket}`,
    )
  }

  if (ram && motherboard && ram.ramType !== motherboard.ramType) {
    messages.push(
      `RAM ${ram.ramType} не подходит к материнской плате ${motherboard.ramType}`,
    )
  }

  if (
    pcCase &&
    motherboard &&
    motherboard.formFactor &&
    !pcCase.supportedFormFactors?.includes(motherboard.formFactor)
  ) {
    messages.push(
      `Материнская плата ${motherboard.formFactor} не помещается в корпус ${pcCase.name}`,
    )
  }

  if (
    psu &&
    requiredWattage > 0 &&
    psu.wattage !== undefined &&
    psu.wattage < requiredWattage
  ) {
    messages.push(
      `Блок питания слишком слабый: нужно минимум ${requiredWattage}W, установлено ${psu.wattage}W`,
    )
  }

  if (
    pcCase &&
    gpu &&
    gpu.length !== undefined &&
    pcCase.maxGpuLength !== undefined &&
    gpu.length > pcCase.maxGpuLength
  ) {
    messages.push(
      `Видеокарта длиной ${gpu.length} мм не помещается в корпус с лимитом ${pcCase.maxGpuLength} мм`,
    )
  }

  if (
    cooler &&
    cpu &&
    cpu.socket &&
    !cooler.compatibleWith?.includes(cpu.socket)
  ) {
    messages.push(
      `Кулер ${cooler.name} не подходит к сокету CPU ${cpu.socket}`,
    )
  }

  if (
    storage &&
    motherboard &&
    storage.storageType &&
    !motherboard.storageSlots?.includes(storage.storageType)
  ) {
    messages.push(
      `Накопитель ${storage.storageType} не подходит: у платы доступны ${motherboard.storageSlots?.join(', ') ?? 'нет слотов'}`,
    )
  }

  const isCompatible = messages.length === 0

  return {
    isCompatible,
    messages: isCompatible
      ? ['Сборка совместима. POST готов к запуску.']
      : messages,
    missingParts,
    totalPowerDraw,
    requiredWattage,
  }
}
