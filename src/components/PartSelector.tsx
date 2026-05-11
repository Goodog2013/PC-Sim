import { useMemo, useState } from 'react'
import {
  componentsById,
  componentsByType,
  getInstalledPart,
  partCategories,
} from '../data/components'
import { useBuildStore } from '../store/useBuildStore'
import type {
  BuildSlots,
  CpuSocket,
  FormFactor,
  PCPart,
  PartType,
  RamType,
  StorageType,
} from '../types'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

type SortMode = 'score-desc' | 'price-asc' | 'price-desc' | 'power-asc' | 'name'

interface CatalogFilters {
  query: string
  socket: CpuSocket | 'all'
  formFactor: FormFactor | 'all'
  ramType: RamType | 'all'
  storageType: StorageType | 'all'
  minWattage: number
  maxPrice: number
  compatibleOnly: boolean
  sort: SortMode
}

const initialFilters: CatalogFilters = {
  query: '',
  socket: 'all',
  formFactor: 'all',
  ramType: 'all',
  storageType: 'all',
  minWattage: 0,
  maxPrice: 0,
  compatibleOnly: false,
  sort: 'score-desc',
}

function specList(part: PCPart) {
  return [
    part.socket ? `Socket ${part.socket}` : null,
    part.formFactor ? part.formFactor : null,
    part.supportedFormFactors
      ? `Case ${part.supportedFormFactors.join(' / ')}`
      : null,
    part.ramType ? `RAM ${part.ramType}` : null,
    part.storageType ? part.storageType : null,
    part.storageSlots ? `Storage ${part.storageSlots.join(' / ')}` : null,
    part.length ? `${part.length} mm GPU` : null,
    part.maxGpuLength ? `GPU до ${part.maxGpuLength} mm` : null,
    part.wattage ? `${part.wattage}W` : null,
    part.compatibleWith ? `Mount ${part.compatibleWith.join(' / ')}` : null,
  ].filter(Boolean)
}

