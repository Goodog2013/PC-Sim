import {
  componentsById,
  componentsByType,
  partCategories,
} from '../data/components'
import { useBuildStore } from '../store/useBuildStore'
import type { PCPart } from '../types'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function specList(part: PCPart) {
  return [
    part.socket ? `Socket ${part.socket}` : null,
    part.formFactor ? part.formFactor : null,
    part.ramType ? `RAM ${part.ramType}` : null,
    part.storageType ? part.storageType : null,
    part.storageSlots ? `Storage ${part.storageSlots.join(' / ')}` : null,
    part.length ? `${part.length} mm GPU` : null,
    part.maxGpuLength ? `GPU до ${part.maxGpuLength} mm` : null,
    part.wattage ? `${part.wattage}W` : null,
    part.compatibleWith ? `Mount ${part.compatibleWith.join(' / ')}` : null,
  ].filter(Boolean)
}

export function PartSelector() {
  const selectedType = useBuildStore((state) => state.selectedType)
  const selectedPartId = useBuildStore((state) => state.selectedPartId)
  const build = useBuildStore((state) => state.build)
  const selectType = useBuildStore((state) => state.selectType)
  const selectPart = useBuildStore((state) => state.selectPart)
  const parts = componentsByType[selectedType]

  return (
    <aside className="panel selector-panel">
      <div className="panel-header">
        <span className="eyebrow">Каталог</span>
        <h2>Комплектующие</h2>
      </div>

      <nav className="category-list" aria-label="Категории комплектующих">
        {partCategories.map((category) => {
          const installed = build[category.type]
            ? componentsById[build[category.type] ?? '']
            : null

          return (
            <button
              className={`category-button ${selectedType === category.type ? 'active' : ''}`}
              key={category.type}
              onClick={() => selectType(category.type)}
              type="button"
            >
              <span>{category.label}</span>
              <small>{installed?.name ?? 'пусто'}</small>
            </button>
          )
        })}
      </nav>

      <div className="part-list">
        {parts.map((part) => {
          const isSelected = selectedPartId === part.id
          const isInstalled = build[part.type] === part.id

          return (
            <button
              className={`part-card ${isSelected ? 'selected' : ''} ${isInstalled ? 'installed' : ''}`}
              key={part.id}
              onClick={() => selectPart(part.id)}
              type="button"
            >
              <div className="part-card-top">
                <strong>{part.name}</strong>
                <span>{currency.format(part.price)}</span>
              </div>
              <div className="spec-row">
                {specList(part).map((spec) => (
                  <small key={spec}>{spec}</small>
                ))}
              </div>
              <div className="part-card-meta">
                <span>{part.powerDraw}W</span>
                <span>Score {part.performanceScore}</span>
                {isInstalled ? <b>Установлено</b> : null}
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
