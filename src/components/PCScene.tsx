import { ContactShadows, Html, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { getInstalledPart } from '../data/components'
import { useBuildStore } from '../store/useBuildStore'
import type { BuildSlots, PCPart } from '../types'

type Vec3 = [number, number, number]

interface BoxPartProps {
  position: Vec3
  size: Vec3
  color: string
  rotation?: Vec3
  opacity?: number
  wireframe?: boolean
  emissiveIntensity?: number
}

function BoxPart({
  position,
  size,
  color,
  rotation,
  opacity = 1,
  wireframe = false,
  emissiveIntensity = 0.05,
}: BoxPartProps) {
  return (
    <mesh castShadow receiveShadow position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        opacity={opacity}
        transparent={opacity < 1}
        wireframe={wireframe}
      />
    </mesh>
  )
}

function Screw({ position }: { position: Vec3 }) {
  return (
    <mesh castShadow position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.035, 0.035, 0.018, 20]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.45} roughness={0.35} />
    </mesh>
  )
}

function LedStrip({
  position,
  size,
  color = '#53f0a9',
  rotation,
}: {
  position: Vec3
  size: Vec3
  color?: string
  rotation?: Vec3
}) {
  return (
    <BoxPart
      color={color}
      emissiveIntensity={0.42}
      position={position}
      rotation={rotation}
      size={size}
    />
  )
}

