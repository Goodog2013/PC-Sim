import { useMemo } from 'react'
import {
  componentsById,
  partCategories,
  partLabels,
} from '../data/components'
import { useBuildStore } from '../store/useBuildStore'
import { checkBuildCompatibility } from '../utils/compatibility'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function BuildPanel() {
  const build = useBuildStore((state) => state.build)
  const lastCheck = useBuildStore((state) => state.lastCheck)
  const removePart = useBuildStore((state) => state.removePart)
  const liveReport = useMemo(() => checkBuildCompatibility(build), [build])
  const report = lastCheck ?? liveReport
  const installedParts = partCategories
    .map((category) => build[category.type])
    .map((partId) => (partId ? componentsById[partId] : null))
    .filter(Boolean)
  const price = installedParts.reduce((total, part) => total + part!.price, 0)
  const psu = build.psu ? componentsById[build.psu] : null

  return (
    <aside className="panel build-panel">
      <div className="panel-header">
        <span className="eyebrow">Сборка</span>
        <h2>Текущий ПК</h2>
      </div>

      <div className="build-summary">
        <div>
          <small>Стоимость</small>
          <strong>{currency.format(price)}</strong>
        </div>
        <div>
          <small>Потребление</small>
          <strong>{report.totalPowerDraw}W</strong>
        </div>
        <div>
          <small>PSU</small>
          <strong>{psu?.wattage ? `${psu.wattage}W` : '-'}</strong>
        </div>
      </div>

      <div
        className={`compatibility-box ${report.isCompatible ? 'ok' : 'error'}`}
      >
        <strong>
          {report.isCompatible
            ? 'Совместимо'
            : report.missingParts.length > 0
              ? 'Сборка не завершена'
              : 'Найдены ошибки'}
        </strong>
        <ul>
          {report.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>

      <div className="installed-list">
        {partCategories.map((category) => {
          const partId = build[category.type]
          const part = partId ? componentsById[partId] : null

          return (
            <div className="installed-row" key={category.type}>
              <div>
                <small>{partLabels[category.type]}</small>
                <strong>{part?.name ?? 'Не установлено'}</strong>
              </div>
              {part ? (
                <button
                  className="icon-button danger"
                  onClick={() => removePart(category.type)}
                  title="Remove"
                  type="button"
                >
                  ×
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
