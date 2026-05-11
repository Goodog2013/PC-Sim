import { useMemo, useState } from 'react'
import {
  getInstalledPart,
  partCategories,
  partLabels,
} from '../data/components'
import { useBuildStore } from '../store/useBuildStore'
import { calculateBenchmark } from '../utils/benchmark'

type AppId =
  | 'benchmark'
  | 'info'
  | 'files'
  | 'games'
  | 'terminal'
  | 'tasks'
  | 'notes'
  | 'calculator'
  | 'settings'

type GameQuality = 'low' | 'medium' | 'high' | 'ultra'

interface OsApp {
  id: AppId
  title: string
  iconClass: string
  pinned?: boolean
}

interface MiniGame {
  id: string
  title: string
  genre: string
  demand: number
  baseFps: number
  description: string
  sceneClass: string
}

const osApps: OsApp[] = [
  { id: 'benchmark', title: 'Benchmark', iconClass: 'benchmark-icon', pinned: true },
  { id: 'info', title: 'System Info', iconClass: 'info-icon', pinned: true },
  { id: 'files', title: 'Files', iconClass: 'files-icon', pinned: true },
  { id: 'games', title: 'Games', iconClass: 'games-icon', pinned: true },
  { id: 'terminal', title: 'Terminal', iconClass: 'terminal-icon', pinned: true },
  { id: 'tasks', title: 'Task Monitor', iconClass: 'tasks-icon' },
  { id: 'notes', title: 'Notes', iconClass: 'notes-icon' },
  { id: 'calculator', title: 'Calculator', iconClass: 'calculator-icon' },
  { id: 'settings', title: 'Settings', iconClass: 'settings-icon' },
]

const miniGames: MiniGame[] = [
  {
    id: 'neon-runner',
    title: 'Neon Runner',
    genre: 'Arcade racer',
    demand: 300,
    baseFps: 92,
    description: 'Simple lane runner with glowing traffic blocks.',
    sceneClass: 'runner-scene',
  },
  {
    id: 'block-stack',
    title: 'Block Stack',
    genre: 'Puzzle',
    demand: 180,
    baseFps: 120,
    description: 'Lightweight falling blocks benchmark for CPU and RAM.',
    sceneClass: 'blocks-scene',
  },
  {
    id: 'space-dots',
    title: 'Space Dots',
    genre: 'Shooter',
    demand: 420,
    baseFps: 78,
    description: 'Particle-heavy space shooter simulation for the GPU.',
    sceneClass: 'space-scene',
  },
  {
    id: 'thermal-rally',
    title: 'Thermal Rally',
    genre: 'Driving sim',
    demand: 540,
    baseFps: 68,
    description: 'Heavier test with heat haze, road motion and AI cars.',
    sceneClass: 'rally-scene',
  },
]

const qualityFactors: Record<GameQuality, number> = {
  low: 1.32,
  medium: 1,
  high: 0.76,
  ultra: 0.58,
}

function calculatorResult(expression: string) {
  const trimmed = expression.trim()

  if (!trimmed) {
    return '0'
  }

  if (!/^[\d+\-*/().\s]+$/.test(trimmed)) {
    return 'Only numbers and + - * / ( ) are supported'
  }

  try {
    const value = Function(`"use strict"; return (${trimmed})`)()
    return Number.isFinite(value) ? String(Number(value.toFixed(4))) : 'Invalid result'
  } catch {
    return 'Invalid expression'
  }
}

function estimateGameFps(
  benchmarkScore: number,
  game: MiniGame,
  quality: GameQuality,
) {
  const scoreRatio = Math.max(0.25, benchmarkScore / game.demand)
  const average = Math.round(
    Math.min(240, Math.max(18, game.baseFps * scoreRatio * qualityFactors[quality])),
  )
  const onePercentLow = Math.max(12, Math.round(average * 0.72))
  const frameTime = Number((1000 / average).toFixed(1))
  const status =
    average >= 120
      ? 'Excellent'
      : average >= 75
        ? 'Smooth'
        : average >= 45
          ? 'Playable'
          : 'Heavy'

  return { average, frameTime, onePercentLow, status }
}