function Fan({
  position,
  radius = 0.22,
  color = '#8bd8bd',
}: {
  position: Vec3
  radius?: number
  color?: string
}) {
  return (
    <group position={position}>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, 0.08, 32]} />
        <meshStandardMaterial color="#111827" metalness={0.25} roughness={0.4} />
      </mesh>
      {[0, 1, 2].map((blade) => (
        <mesh
          key={blade}
          castShadow
          rotation={[0, 0, (Math.PI * 2 * blade) / 3]}
        >
          <boxGeometry args={[radius * 1.35, 0.035, 0.045]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

function FanGrill({
  position,
  radius = 0.22,
  color = '#8bd8bd',
}: {
  position: Vec3
  radius?: number
  color?: string
}) {
  return (
    <group position={position}>
      <Fan position={[0, 0, 0]} radius={radius} color={color} />
      {[-0.12, 0, 0.12].map((offset) => (
        <BoxPart
          color="#dbeafe"
          key={`vertical-${offset}`}
          opacity={0.55}
          position={[offset, 0, 0.06]}
          size={[0.018, radius * 1.75, 0.018]}
        />
      ))}
      {[-0.12, 0, 0.12].map((offset) => (
        <BoxPart
          color="#dbeafe"
          key={`horizontal-${offset}`}
          opacity={0.55}
          position={[0, offset, 0.06]}
          size={[radius * 1.75, 0.018, 0.018]}
        />
      ))}
    </group>
  )
}

function SceneLabel({ position, children }: { position: Vec3; children: string }) {
  return (
    <Html
      center
      distanceFactor={6}
      position={position}
      transform
      zIndexRange={[1, 0]}
    >
      <span className="scene-label">{children}</span>
    </Html>
  )
}

function CaseShell({ build }: { build: BuildSlots }) {
  const pcCase = getInstalledPart(build, 'case')
  const isCompact = pcCase?.id === 'case-nova-compact'
  const width = isCompact ? 3.25 : 3.85
  const height = isCompact ? 2.85 : 3.35
  const depth = isCompact ? 1.65 : 1.95
  const color = isCompact ? '#2a3840' : '#27313a'
  const accent = isCompact ? '#f7b267' : '#64d2c8'

  return (
    <group>
      <BoxPart
        position={[0, height / 2, -depth / 2]}
        size={[width, height, 0.08]}
        color={color}
      />
      <BoxPart
        position={[0, 0.03, 0]}
        size={[width, 0.08, depth]}
        color="#151b22"
      />
      <BoxPart
        position={[0, height - 0.03, 0]}
        size={[width, 0.08, depth]}
        color="#151b22"
      />
      <BoxPart
        position={[-width / 2, height / 2, 0]}
        size={[0.08, height, depth]}
        color="#1c2630"
      />
      <BoxPart
        position={[width / 2, height / 2, 0]}
        size={[0.08, height, depth]}
        color="#1c2630"
      />
      <BoxPart
        position={[0, height / 2, depth / 2]}
        size={[width, height, 0.035]}
        color="#91c9d8"
        opacity={0.1}
      />
      <BoxPart
        position={[-width / 2 + 0.08, height / 2, depth / 2 + 0.02]}
        size={[0.05, height * 0.86, 0.04]}
        color={accent}
      />
      <CaseDetails
        accent={accent}
        depth={depth}
        height={height}
        pcCase={pcCase}
        width={width}
      />
      <SceneLabel position={[0, height + 0.28, 0]}>
        {pcCase?.name ?? 'Выберите корпус'}
      </SceneLabel>
    </group>
  )
}

function CaseDetails({
  accent,
  depth,
  height,
  pcCase,
  width,
}: {
  accent: string
  depth: number
  height: number
  pcCase?: PCPart
  width: number
}) {
  const name = pcCase?.name ?? ''
  const isHyte = name.includes('Hyte Y60')
  const isO11 = name.includes('O11')
  const isFractalPop = name.includes('Pop Mini')
  const isNzxt = name.includes('NZXT H5')
  const isSmallForm = pcCase?.supportedFormFactors?.length === 1

  return (
    <group>
      {[-0.34, -0.17, 0, 0.17, 0.34].map((offset) => (
        <BoxPart
          color="#0b1218"
          key={`front-vent-${offset}`}
          opacity={0.58}
          position={[width / 2 + 0.012, height / 2 + offset * height, depth / 2 + 0.03]}
          size={[0.026, 0.04, depth * 0.72]}
        />
      ))}
      {[-0.7, 0.7].map((x) => (
        <FanGrill
          color={accent}
          key={`case-fan-${x}`}
          position={[x, height - 0.46, -depth / 2 - 0.08]}
          radius={0.17}
        />
      ))}
      {[
        [-width / 2 + 0.18, 0.19, depth / 2 + 0.05],
        [width / 2 - 0.18, 0.19, depth / 2 + 0.05],
        [-width / 2 + 0.18, height - 0.19, depth / 2 + 0.05],
        [width / 2 - 0.18, height - 0.19, depth / 2 + 0.05],
      ].map((position) => (
        <Screw key={position.join('-')} position={position as Vec3} />
      ))}
      {isNzxt ? (
        <>
          <BoxPart
            color="#cbd5e1"
            opacity={0.8}
            position={[-0.18, height / 2, depth / 2 + 0.065]}
            rotation={[0, 0, -0.42]}
            size={[0.08, height * 0.78, 0.05]}
          />
          <LedStrip
            color="#53f0a9"
            position={[width / 2 - 0.18, height / 2, depth / 2 + 0.07]}
            size={[0.035, height * 0.7, 0.035]}
          />
        </>
      ) : null}
      {isFractalPop ? (
        <>
          {['#f7b267', '#80ffdb', '#38bdf8'].map((stripe, index) => (
            <BoxPart
              color={stripe}
              key={stripe}
              position={[width / 2 + 0.035, height * (0.33 + index * 0.11), 0.18]}
              size={[0.035, 0.055, depth * 0.82]}
            />
          ))}
          <BoxPart
            color="#111827"
            position={[width / 2 + 0.04, 0.48, depth / 2 - 0.28]}
            size={[0.04, 0.22, 0.42]}
          />
        </>
      ) : null}
      {isHyte || isO11 ? (
        <>
          <BoxPart
            color="#91c9d8"
            opacity={0.22}
            position={[width / 2 + 0.035, height / 2, 0]}
            size={[0.035, height * 0.88, depth * 0.9]}
          />
          <LedStrip
            color={isHyte ? '#7ad3ff' : '#53f0a9'}
            position={[0, height - 0.16, depth / 2 + 0.07]}
            size={[width * 0.72, 0.035, 0.035]}
          />
        </>
      ) : null}
      {isSmallForm ? (
        <>
          {[-0.46, -0.28, -0.1, 0.08, 0.26, 0.44].map((x) => (
            <BoxPart
              color="#0b1218"
              key={`mesh-dot-${x}`}
              opacity={0.7}
              position={[x, height - 0.24, depth / 2 + 0.065]}
              size={[0.07, 0.04, 0.026]}
            />
          ))}
        </>
      ) : null}
    </group>
  )
}

function Motherboard({ build }: { build: BuildSlots }) {
  const motherboard = getInstalledPart(build, 'motherboard')
  const color = motherboard?.id === 'mb-sable-m4' ? '#31433b' : '#1d3b43'
  const size: Vec3 =
    motherboard?.formFactor === 'Micro-ATX' ? [1.65, 1.85, 0.08] : [1.9, 2.25, 0.08]

  if (!motherboard) {
    return (
      <BoxPart
        position={[-0.45, 1.68, -0.62]}
        size={[1.9, 2.25, 0.05]}
        color="#52616b"
        opacity={0.25}
        wireframe
      />
    )
  }

  return (
    <group>
      <BoxPart position={[-0.45, 1.68, -0.62]} size={size} color={color} />
      <MotherboardDetails motherboard={motherboard} size={size} />
      <BoxPart
        position={[-1.1, 2.45, -0.56]}
        size={[0.38, 0.28, 0.08]}
        color="#9ca3af"
      />
      <BoxPart
        position={[0.22, 2.15, -0.55]}
        size={[0.28, 0.45, 0.08]}
        color="#334155"
      />
      <SceneLabel position={[-0.45, 0.35, -0.5]}>{motherboard.name}</SceneLabel>
    </group>
  )
}

function MotherboardDetails({
  motherboard,
  size,
}: {
  motherboard: PCPart
  size: Vec3
}) {
  const isPremium = motherboard.name.includes('ROG') || motherboard.name.includes('Taichi') || motherboard.name.includes('AORUS Master')
  const accent = motherboard.socket === 'AM5' ? '#f7b267' : '#7ad3ff'
  const left = -0.45 - size[0] / 2
  const bottom = 1.68 - size[1] / 2

  return (
    <group>
      <BoxPart
        color="#0f172a"
        position={[left + 0.25, bottom + size[1] - 0.28, -0.52]}
        size={[0.42, 0.34, 0.1]}
      />
      <BoxPart
        color="#1e293b"
        position={[left + size[0] - 0.28, bottom + 0.3, -0.52]}
        size={[0.42, 0.3, 0.1]}
      />
      {[0, 1, 2, 3].map((slot) => (
        <BoxPart
          color={slot % 2 === 0 ? '#111827' : '#243244'}
          key={`dimm-${slot}`}
          position={[left + size[0] - 0.25 - slot * 0.1, 1.82, -0.5]}
          size={[0.035, 1.1, 0.055]}
        />
      ))}
      {[0, 1, 2].map((slot) => (
        <BoxPart
          color="#cbd5e1"
          key={`pcie-${slot}`}
          position={[left + 0.52, bottom + 0.48 + slot * 0.23, -0.5]}
          size={[0.88 - slot * 0.12, 0.045, 0.055]}
        />
      ))}
      <BoxPart
        color="#94a3b8"
        position={[left + size[0] * 0.58, bottom + 0.9, -0.49]}
        size={[0.68, 0.12, 0.06]}
      />
      <LedStrip
        color={accent}
        position={[left + size[0] - 0.1, bottom + size[1] * 0.58, -0.48]}
        size={[0.035, size[1] * 0.65, 0.035]}
      />
      {isPremium ? (
        <LedStrip
          color="#a78bfa"
          position={[left + size[0] * 0.42, bottom + size[1] - 0.12, -0.48]}
          size={[size[0] * 0.54, 0.035, 0.035]}
        />
      ) : null}
    </group>
  )
}

function CpuModel({ cpu }: { cpu: PCPart }) {
  const isIntel = cpu.name.includes('Intel')
  const accent = isIntel ? '#7ad3ff' : '#f97316'

  return (
    <group>
      <BoxPart
        color="#d6d3d1"
        position={[-0.55, 1.88, -0.51]}
        size={[0.42, 0.42, 0.08]}
      />
      <BoxPart
        color="#f8fafc"
        opacity={0.7}
        position={[-0.55, 1.88, -0.45]}
        size={[0.28, 0.18, 0.018]}
      />
      <LedStrip
        color={accent}
        position={[-0.55, 1.63, -0.45]}
        size={[0.32, 0.028, 0.018]}
      />
      {[-0.73, -0.37].map((x) => (
        <BoxPart
          color="#94a3b8"
          key={`cpu-notch-${x}`}
          position={[x, 1.88, -0.45]}
          size={[0.025, 0.08, 0.02]}
        />
      ))}
    </group>
  )
}

function CoolerModel({ cooler }: { cooler: PCPart }) {
  const isAio = cooler.requiredSlot?.includes('radiator')
  const isKraken = cooler.name.includes('Kraken')
  const isNoctua = cooler.name.includes('Noctua')
  const radiatorWidth = cooler.requiredSlot?.includes('360') ? 1.75 : cooler.requiredSlot?.includes('280') ? 1.45 : 1.25
  const fanCount = cooler.requiredSlot?.includes('360') ? 3 : 2
  const fanColor = isKraken ? '#7ad3ff' : isNoctua ? '#d6a25e' : '#80ed99'

  if (isAio) {
    return (
      <group>
        <BoxPart
          color="#171717"
          position={[0.2, 3.05, -0.1]}
          size={[radiatorWidth, 0.16, 0.35]}
        />
        {Array.from({ length: fanCount }, (_, index) => (
          <FanGrill
            color={fanColor}
            key={`aio-fan-${index}`}
            position={[
              0.2 - radiatorWidth / 2 + 0.28 + index * (radiatorWidth / fanCount),
              3.15,
              -0.08,
            ]}
            radius={0.14}
          />
        ))}
        <BoxPart
          color="#0f172a"
          position={[-0.55, 1.88, -0.42]}
          size={[0.62, 0.62, 0.12]}
        />
        <LedStrip
          color={fanColor}
          position={[-0.55, 1.88, -0.34]}
          size={[0.36, 0.035, 0.025]}
        />
        <BoxPart
          color="#334155"
          opacity={0.72}
          position={[-0.28, 2.46, -0.4]}
          rotation={[0, 0, 0.42]}
          size={[0.035, 1.12, 0.035]}
        />
      </group>
    )
  }

  return (
    <group>
      <BoxPart
        color={isNoctua ? '#78624a' : '#475569'}
        position={[-0.55, 1.88, -0.38]}
        size={[0.68, 0.68, 0.18]}
      />
      {[-0.2, -0.1, 0, 0.1, 0.2].map((offset) => (
        <BoxPart
          color="#cbd5e1"
          key={`fin-${offset}`}
          opacity={0.78}
          position={[-0.55 + offset, 1.88, -0.27]}
          size={[0.025, 0.72, 0.18]}
        />
      ))}
      <FanGrill position={[-0.55, 1.88, -0.18]} radius={0.19} color={fanColor} />
      {cooler.name.includes('NH-D15') ? (
        <FanGrill position={[-0.08, 1.88, -0.18]} radius={0.17} color={fanColor} />
      ) : null}
    </group>
  )
}

function RamModel({ ram }: { ram: PCPart }) {
  const isGSkill = ram.name.includes('G.Skill')
  const isKingston = ram.name.includes('Kingston')
  const base = ram.ramType === 'DDR5' ? '#111827' : '#334155'
  const accent = isGSkill ? '#a78bfa' : isKingston ? '#ef4444' : ram.ramType === 'DDR5' ? '#80ffdb' : '#f7b267'

  return (
    <>
      {[0.25, 0.43].map((x, index) => (
        <group key={`ram-stick-${x}`}>
          <BoxPart
            color={base}
            position={[x, 1.82, -0.5]}
            size={[0.12, 1.15, 0.09]}
          />
          <LedStrip
            color={accent}
            position={[x, 1.82, -0.43]}
            size={[0.08, 1.02, 0.025]}
          />
          {isGSkill ? (
            <BoxPart
              color="#e5e7eb"
              opacity={0.82}
              position={[x, 1.82, -0.39]}
              rotation={[0, 0, index === 0 ? 0.05 : -0.05]}
              size={[0.035, 0.84, 0.02]}
            />
          ) : null}
        </group>
      ))}
    </>
  )
}

function GpuModel({ gpu }: { gpu: PCPart }) {
  const isHighEnd = (gpu.length ?? 0) > 300 || gpu.name.includes('4090') || gpu.name.includes('5090')
  const isRadeon = gpu.name.includes('Radeon')
  const bodyLength = isHighEnd ? 2.35 : (gpu.length ?? 0) > 260 ? 2.05 : 1.72
  const fanCount = isHighEnd || (gpu.length ?? 0) > 260 ? 3 : 2
  const bodyColor = isRadeon ? '#7f1d1d' : isHighEnd ? '#2f343a' : '#365314'
  const accent = isRadeon ? '#ff6b6b' : '#80ffdb'

  return (
    <group>
      <BoxPart
        color={bodyColor}
        position={[0.18, 1.02, -0.26]}
        size={[bodyLength, 0.42, 0.28]}
      />
      <BoxPart
        color="#9ca3af"
        position={[-0.96, 1.02, -0.23]}
        size={[0.08, 0.55, 0.36]}
      />
      {Array.from({ length: fanCount }, (_, index) => (
        <FanGrill
          color={accent}
          key={`gpu-fan-${index}`}
          position={[
            0.18 - bodyLength / 2 + 0.42 + index * (bodyLength / fanCount),
            1.02,
            -0.04,
          ]}
          radius={0.13}
        />
      ))}
      <LedStrip
        color={accent}
        position={[0.18, 1.29, -0.1]}
        size={[bodyLength * 0.72, 0.035, 0.035]}
      />
      {isHighEnd ? (
        <BoxPart
          color="#111827"
          position={[0.18, 0.74, -0.23]}
          size={[bodyLength * 0.78, 0.09, 0.19]}
        />
      ) : null}
    </group>
  )
}

function StorageModel({ storage }: { storage: PCPart }) {
  const isM2 = storage.storageType === 'M.2'
  const isSamsung = storage.name.includes('Samsung')
  const baseColor = isM2 ? (isSamsung ? '#111827' : '#14532d') : '#1e3a8a'
  const accent = isSamsung ? '#38bdf8' : isM2 ? '#a7f3d0' : '#f7b267'

  return (
    <group>
      <BoxPart
        color={baseColor}
        position={[-1.22, 0.58, -0.25]}
        size={isM2 ? [0.18, 0.75, 0.08] : [0.6, 0.42, 0.18]}
      />
      <LedStrip
        color={accent}
        position={isM2 ? [-1.22, 0.58, -0.19] : [-1.22, 0.58, -0.1]}
        size={isM2 ? [0.12, 0.48, 0.022] : [0.42, 0.055, 0.025]}
      />
      <Screw position={isM2 ? [-1.22, 0.92, -0.18] : [-1.46, 0.76, -0.08]} />
      {!isM2 ? <Screw position={[-0.98, 0.4, -0.08]} /> : null}
    </group>
  )
}

function PsuModel({ psu }: { psu: PCPart }) {
  const isHighWatt = (psu.wattage ?? 0) >= 850
  const isCorsair = psu.name.includes('Corsair')
  const color = isHighWatt ? '#111827' : '#3f3f46'
  const accent = isCorsair ? '#facc15' : isHighWatt ? '#80ffdb' : '#cbd5e1'

  return (
    <group>
      <BoxPart
        color={color}
        position={[1.05, 0.52, -0.22]}
        size={[0.92, 0.58, 0.55]}
      />
      <FanGrill position={[1.05, 0.52, 0.08]} radius={0.2} color="#cbd5e1" />
      <LedStrip
        color={accent}
        position={[1.05, 0.82, 0.08]}
        size={[0.62, 0.035, 0.035]}
      />
      <BoxPart
        color="#e5e7eb"
        opacity={0.84}
        position={[1.43, 0.52, -0.03]}
        size={[0.04, 0.32, 0.24]}
      />
    </group>
  )
}

function InstalledParts({ build }: { build: BuildSlots }) {
  const cpu = getInstalledPart(build, 'cpu')
  const ram = getInstalledPart(build, 'ram')
  const gpu = getInstalledPart(build, 'gpu')
  const storage = getInstalledPart(build, 'storage')
  const psu = getInstalledPart(build, 'psu')
  const cooler = getInstalledPart(build, 'cooler')

  return (
    <group>
      {cpu ? (
        <>
          <CpuModel cpu={cpu} />
          <SceneLabel position={[-0.55, 2.25, -0.38]}>CPU</SceneLabel>
        </>
      ) : (
        <BoxPart
          position={[-0.55, 1.88, -0.51]}
          size={[0.44, 0.44, 0.04]}
          color="#737373"
          opacity={0.28}
          wireframe
        />
      )}

      {cooler ? <CoolerModel cooler={cooler} /> : null}

      {ram ? (
        <group>
          <RamModel ram={ram} />
          <SceneLabel position={[0.63, 1.14, -0.45]}>RAM</SceneLabel>
        </group>
      ) : (
        <BoxPart
          position={[0.34, 1.82, -0.49]}
          size={[0.35, 1.2, 0.04]}
          color="#737373"
          opacity={0.24}
          wireframe
        />
      )}

      {gpu ? (
        <group>
          <GpuModel gpu={gpu} />
          <SceneLabel position={[0.2, 0.58, -0.1]}>GPU</SceneLabel>
        </group>
      ) : (
        <BoxPart
          position={[0.18, 1.02, -0.25]}
          size={[1.95, 0.46, 0.08]}
          color="#737373"
          opacity={0.25}
          wireframe
        />
      )}

      {storage ? (
        <group>
          <StorageModel storage={storage} />
          <SceneLabel position={[-1.22, 0.23, -0.06]}>SSD</SceneLabel>
        </group>
      ) : (
        <BoxPart
          position={[-1.22, 0.58, -0.25]}
          size={[0.6, 0.42, 0.08]}
          color="#737373"
          opacity={0.25}
          wireframe
        />
      )}

      {psu ? (
        <group>
          <PsuModel psu={psu} />
          <SceneLabel position={[1.05, 0.12, 0.14]}>{`${psu.wattage}W`}</SceneLabel>
        </group>
      ) : (
        <BoxPart
          position={[1.05, 0.52, -0.22]}
          size={[0.92, 0.58, 0.55]}
          color="#737373"
          opacity={0.25}
          wireframe
        />
      )}
    </group>
  )
}

function PCModel({ build }: { build: BuildSlots }) {
  return (
    <group position={[0, -1.55, 0]}>
      <CaseShell build={build} />
      <Motherboard build={build} />
      <InstalledParts build={build} />
    </group>
  )
}

export function PCScene() {
  const build = useBuildStore((state) => state.build)

  return (
    <div className="scene-shell">
      <Canvas shadows camera={{ position: [4.5, 2.8, 4.4], fov: 45 }}>
        <color attach="background" args={['#0c1117']} />
        <ambientLight intensity={0.45} />
        <directionalLight
          castShadow
          intensity={1.4}
          position={[3, 5, 4]}
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight color="#80ffdb" intensity={1.2} position={[-3, 2, 2]} />
        <PCModel build={build} />
        <gridHelper args={[8, 16, '#24454a', '#17232b']} position={[0, -1.58, 0]} />
        <ContactShadows
          opacity={0.42}
          position={[0, -1.56, 0]}
          scale={6}
          blur={2.4}
          far={4}
        />
        <OrbitControls
          enablePan={false}
          minDistance={3.8}
          maxDistance={7}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </div>
  )
}
