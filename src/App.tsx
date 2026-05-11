import './App.css'
import { BuildPanel } from './components/BuildPanel'
import { PartSelector } from './components/PartSelector'
import { PCScene } from './components/PCScene'
import { PowerScreen } from './components/PowerScreen'
import { VirtualOS } from './components/VirtualOS'
import { componentsById } from './data/components'
import { useBuildStore } from './store/useBuildStore'

function App() {
  const gameState = useBuildStore((state) => state.gameState)
  const selectedType = useBuildStore((state) => state.selectedType)
  const selectedPartId = useBuildStore((state) => state.selectedPartId)
  const build = useBuildStore((state) => state.build)
  const installSelected = useBuildStore((state) => state.installSelected)
  const removePart = useBuildStore((state) => state.removePart)
  const checkCompatibility = useBuildStore((state) => state.checkCompatibility)
  const powerOn = useBuildStore((state) => state.powerOn)
  const resetBuild = useBuildStore((state) => state.resetBuild)
  const selectedPart = selectedPartId ? componentsById[selectedPartId] : null
  const hasInstalledSelectedType = Boolean(build[selectedType])

  if (gameState === 'os_running') {
    return <VirtualOS />
  }

  if (['post_error', 'bios', 'booting', 'shutdown'].includes(gameState)) {
    return <PowerScreen />
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">PC Sim MVP</span>
          <h1>Симулятор сборки ПК</h1>
        </div>
        <div className="state-pill">{gameState}</div>
      </header>

      <section className="workspace">
        <PartSelector />
        <section className="scene-panel">
          <PCScene />
        </section>
        <BuildPanel />
      </section>

      <footer className="control-bar">
        <div className="selected-readout">
          <small>Выбрано</small>
          <strong>{selectedPart?.name ?? 'ничего'}</strong>
        </div>
        <button
          className="primary-action"
          disabled={!selectedPart}
          onClick={installSelected}
          type="button"
        >
          Install
        </button>
        <button
          className="secondary-action"
          disabled={!hasInstalledSelectedType}
          onClick={() => removePart(selectedType)}
          type="button"
        >
          Remove
        </button>
        <button
          className="secondary-action"
          onClick={checkCompatibility}
          type="button"
        >
          Check compatibility
        </button>
        <button className="power-action" onClick={powerOn} type="button">
          Power on
        </button>
        <button className="ghost-action" onClick={resetBuild} type="button">
          Reset build
        </button>
      </footer>
    </main>
  )
}

export default App
