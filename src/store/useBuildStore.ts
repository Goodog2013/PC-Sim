import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  componentsById,
  createEmptyBuild,
  emptyBuild,
} from '../data/components'
import type {
  BuildSlots,
  CompatibilityReport,
  GameState,
  PartType,
} from '../types'
import { checkBuildCompatibility } from '../utils/compatibility'

interface BuildStore {
  build: BuildSlots
  selectedType: PartType
  selectedPartId: string | null
  gameState: GameState
  lastCheck: CompatibilityReport | null
  selectType: (type: PartType) => void
  selectPart: (partId: string) => void
  installSelected: () => void
  removePart: (type: PartType) => void
  checkCompatibility: () => CompatibilityReport
  powerOn: () => void
  setGameState: (state: GameState) => void
  resetBuild: () => void
}

export const useBuildStore = create<BuildStore>()(
  persist(
    (set, get) => ({
      build: createEmptyBuild(),
      selectedType: 'case',
      selectedPartId: null,
      gameState: 'assembling',
      lastCheck: null,
      selectType: (type) =>
        set((state) => ({
          selectedType: type,
          selectedPartId: state.build[type],
          gameState:
            state.gameState === 'checking' ? 'assembling' : state.gameState,
        })),
      selectPart: (partId) =>
        set((state) => ({
          selectedPartId: partId,
          selectedType: componentsById[partId]?.type ?? state.selectedType,
          gameState:
            state.gameState === 'checking' ? 'assembling' : state.gameState,
        })),
      installSelected: () => {
        const { selectedPartId } = get()
        const selectedPart = selectedPartId ? componentsById[selectedPartId] : null

        if (!selectedPart) {
          return
        }

        set((state) => ({
          build: {
            ...state.build,
            [selectedPart.type]: selectedPart.id,
          },
          selectedType: selectedPart.type,
          lastCheck: null,
          gameState: 'assembling',
        }))
      },
      removePart: (type) =>
        set((state) => ({
          build: {
            ...state.build,
            [type]: null,
          },
          selectedPartId:
            state.selectedType === type ? null : state.selectedPartId,
          lastCheck: null,
          gameState: 'assembling',
        })),
      checkCompatibility: () => {
        const report = checkBuildCompatibility(get().build)
        set({ lastCheck: report, gameState: 'checking' })
        return report
      },
      powerOn: () => {
        const report = checkBuildCompatibility(get().build)
        set({
          lastCheck: report,
          gameState: report.isCompatible ? 'bios' : 'post_error',
        })
      },
      setGameState: (gameState) => set({ gameState }),
      resetBuild: () =>
        set({
          build: { ...emptyBuild },
          selectedType: 'case',
          selectedPartId: null,
          gameState: 'assembling',
          lastCheck: null,
        }),
    }),
    {
      name: 'pc-sim-build',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ build: state.build }),
    },
  ),
)