function partSearchText(part: PCPart) {
  return [
    part.name,
    part.type,
    part.socket,
    part.formFactor,
    part.ramType,
    part.storageType,
    part.requiredSlot,
    part.wattage,
    part.length,
    part.maxGpuLength,
    part.supportedFormFactors?.join(' '),
    part.storageSlots?.join(' '),
    part.compatibleWith?.join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function estimateRequiredWattage(build: BuildSlots, replacement?: PCPart) {
  const getPart = (type: PartType) =>
    replacement?.type === type ? replacement : getInstalledPart(build, type)

  const totalPowerDraw = [
    getPart('motherboard'),
    getPart('cpu'),
    getPart('gpu'),
    getPart('ram'),
    getPart('storage'),
    getPart('cooler'),
  ].reduce((total, part) => total + (part?.powerDraw ?? 0), 0)

  return Math.ceil((totalPowerDraw * 1.2) / 10) * 10
}

function isCompatibleCandidate(part: PCPart, build: BuildSlots) {
  const pcCase = getInstalledPart(build, 'case')
  const motherboard = getInstalledPart(build, 'motherboard')
  const cpu = getInstalledPart(build, 'cpu')
  const gpu = getInstalledPart(build, 'gpu')
  const ram = getInstalledPart(build, 'ram')
  const storage = getInstalledPart(build, 'storage')

  if (
    part.type === 'case' &&
    motherboard?.formFactor &&
    !part.supportedFormFactors?.includes(motherboard.formFactor)
  ) {
    return false
  }

  if (
    part.type === 'case' &&
    gpu?.length &&
    part.maxGpuLength !== undefined &&
    gpu.length > part.maxGpuLength
  ) {
    return false
  }

  if (
    part.type === 'motherboard' &&
    pcCase?.supportedFormFactors &&
    part.formFactor &&
    !pcCase.supportedFormFactors.includes(part.formFactor)
  ) {
    return false
  }

  if (part.type === 'motherboard' && cpu?.socket && part.socket !== cpu.socket) {
    return false
  }

  if (part.type === 'motherboard' && ram?.ramType && part.ramType !== ram.ramType) {
    return false
  }

  if (
    part.type === 'motherboard' &&
    storage?.storageType &&
    !part.storageSlots?.includes(storage.storageType)
  ) {
    return false
  }

  if (part.type === 'cpu' && motherboard?.socket && part.socket !== motherboard.socket) {
    return false
  }

  if (
    part.type === 'cpu' &&
    cpu?.socket &&
    getInstalledPart(build, 'cooler')?.compatibleWith &&
    !getInstalledPart(build, 'cooler')?.compatibleWith?.includes(part.socket!)
  ) {
    return false
  }

  if (part.type === 'ram' && motherboard?.ramType && part.ramType !== motherboard.ramType) {
    return false
  }

  if (
    part.type === 'gpu' &&
    pcCase?.maxGpuLength !== undefined &&
    part.length !== undefined &&
    part.length > pcCase.maxGpuLength
  ) {
    return false
  }

  if (
    part.type === 'storage' &&
    motherboard?.storageSlots &&
    part.storageType &&
    !motherboard.storageSlots.includes(part.storageType)
  ) {
    return false
  }

  if (part.type === 'psu') {
    const requiredWattage = estimateRequiredWattage(build, part)
    return (part.wattage ?? 0) >= requiredWattage
  }

  if (part.type === 'cooler' && cpu?.socket && !part.compatibleWith?.includes(cpu.socket)) {
    return false
  }

  return true
}

function matchesFilters(part: PCPart, build: BuildSlots, filters: CatalogFilters) {
  const query = filters.query.trim().toLowerCase()

  if (query && !partSearchText(part).includes(query)) {
    return false
  }

  if (
    filters.socket !== 'all' &&
    part.socket !== filters.socket &&
    !part.compatibleWith?.includes(filters.socket)
  ) {
    return false
  }

  if (
    filters.formFactor !== 'all' &&
    part.formFactor !== filters.formFactor &&
    !part.supportedFormFactors?.includes(filters.formFactor)
  ) {
    return false
  }

  if (filters.ramType !== 'all' && part.ramType !== filters.ramType) {
    return false
  }

  if (
    filters.storageType !== 'all' &&
    part.storageType !== filters.storageType &&
    !part.storageSlots?.includes(filters.storageType)
  ) {
    return false
  }

  if (filters.minWattage > 0 && part.type === 'psu' && (part.wattage ?? 0) < filters.minWattage) {
    return false
  }

  if (filters.maxPrice > 0 && part.price > filters.maxPrice) {
    return false
  }

  if (filters.compatibleOnly && !isCompatibleCandidate(part, build)) {
    return false
  }

  return true
}

function sortParts(parts: PCPart[], sort: SortMode) {
  return [...parts].sort((left, right) => {
    if (sort === 'price-asc') {
      return left.price - right.price
    }

    if (sort === 'price-desc') {
      return right.price - left.price
    }

    if (sort === 'power-asc') {
      return left.powerDraw - right.powerDraw
    }

    if (sort === 'name') {
      return left.name.localeCompare(right.name)
    }

    return right.performanceScore - left.performanceScore
  })
}

export function PartSelector() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters)
  const selectedType = useBuildStore((state) => state.selectedType)
  const selectedPartId = useBuildStore((state) => state.selectedPartId)
  const build = useBuildStore((state) => state.build)
  const selectType = useBuildStore((state) => state.selectType)
  const selectPart = useBuildStore((state) => state.selectPart)
  const installSelected = useBuildStore((state) => state.installSelected)
  const selectedPart = selectedPartId ? componentsById[selectedPartId] : null
  const selectedCategory = partCategories.find((category) => category.type === selectedType)
  const categoryParts = componentsByType[selectedType]
  const filteredParts = useMemo(
    () =>
      sortParts(
        categoryParts.filter((part) => matchesFilters(part, build, filters)),
        filters.sort,
      ),
    [build, categoryParts, filters],
  )

  const openCatalog = (type = selectedType) => {
    selectType(type)
    setIsCatalogOpen(true)
  }

  const updateFilter = <Key extends keyof CatalogFilters>(
    key: Key,
    value: CatalogFilters[Key],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const installAndClose = () => {
    installSelected()
    setIsCatalogOpen(false)
  }

  return (
    <aside className="panel selector-panel">
      <div className="panel-header">
        <span className="eyebrow">Каталог</span>
        <h2>Комплектующие</h2>
      </div>

      <button
        className="catalog-trigger"
        onClick={() => openCatalog()}
        type="button"
      >
        <span>Открыть подбор</span>
        <strong>{componentsByType[selectedType].length}</strong>
      </button>

      <nav className="category-list" aria-label="Категории комплектующих">
        {partCategories.map((category) => {
          const installed = build[category.type]
            ? componentsById[build[category.type] ?? '']
            : null

          return (
            <button
              className={`category-button ${selectedType === category.type ? 'active' : ''}`}
              key={category.type}
              onClick={() => openCatalog(category.type)}
              type="button"
            >
              <span>{category.label}</span>
              <small>
                {installed?.name ?? 'пусто'} · {componentsByType[category.type].length} вариантов
              </small>
            </button>
          )
        })}
      </nav>

      <div className="selected-part-card">
        <small>Выбранная деталь</small>
        <strong>{selectedPart?.name ?? 'Откройте каталог'}</strong>
        {selectedPart ? (
          <div className="spec-row">
            {specList(selectedPart)
              .slice(0, 4)
              .map((spec) => (
                <small key={spec}>{spec}</small>
              ))}
          </div>
        ) : null}
      </div>

      {isCatalogOpen ? (
        <div
          className="catalog-overlay"
          onMouseDown={() => setIsCatalogOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Каталог комплектующих"
        >
          <section
            className="catalog-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="catalog-modal-header">
              <div>
                <span className="eyebrow">Выбор комплектующей</span>
                <h2>{selectedCategory?.label}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setIsCatalogOpen(false)}
                type="button"
                aria-label="Закрыть каталог"
              >
                ×
              </button>
            </header>

            <div className="catalog-tabs" role="tablist">
              {partCategories.map((category) => (
                <button
                  className={selectedType === category.type ? 'active' : ''}
                  key={category.type}
                  onClick={() => selectType(category.type)}
                  type="button"
                >
                  <span>{category.label}</span>
                  <small>{componentsByType[category.type].length}</small>
                </button>
              ))}
            </div>

            <div className="catalog-tools">
              <label className="search-field">
                <span>Поиск</span>
                <input
                  onChange={(event) => updateFilter('query', event.target.value)}
                  placeholder="RTX 4070, B650, DDR5..."
                  type="search"
                  value={filters.query}
                />
              </label>

              <label className="compat-toggle">
                <input
                  checked={filters.compatibleOnly}
                  onChange={(event) =>
                    updateFilter('compatibleOnly', event.target.checked)
                  }
                  type="checkbox"
                />
                Совместимо с текущей сборкой
              </label>
            </div>

            <div className="filter-grid">
              <label>
                Socket
                <select
                  onChange={(event) =>
                    updateFilter('socket', event.target.value as CatalogFilters['socket'])
                  }
                  value={filters.socket}
                >
                  <option value="all">Все</option>
                  <option value="LGA1700">LGA1700</option>
                  <option value="AM5">AM5</option>
                </select>
              </label>

              <label>
                Form factor
                <select
                  onChange={(event) =>
                    updateFilter(
                      'formFactor',
                      event.target.value as CatalogFilters['formFactor'],
                    )
                  }
                  value={filters.formFactor}
                >
                  <option value="all">Все</option>
                  <option value="ATX">ATX</option>
                  <option value="Micro-ATX">Micro-ATX</option>
                  <option value="Mini-ITX">Mini-ITX</option>
                </select>
              </label>

              <label>
                RAM
                <select
                  onChange={(event) =>
                    updateFilter('ramType', event.target.value as CatalogFilters['ramType'])
                  }
                  value={filters.ramType}
                >
                  <option value="all">Все</option>
                  <option value="DDR4">DDR4</option>
                  <option value="DDR5">DDR5</option>
                </select>
              </label>

              <label>
                Storage
                <select
                  onChange={(event) =>
                    updateFilter(
                      'storageType',
                      event.target.value as CatalogFilters['storageType'],
                    )
                  }
                  value={filters.storageType}
                >
                  <option value="all">Все</option>
                  <option value="M.2">M.2</option>
                  <option value="SATA">SATA</option>
                </select>
              </label>

              <label>
                PSU ≥
                <select
                  onChange={(event) =>
                    updateFilter('minWattage', Number(event.target.value))
                  }
                  value={filters.minWattage}
                >
                  <option value="0">Любой</option>
                  <option value="550">550W</option>
                  <option value="650">650W</option>
                  <option value="750">750W</option>
                  <option value="850">850W</option>
                  <option value="1000">1000W</option>
                </select>
              </label>

              <label>
                Цена до
                <select
                  onChange={(event) =>
                    updateFilter('maxPrice', Number(event.target.value))
                  }
                  value={filters.maxPrice}
                >
                  <option value="0">Без лимита</option>
                  <option value="100">$100</option>
                  <option value="250">$250</option>
                  <option value="500">$500</option>
                  <option value="1000">$1000</option>
                </select>
              </label>

              <label>
                Сортировка
                <select
                  onChange={(event) =>
                    updateFilter('sort', event.target.value as SortMode)
                  }
                  value={filters.sort}
                >
                  <option value="score-desc">Score</option>
                  <option value="price-asc">Сначала дешевле</option>
                  <option value="price-desc">Сначала дороже</option>
                  <option value="power-asc">Меньше ватт</option>
                  <option value="name">По названию</option>
                </select>
              </label>

              <button
                className="filter-reset"
                onClick={() => setFilters(initialFilters)}
                type="button"
              >
                Сбросить
              </button>
            </div>

            <div className="catalog-layout">
              <div className="catalog-results">
                <div className="catalog-count">
                  Найдено {filteredParts.length} из {categoryParts.length}
                </div>

                {filteredParts.length > 0 ? (
                  filteredParts.map((part) => {
                    const isSelected = selectedPartId === part.id
                    const isInstalled = build[part.type] === part.id
                    const isCompatible = isCompatibleCandidate(part, build)

                    return (
                      <button
                        className={`catalog-card ${isSelected ? 'selected' : ''} ${isInstalled ? 'installed' : ''}`}
                        key={part.id}
                        onClick={() => selectPart(part.id)}
                        type="button"
                      >
                        <div className="catalog-card-top">
                          <strong>{part.name}</strong>
                          <span>{currency.format(part.price)}</span>
                        </div>
                        <div className="spec-row">
                          {specList(part)
                            .slice(0, 5)
                            .map((spec) => (
                              <small key={spec}>{spec}</small>
                            ))}
                        </div>
                        <div className="part-card-meta">
                          <span>{part.powerDraw}W</span>
                          <span>Score {part.performanceScore}</span>
                          <b className={isCompatible ? 'ok-text' : 'error-text'}>
                            {isCompatible ? 'Совместимо' : 'Конфликт'}
                          </b>
                          {isInstalled ? <b>Установлено</b> : null}
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="empty-results">
                    Ничего не найдено. Попробуйте снять фильтр или изменить поиск.
                  </div>
                )}
              </div>

              <aside className="catalog-detail">
                {selectedPart?.type === selectedType ? (
                  <>
                    <span className="eyebrow">Предпросмотр</span>
                    <h3>{selectedPart.name}</h3>
                    <div className="detail-price">
                      {currency.format(selectedPart.price)}
                    </div>
                    <div className="detail-specs">
                      {specList(selectedPart).map((spec) => (
                        <span key={spec}>{spec}</span>
                      ))}
                      <span>{selectedPart.powerDraw}W draw</span>
                      <span>Performance {selectedPart.performanceScore}</span>
                    </div>
                    <button
                      className="primary-action"
                      onClick={installAndClose}
                      type="button"
                    >
                      Установить
                    </button>
                  </>
                ) : (
                  <div className="empty-detail">
                    Выберите модель из списка, чтобы увидеть характеристики и установить её.
                  </div>
                )}
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </aside>
  )
}
