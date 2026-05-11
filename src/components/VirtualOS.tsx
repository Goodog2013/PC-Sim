import { useState } from 'react'
import {
  getInstalledPart,
  partCategories,
  partLabels,
} from '../data/components'
import { useBuildStore } from '../store/useBuildStore'
import { calculateBenchmark } from '../utils/benchmark'

type WindowName = 'benchmark' | 'info' | null

export function VirtualOS() {
  const [activeWindow, setActiveWindow] = useState<WindowName>(null)
  const build = useBuildStore((state) => state.build)
  const setGameState = useBuildStore((state) => state.setGameState)
  const benchmark = calculateBenchmark(build)

  return (
    <main className="virtual-os">
      <header className="os-topbar">
        <strong>PC Sim OS</strong>
        <span>session: local build</span>
      </header>

      <section className="desktop-icons" aria-label="Рабочий стол">
        <button onClick={() => setActiveWindow('benchmark')} type="button">
          <span className="desktop-icon benchmark-icon" />
          Benchmark
        </button>
        <button onClick={() => setActiveWindow('info')} type="button">
          <span className="desktop-icon info-icon" />
          System Info
        </button>
        <button onClick={() => setGameState('shutdown')} type="button">
          <span className="desktop-icon shutdown-icon" />
          Shutdown
        </button>
      </section>

      {activeWindow ? (
        <section className="os-window">
          <div className="window-titlebar">
            <strong>
              {activeWindow === 'benchmark' ? 'Benchmark' : 'System Info'}
            </strong>
            <button onClick={() => setActiveWindow(null)} type="button">
              ×
            </button>
          </div>

          {activeWindow === 'benchmark' ? (
            <div className="benchmark-view">
              <span>PC SIM MARK</span>
              <strong>{benchmark.score}</strong>
              <p>{benchmark.tier} class</p>
            </div>
          ) : (
            <div className="system-info-view">
              {partCategories.map((category) => {
                const part = getInstalledPart(build, category.type)

                return (
                  <div key={category.type}>
                    <span>{partLabels[category.type]}</span>
                    <strong>{part?.name ?? '-'}</strong>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      ) : null}

      <footer className="os-taskbar">
        <span>Ready</span>
        <span>Power profile: Simulator</span>
      </footer>
    </main>
  )
}
