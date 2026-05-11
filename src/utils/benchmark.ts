import { getInstalledPart } from '../data/components'
import type { BuildSlots } from '../types'

export function calculateBenchmark(build: BuildSlots) {
  const cpu = getInstalledPart(build, 'cpu')
  const gpu = getInstalledPart(build, 'gpu')
  const ram = getInstalledPart(build, 'ram')
  const storage = getInstalledPart(build, 'storage')

  const score = Math.round(
    (cpu?.performanceScore ?? 0) * 1.4 +
      (gpu?.performanceScore ?? 0) * 1.8 +
      (ram?.performanceScore ?? 0) * 0.8 +
      (storage?.performanceScore ?? 0) * 0.6,
  )

  const tier =
    score >= 480
      ? 'Workstation'
      : score >= 360
        ? 'Enthusiast'
        : score >= 250
          ? 'Gaming'
          : 'Office'

  return { score, tier }
}
