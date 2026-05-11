import { ContactShadows, Html, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { getInstalledPart } from '../data/components'
import { useBuildStore } from '../store/useBuildStore'
import type { BuildSlots } from '../types'

type Vec3 = [number, number, number]

interface BoxPartProps {
  position: Vec3
  size: Vec3
  color: string
  opacity?: number
  wireframe?: boolean
}

function BoxPart({
  position,
  size,
  color,
  opacity = 1,
  wireframe = false,
}: BoxPartProps) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.05}
        opacity={opacity}
        transparent={opacity < 1}
        wireframe={wireframe}
      />
    </mesh>
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

function SceneLabel({ position, children }: { position: Vec3; children: string }) {
  return (
    <Html center position={position} transform distanceFactor={6}>
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
      <SceneLabel position={[0, height + 0.28, 0]}>
        {pcCase?.name ?? 'Выберите корпус'}
      </SceneLabel>
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
          <BoxPart
            position={[-0.55, 1.88, -0.51]}
            size={[0.42, 0.42, 0.08]}
            color="#d6d3d1"
          />
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

      {cooler ? (
        cooler.id === 'cooler-frost-240' ? (
          <group>
            <BoxPart
              position={[0.2, 3.05, -0.1]}
              size={[1.25, 0.16, 0.35]}
              color="#171717"
            />
            <Fan position={[-0.12, 3.15, -0.08]} radius={0.16} color="#80ed99" />
            <Fan position={[0.52, 3.15, -0.08]} radius={0.16} color="#80ed99" />
            <BoxPart
              position={[-0.55, 1.88, -0.42]}
              size={[0.62, 0.62, 0.12]}
              color="#0f172a"
            />
          </group>
        ) : (
          <group>
            <BoxPart
              position={[-0.55, 1.88, -0.38]}
              size={[0.65, 0.65, 0.18]}
              color="#475569"
            />
            <Fan position={[-0.55, 1.88, -0.23]} />
          </group>
        )
      ) : null}

      {ram ? (
        <group>
          <BoxPart
            position={[0.25, 1.82, -0.5]}
            size={[0.12, 1.15, 0.09]}
            color={ram.ramType === 'DDR5' ? '#80ffdb' : '#f7b267'}
          />
          <BoxPart
            position={[0.43, 1.82, -0.5]}
            size={[0.12, 1.15, 0.09]}
            color={ram.ramType === 'DDR5' ? '#57cc99' : '#f79d65'}
          />
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
          <BoxPart
            position={[0.18, 1.02, -0.26]}
            size={[gpu.length && gpu.length > 300 ? 2.25 : 1.75, 0.42, 0.28]}
            color={gpu.length && gpu.length > 300 ? '#7f1d1d' : '#365314'}
          />
          <BoxPart
            position={[-0.96, 1.02, -0.23]}
            size={[0.08, 0.55, 0.36]}
            color="#9ca3af"
          />
          <Fan position={[0.1, 1.02, -0.04]} radius={0.15} color="#e2e8f0" />
          <Fan position={[0.78, 1.02, -0.04]} radius={0.15} color="#e2e8f0" />
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
          <BoxPart
            position={[-1.22, 0.58, -0.25]}
            size={
              storage.storageType === 'M.2' ? [0.18, 0.75, 0.08] : [0.6, 0.42, 0.18]
            }
            color={storage.storageType === 'M.2' ? '#a7f3d0' : '#38bdf8'}
          />
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
          <BoxPart
            position={[1.05, 0.52, -0.22]}
            size={[0.92, 0.58, 0.55]}
            color={psu.wattage && psu.wattage >= 700 ? '#5b5f62' : '#3f3f46'}
          />
          <Fan position={[1.05, 0.52, 0.08]} radius={0.2} color="#cbd5e1" />
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
