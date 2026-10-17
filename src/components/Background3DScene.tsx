import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ShieldCheck, Trees, Sprout, Wind } from 'lucide-react'

export function Background3DScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 14)

    // WebGL Renderer with alpha transparency
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1

    container.appendChild(renderer.domElement)

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xf7f3e8, 1.8)
    scene.add(ambientLight)

    // Warm natural sunbeam
    const sunLight = new THREE.DirectionalLight(0xfff3e0, 2.5)
    sunLight.position.set(8, 12, 10)
    scene.add(sunLight)

    // Deep forest restorative backlight
    const forestLight = new THREE.PointLight(0x2f6b56, 3.2, 30)
    forestLight.position.set(-9, -7, -2)
    scene.add(forestLight)

    // Sky protective glow
    const skyLight = new THREE.PointLight(0x38b2a3, 2.2, 25)
    skyLight.position.set(7, -5, -4)
    scene.add(skyLight)

    // Main Biosphere Group
    const biosphereGroup = new THREE.Group()
    biosphereGroup.position.set(0, 0, -3.5)
    scene.add(biosphereGroup)

    // ── 1. The Geodesic Earth / Biosphere Protective Canopy ──
    // Outer protective shield (Icosahedron wireframe dome)
    const domeGeo = new THREE.IcosahedronGeometry(4.2, 2)
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x2f6b56,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      roughness: 0.3,
      metalness: 0.1
    })
    const domeMesh = new THREE.Mesh(domeGeo, domeMat)
    biosphereGroup.add(domeMesh)

    // Inner glowing atmospheric sphere (represents protected clean air)
    const atmosGeo = new THREE.SphereGeometry(3.9, 36, 36)
    const atmosMat = new THREE.MeshStandardMaterial({
      color: 0xddede5,
      transparent: true,
      opacity: 0.18,
      roughness: 0.8,
      emissive: 0x2f6b56,
      emissiveIntensity: 0.22
    })
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat)
    biosphereGroup.add(atmosMesh)

    // Secondary subtle gold protective hex-cage
    const hexGeo = new THREE.DodecahedronGeometry(4.8, 1)
    const hexMat = new THREE.MeshStandardMaterial({
      color: 0xd8a84e,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      roughness: 0.4
    })
    const hexMesh = new THREE.Mesh(hexGeo, hexMat)
    biosphereGroup.add(hexMesh)

    // ── 2. The 3 Planetary Protection Orbit Rings ──
    // Ring A: Forest & Habitat Protection (Leaf Green)
    const ringGeoA = new THREE.TorusGeometry(5.6, 0.04, 24, 120)
    const ringMatA = new THREE.MeshStandardMaterial({
      color: 0x2f6b56,
      transparent: true,
      opacity: 0.45,
      metalness: 0.5,
      roughness: 0.2
    })
    const ringA = new THREE.Mesh(ringGeoA, ringMatA)
    ringA.rotation.x = Math.PI / 3
    biosphereGroup.add(ringA)

    // Orbiting satellite node on Ring A (sprout/carbon seed)
    const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16)
    const nodeMatA = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x2f6b56,
      emissiveIntensity: 0.8
    })
    const nodeA = new THREE.Mesh(nodeGeo, nodeMatA)
    biosphereGroup.add(nodeA)

    // Ring B: Clean Atmosphere & CO2e Prevention (Sky Cyan / Mint)
    const ringGeoB = new THREE.TorusGeometry(6.4, 0.03, 24, 120)
    const ringMatB = new THREE.MeshStandardMaterial({
      color: 0x38b2a3,
      transparent: true,
      opacity: 0.35,
      metalness: 0.6,
      roughness: 0.2
    })
    const ringB = new THREE.Mesh(ringGeoB, ringMatB)
    ringB.rotation.y = Math.PI / 4
    ringB.rotation.z = Math.PI / 6
    biosphereGroup.add(ringB)

    const nodeMatB = new THREE.MeshStandardMaterial({
      color: 0x25d9f0,
      emissive: 0x18332f,
      emissiveIntensity: 0.9
    })
    const nodeB = new THREE.Mesh(nodeGeo, nodeMatB)
    biosphereGroup.add(nodeB)

    // Ring C: Soil & Zero Landfill Waste Prevention (Warm Earth Amber)
    const ringGeoC = new THREE.TorusGeometry(7.2, 0.025, 24, 120)
    const ringMatC = new THREE.MeshStandardMaterial({
      color: 0xd8a84e,
      transparent: true,
      opacity: 0.3,
      metalness: 0.7,
      roughness: 0.3
    })
    const ringC = new THREE.Mesh(ringGeoC, ringMatC)
    ringC.rotation.x = -Math.PI / 4
    ringC.rotation.y = -Math.PI / 5
    biosphereGroup.add(ringC)

    const nodeMatC = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd8a84e,
      emissiveIntensity: 0.7
    })
    const nodeC = new THREE.Mesh(nodeGeo, nodeMatC)
    biosphereGroup.add(nodeC)

    // ── 3. Regenerative Upward Rising Flora & Spores ──
    // Procedural leaves floating upwards (showing nature regenerating)
    const leafShape = new THREE.Shape()
    leafShape.moveTo(0, -0.5)
    leafShape.bezierCurveTo(0.32, -0.15, 0.4, 0.35, 0, 0.8)
    leafShape.bezierCurveTo(-0.4, 0.35, -0.32, -0.15, 0, -0.5)

    const leafGeo = new THREE.ShapeGeometry(leafShape, 12)
    const pos = leafGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const dist = Math.sqrt(x * x + y * y)
      pos.setZ(i, Math.sin(dist * 2.5) * 0.12 - Math.abs(x) * 0.15)
    }
    leafGeo.computeVertexNormals()

    const leafMats = [
      new THREE.MeshStandardMaterial({
        color: 0x2f6b56,
        roughness: 0.6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      }),
      new THREE.MeshStandardMaterial({
        color: 0x478c73,
        roughness: 0.5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      }),
      new THREE.MeshStandardMaterial({
        color: 0x86b29d,
        roughness: 0.6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.58
      }),
      new THREE.MeshStandardMaterial({
        color: 0xd8a84e,
        roughness: 0.55,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.52
      })
    ]

    const leafCount = 42
    const floatingLeaves: {
      mesh: THREE.Mesh
      initialX: number
      speedY: number
      swaySpeed: number
      swayRadius: number
      rotSpeedX: number
      rotSpeedY: number
      rotSpeedZ: number
      timeOffset: number
    }[] = []

    const leavesGroup = new THREE.Group()
    scene.add(leavesGroup)

    for (let i = 0; i < leafCount; i++) {
      const mat = leafMats[i % leafMats.length]
      const mesh = new THREE.Mesh(leafGeo, mat)

      const scale = 0.45 + Math.random() * 0.75
      mesh.scale.set(scale, scale, scale)

      const x = (Math.random() - 0.5) * 26
      const y = -10 + Math.random() * 20
      const z = -6 + Math.random() * 8

      mesh.position.set(x, y, z)
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      )

      leavesGroup.add(mesh)

      floatingLeaves.push({
        mesh,
        initialX: x,
        speedY: 0.005 + Math.random() * 0.009, // Floating gently UPWARDS like new life
        swaySpeed: 0.8 + Math.random() * 1.2,
        swayRadius: 0.3 + Math.random() * 0.6,
        rotSpeedX: (Math.random() - 0.5) * 0.016,
        rotSpeedY: (Math.random() - 0.5) * 0.014,
        rotSpeedZ: (Math.random() - 0.5) * 0.01,
        timeOffset: Math.random() * Math.PI * 2
      })
    }

    // ── 4. Bio-luminescent Clean Energy Spores ──
    const sporeCount = 140
    const sporeGeo = new THREE.BufferGeometry()
    const sporePositions = new Float32Array(sporeCount * 3)

    for (let i = 0; i < sporeCount * 3; i += 3) {
      sporePositions[i] = (Math.random() - 0.5) * 28
      sporePositions[i + 1] = -12 + Math.random() * 24
      sporePositions[i + 2] = -8 + Math.random() * 12
    }
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3))

    const sporeMat = new THREE.PointsMaterial({
      color: 0x478c73,
      size: 0.08,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    })
    const sporeSystem = new THREE.Points(sporeGeo, sporeMat)
    scene.add(sporeSystem)

    // Parallax mouse interaction
    let targetX = 0
    let targetY = 0

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 1.8
      targetY = -(e.clientY / window.innerHeight - 0.5) * 1.2
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Pause when page is hidden
    let isHidden = document.hidden
    const onVisibilityChange = () => {
      isHidden = document.hidden
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // Animation Loop
    let reqId: number
    const clock = new THREE.Clock()

    const animate = () => {
      reqId = requestAnimationFrame(animate)
      if (isHidden) return

      const elapsed = clock.getElapsedTime()

      // Smooth camera parallax
      camera.position.x += (targetX - camera.position.x) * 0.035
      camera.position.y += (targetY - camera.position.y) * 0.035
      camera.lookAt(0, 0, 0)

      // Biosphere protection dome gentle breathing and rotation
      domeMesh.rotation.y = elapsed * 0.04
      domeMesh.rotation.x = Math.sin(elapsed * 0.2) * 0.08

      hexMesh.rotation.y = -elapsed * 0.03
      hexMesh.rotation.z = elapsed * 0.02

      // Atmospheric breathing pulse
      const breathe = 1 + Math.sin(elapsed * 0.8) * 0.02
      atmosMesh.scale.set(breathe, breathe, breathe)

      // Rings slow orbital gyroscopic rotation
      ringA.rotation.z += 0.003
      ringA.rotation.x += 0.001
      ringB.rotation.z -= 0.002
      ringB.rotation.y += 0.0015
      ringC.rotation.z += 0.0025

      // Satellite nodes orbiting their respective rings
      const angleA = elapsed * 0.6
      nodeA.position.set(
        Math.cos(angleA) * 5.6,
        Math.sin(angleA) * 5.6 * Math.cos(Math.PI / 3),
        Math.sin(angleA) * 5.6 * Math.sin(Math.PI / 3)
      )

      const angleB = -elapsed * 0.5
      nodeB.position.set(
        Math.cos(angleB) * 6.4 * Math.cos(Math.PI / 4),
        Math.sin(angleB) * 6.4,
        Math.cos(angleB) * 6.4 * Math.sin(Math.PI / 4)
      )

      const angleC = elapsed * 0.4
      nodeC.position.set(
        Math.cos(angleC) * 7.2 * Math.cos(-Math.PI / 5),
        Math.sin(angleC) * 7.2 * Math.cos(-Math.PI / 4),
        Math.sin(angleC) * 7.2 * Math.sin(-Math.PI / 4)
      )

      // Upward rising regenerative leaves (nature protection in motion)
      for (let i = 0; i < floatingLeaves.length; i++) {
        const item = floatingLeaves[i]
        const m = item.mesh

        // Upward gentle drift
        m.position.y += item.speedY
        m.position.x = item.initialX + Math.sin(elapsed * item.swaySpeed + item.timeOffset) * item.swayRadius

        // Organic tumbling rotation
        m.rotation.x += item.rotSpeedX
        m.rotation.y += item.rotSpeedY
        m.rotation.z += item.rotSpeedZ

        // Loop from bottom when reaching the top
        if (m.position.y > 11) {
          m.position.y = -11
          item.initialX = (Math.random() - 0.5) * 26
        }
      }

      // Slowly rotate particle field
      sporeSystem.rotation.y = elapsed * 0.02
      sporeSystem.position.y = Math.sin(elapsed * 0.4) * 0.4

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="nature-3d-background-wrapper" aria-hidden="true">
      <div ref={containerRef} className="nature-3d-canvas" />
      {/* Nature Protection Live Impact Strip at the bottom of the background */}
      <div className="nature-protection-badge-strip">
        <div className="nature-badge-pill">
          <ShieldCheck size={13} className="text-leaf" />
          <span>Circular Protection Canopy</span>
        </div>
        <div className="nature-badge-pill">
          <Trees size={13} className="text-leaf" />
          <span>64.5 kg Landfill Waste Prevented</span>
        </div>
        <div className="nature-badge-pill">
          <Wind size={13} className="text-leaf" />
          <span>42.0 kg CO₂e Emissions Avoided</span>
        </div>
        <div className="nature-badge-pill">
          <Sprout size={13} className="text-amber" />
          <span>100% Free Circular Reuse</span>
        </div>
      </div>
    </div>
  )
}
