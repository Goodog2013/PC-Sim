import { useEffect } from 'react'
import { getInstalledPart } from '../data/components'
import { useBuildStore } from '../store/useBuildStore'

export function PowerScreen() {
  const build = useBuildStore((state) => state.build)
  const gameState = useBuildStore((state) => state.gameState)
  const lastCheck = useBuildStore((state) => state.lastCheck)
  const setGameState = useBuildStore((state) => state.setGameState)
  const cpu = getInstalledPart(build, 'cpu')
  const ram = getInstalledPart(build, 'ram')
  const storage = getInstalledPart(build, 'storage')

  useEffect(() => {
    if (gameState === 'bios') {
      const timer = window.setTimeout(() => setGameState('booting'), 1500)
      return () => window.clearTimeout(timer)
    }

    if (gameState === 'booting') {
      const timer = window.setTimeout(() => setGameState('os_running'), 2200)
      return () => window.clearTimeout(timer)
    }

    return undefined
  }, [gameState, setGameState])

  if (gameState === 'post_error') {
    return (
      <main className="power-screen post-error-screen">
        <section className="terminal-card">
          <span className="terminal-title">PC SIM POST</span>
          <h1>POST ERROR</h1>
          <p>Система остановила запуск из-за ошибок совместимости.</p>
          <ul className="terminal-list">
            {lastCheck?.messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <button className="primary-action" onClick={() => setGameState('assembling')} type="button">
            Вернуться к сборке
          </button>
        </section>
      </main>
    )
  }

  if (gameState === 'bios') {
    return (
      <main className="power-screen bios-screen">
        <section className="bios-panel">
          <div className="bios-bar">PC SIM BIOS v0.1</div>
          <div className="bios-grid">
            <span>CPU</span>
            <strong>{cpu?.name}</strong>
            <span>Memory</span>
            <strong>{ram?.name}</strong>
            <span>Boot Device</span>
            <strong>{storage?.name}</strong>
            <span>POST</span>
            <strong className="status-green">PASSED</strong>
          </div>
          <p>Initializing boot sequence...</p>
        </section>
      </main>
    )
  }

  if (gameState === 'booting') {
    return (
      <main className="power-screen boot-screen">
        <section className="boot-card">
          <div className="boot-logo">PC Sim OS</div>
          <p>Booting OS...</p>
          <div className="progress-track">
            <span />
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="power-screen shutdown-screen">
      <section className="terminal-card">
        <span className="terminal-title">PC SIM OS</span>
        <h1>System halted</h1>
        <p>Виртуальный ПК выключен.</p>
        <button className="primary-action" onClick={() => setGameState('assembling')} type="button">
          Вернуться к сборке
        </button>
      </section>
    </main>
  )
}
