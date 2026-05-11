# PC Sim

MVP игры-симулятора сборки ПК. Игрок выбирает комплектующие, устанавливает их в 3D-корпус, проверяет совместимость и запускает виртуальную операционную систему.

## Возможности

- 3D-сцена корпуса ПК на `@react-three/fiber` и `@react-three/drei`.
- Каталог на 380 комплектующих с реальными названиями моделей: корпус, плата, CPU, GPU, RAM, SSD, PSU и кулер.
- Поп-ап каталог с поиском, вкладками категорий, фильтрами, сортировкой и режимом совместимости с текущей сборкой.
- Проверка сокетов, RAM-типа, форм-фактора, мощности PSU, длины GPU, кулера и storage-слота.
- Состояния питания: `assembling`, `checking`, `post_error`, `bios`, `booting`, `os_running`, `shutdown`.
- Виртуальная ОС с меню Пуск, хотбаром, папкой `Games`, играбельными canvas-мини-играми с реальным ограничением рендера по FPS от benchmark score, окнами `Benchmark`, `System Info`, `Files`, `Games`, `Terminal`, `Task Monitor`, `Notes`, `Calculator`, `Settings` и командой `Shutdown`.
- Сохранение текущей сборки в `localStorage`.

## Стек

- React + TypeScript + Vite
- Three.js через `@react-three/fiber`
- `@react-three/drei`
- Zustand
- Обычный CSS

## Запуск

```bash
npm install
npm run dev
```

Сборка production-версии:

```bash
npm run build
```

## Структура

```text
src/data/components.ts        Тестовый каталог комплектующих
src/types.ts                  Общие типы игры
src/store/useBuildStore.ts    Zustand-store и localStorage
src/utils/compatibility.ts    Проверка совместимости
src/utils/benchmark.ts        Расчет benchmark-результата
src/components/PCScene.tsx    3D-сцена сборки ПК
src/components/PartSelector.tsx
src/components/BuildPanel.tsx
src/components/PowerScreen.tsx
src/components/VirtualOS.tsx
src/App.tsx
```

## Репозиторий

Remote: https://github.com/Goodog2013/PC-Sim

## Лицензия

MIT