export function VirtualOS() {
  const [activeApp, setActiveApp] = useState<AppId | null>(null)
  const [startOpen, setStartOpen] = useState(false)
  const [notes, setNotes] = useState(() => localStorage.getItem('pc-sim-notes') ?? '')
  const [expression, setExpression] = useState('128 + 64 / 2')
  const [selectedGameId, setSelectedGameId] = useState(miniGames[0].id)
  const [gameQuality, setGameQuality] = useState<GameQuality>('high')
  const [gameRunning, setGameRunning] = useState(false)
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'PC Sim Terminal ready. Type help.',
  ])
  const build = useBuildStore((state) => state.build)
  const setGameState = useBuildStore((state) => state.setGameState)
  const benchmark = calculateBenchmark(build)
  const installedParts = partCategories.map((category) => ({
    category,
    part: getInstalledPart(build, category.type),
  }))
  const activeAppMeta = osApps.find((app) => app.id === activeApp)
  const installedCount = installedParts.filter(({ part }) => part).length
  const storage = getInstalledPart(build, 'storage')
  const cpu = getInstalledPart(build, 'cpu')
  const gpu = getInstalledPart(build, 'gpu')
  const ram = getInstalledPart(build, 'ram')
  const selectedGame =
    miniGames.find((game) => game.id === selectedGameId) ?? miniGames[0]
  const gameFps = estimateGameFps(benchmark.score, selectedGame, gameQuality)
  const powerDraw = installedParts.reduce(
    (total, { part }) => total + (part?.powerDraw ?? 0),
    0,
  )
  const taskMetrics = useMemo(
    () => [
      { label: 'CPU', value: Math.min(98, Math.max(12, Math.round((cpu?.performanceScore ?? 40) * 0.52))) },
      { label: 'GPU', value: Math.min(98, Math.max(8, Math.round((gpu?.performanceScore ?? 30) * 0.48))) },
      { label: 'RAM', value: Math.min(96, Math.max(18, Math.round((ram?.performanceScore ?? 32) * 0.7))) },
      { label: 'Disk', value: Math.min(94, Math.max(10, Math.round((storage?.performanceScore ?? 30) * 0.62))) },
    ],
    [cpu?.performanceScore, gpu?.performanceScore, ram?.performanceScore, storage?.performanceScore],
  )

  const openApp = (id: AppId) => {
    setActiveApp(id)
    setStartOpen(false)
  }

  const saveNotes = (value: string) => {
    setNotes(value)
    localStorage.setItem('pc-sim-notes', value)
  }

  const runTerminalCommand = () => {
    const command = terminalInput.trim().toLowerCase()

    if (!command) {
      return
    }

    if (command === 'clear') {
      setTerminalLines([])
      setTerminalInput('')
      return
    }

    if (command === 'shutdown') {
      setGameState('shutdown')
      return
    }

    const response =
      command === 'help'
      ? 'Commands: help, sysinfo, benchmark, games, power, apps, clear, shutdown'
        : command === 'sysinfo'
          ? `${installedCount}/8 parts installed, CPU: ${cpu?.name ?? 'none'}, GPU: ${gpu?.name ?? 'none'}`
          : command === 'benchmark'
            ? `PC SIM MARK ${benchmark.score} (${benchmark.tier})`
            : command === 'games'
              ? miniGames
                  .map((game) => {
                    const fps = estimateGameFps(benchmark.score, game, gameQuality)
                    return `${game.title}: ${fps.average} FPS`
                  })
                  .join(' | ')
              : command === 'power'
                ? `Estimated component draw: ${powerDraw}W`
                : command === 'apps'
                  ? osApps.map((app) => app.title).join(', ')
                  : `Unknown command: ${command}`

    setTerminalLines((lines) => [...lines, `> ${terminalInput}`, response])
    setTerminalInput('')
  }

  const renderApp = () => {
    if (activeApp === 'benchmark') {
      return (
        <div className="benchmark-view">
          <span>PC SIM MARK</span>
          <strong>{benchmark.score}</strong>
          <p>{benchmark.tier} class</p>
          <div className="benchmark-breakdown">
            <span>CPU {cpu?.performanceScore ?? 0}</span>
            <span>GPU {gpu?.performanceScore ?? 0}</span>
            <span>RAM {ram?.performanceScore ?? 0}</span>
            <span>Storage {storage?.performanceScore ?? 0}</span>
          </div>
        </div>
      )
    }

    if (activeApp === 'info') {
      return (
        <div className="system-info-view">
          {installedParts.map(({ category, part }) => (
            <div key={category.type}>
              <span>{partLabels[category.type]}</span>
              <strong>{part?.name ?? '-'}</strong>
            </div>
          ))}
        </div>
      )
    }

    if (activeApp === 'files') {
      return (
        <div className="files-view">
          <div className="drive-card">
            <strong>Local Disk (C:)</strong>
            <span>{storage?.name ?? 'Virtual SSD'}</span>
            <div className="drive-bar">
              <span style={{ width: `${Math.min(86, 32 + benchmark.score / 10)}%` }} />
            </div>
          </div>
          <button onClick={() => openApp('games')} type="button">
            <span className="folder-icon games-folder-icon" />
            Games
          </button>
          {['Benchmarks', 'Drivers', 'Screenshots', 'System Logs'].map((folder) => (
            <button key={folder} type="button">
              <span className="folder-icon" />
              {folder}
            </button>
          ))}
        </div>
      )
    }

    if (activeApp === 'games') {
      return (
        <div className="games-view">
          <aside className="games-library">
            <div className="games-folder-header">
              <span className="folder-icon games-folder-icon" />
              <div>
                <strong>C:\Games</strong>
                <small>{miniGames.length} installed games</small>
              </div>
            </div>
            {miniGames.map((game) => {
              const fps = estimateGameFps(benchmark.score, game, gameQuality)

              return (
                <button
                  className={selectedGame.id === game.id ? 'active' : ''}
                  key={game.id}
                  onClick={() => {
                    setSelectedGameId(game.id)
                    setGameRunning(false)
                  }}
                  type="button"
                >
                  <span>{game.title}</span>
                  <strong>{fps.average} FPS</strong>
                </button>
              )
            })}
          </aside>

          <section className="game-preview">
            <div className={`game-stage ${selectedGame.sceneClass} ${gameRunning ? 'running' : ''}`}>
              <div className="game-hud">
                <span>{selectedGame.title}</span>
                <strong>{gameFps.average} FPS</strong>
              </div>
              <div className="game-sprite player-sprite" />
              <div className="game-sprite enemy-sprite" />
              <div className="game-sprite pickup-sprite" />
            </div>

            <div className="game-details">
              <div>
                <span className="eyebrow">{selectedGame.genre}</span>
                <h3>{selectedGame.title}</h3>
                <p>{selectedGame.description}</p>
              </div>

              <label>
                Graphics preset
                <select
                  onChange={(event) => setGameQuality(event.target.value as GameQuality)}
                  value={gameQuality}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="ultra">Ultra</option>
                </select>
              </label>

              <div className="fps-panel">
                <div>
                  <small>Average</small>
                  <strong>{gameFps.average}</strong>
                  <span>FPS</span>
                </div>
                <div>
                  <small>1% Low</small>
                  <strong>{gameFps.onePercentLow}</strong>
                  <span>FPS</span>
                </div>
                <div>
                  <small>Frame time</small>
                  <strong>{gameFps.frameTime}</strong>
                  <span>ms</span>
                </div>
                <div>
                  <small>Status</small>
                  <strong>{gameFps.status}</strong>
                </div>
              </div>

              <button
                className="game-run-button"
                onClick={() => setGameRunning((running) => !running)}
                type="button"
              >
                {gameRunning ? 'Stop simulation' : 'Run FPS simulation'}
              </button>
            </div>
          </section>
        </div>
      )
    }

    if (activeApp === 'terminal') {
      return (
        <div className="terminal-view">
          <div className="terminal-output">
            {terminalLines.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              runTerminalCommand()
            }}
          >
            <span>&gt;</span>
            <input
              onChange={(event) => setTerminalInput(event.target.value)}
              placeholder="help"
              value={terminalInput}
            />
          </form>
        </div>
      )
    }

    if (activeApp === 'tasks') {
      return (
        <div className="tasks-view">
          {taskMetrics.map((metric) => (
            <div key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}%</strong>
              <div className="metric-bar">
                <span style={{ width: `${metric.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeApp === 'notes') {
      return (
        <div className="notes-view">
          <textarea
            onChange={(event) => saveNotes(event.target.value)}
            placeholder="Заметки по сборке, разгону или тестам..."
            value={notes}
          />
          <span>Saved locally</span>
        </div>
      )
    }

    if (activeApp === 'calculator') {
      return (
        <div className="calculator-view">
          <input
            onChange={(event) => setExpression(event.target.value)}
            value={expression}
          />
          <strong>{calculatorResult(expression)}</strong>
          <div className="calculator-buttons">
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '(', '+'].map((key) => (
              <button
                key={key}
                onClick={() => setExpression((current) => `${current}${key}`)}
                type="button"
              >
                {key}
              </button>
            ))}
            <button onClick={() => setExpression('')} type="button">
              Clear
            </button>
            <button onClick={() => setExpression((current) => `${current})`)} type="button">
              )
            </button>
          </div>
        </div>
      )
    }

    if (activeApp === 'settings') {
      return (
        <div className="settings-view">
          <label>
            <span>Performance profile</span>
            <select defaultValue="balanced">
              <option value="silent">Silent</option>
              <option value="balanced">Balanced</option>
              <option value="performance">Performance</option>
            </select>
          </label>
          <label>
            <span>Desktop accent</span>
            <select defaultValue="green">
              <option value="green">PC Sim Green</option>
              <option value="blue">Service Blue</option>
              <option value="amber">POST Amber</option>
            </select>
          </label>
          <button onClick={() => setGameState('assembling')} type="button">
            Return to build bench
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <main className="virtual-os" onClick={() => startOpen && setStartOpen(false)}>
      <header className="os-topbar">
        <strong>PC Sim OS</strong>
        <span>{installedCount}/8 parts · {benchmark.tier}</span>
      </header>

      <section className="desktop-icons" aria-label="Рабочий стол">
        {osApps.map((app) => (
          <button key={app.id} onClick={() => openApp(app.id)} type="button">
            <span className={`desktop-icon ${app.iconClass}`} />
            {app.title}
          </button>
        ))}
        <button onClick={() => setGameState('shutdown')} type="button">
          <span className="desktop-icon shutdown-icon" />
          Shutdown
        </button>
      </section>

      {activeApp && activeAppMeta ? (
        <section className={`os-window os-window-${activeApp}`}>
          <div className="window-titlebar">
            <strong>{activeAppMeta.title}</strong>
            <button onClick={() => setActiveApp(null)} type="button">
              ×
            </button>
          </div>
          {renderApp()}
        </section>
      ) : null}

      {startOpen ? (
        <section className="start-menu" onClick={(event) => event.stopPropagation()}>
          <div className="start-menu-header">
            <strong>PC Sim OS</strong>
            <span>{cpu?.name ?? 'Virtual CPU'}</span>
          </div>
          <div className="start-app-grid">
            {osApps.map((app) => (
              <button key={app.id} onClick={() => openApp(app.id)} type="button">
                <span className={`desktop-icon ${app.iconClass}`} />
                {app.title}
              </button>
            ))}
          </div>
          <div className="start-menu-actions">
            <button onClick={() => setGameState('assembling')} type="button">
              Build Bench
            </button>
            <button onClick={() => setGameState('shutdown')} type="button">
              Shutdown
            </button>
          </div>
        </section>
      ) : null}

      <footer className="os-taskbar" onClick={(event) => event.stopPropagation()}>
        <button
          className={`start-button ${startOpen ? 'active' : ''}`}
          onClick={() => setStartOpen((open) => !open)}
          type="button"
        >
          Пуск
        </button>
        <div className="hotbar">
          {osApps
            .filter((app) => app.pinned)
            .map((app) => (
              <button
                className={activeApp === app.id ? 'active' : ''}
                key={app.id}
                onClick={() => openApp(app.id)}
                title={app.title}
                type="button"
              >
                <span className={`taskbar-icon ${app.iconClass}`} />
                <span>{app.title}</span>
              </button>
            ))}
        </div>
        <div className="system-tray">
          <span>{powerDraw}W</span>
          <span>Ready</span>
        </div>
      </footer>
    </main>
  )
}
