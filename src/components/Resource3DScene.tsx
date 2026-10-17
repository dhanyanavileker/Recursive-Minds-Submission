import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCw } from 'lucide-react'

interface Resource3DSceneProps {
  onMaterialSelect?: (name: string) => void
}

export function Resource3DScene({ onMaterialSelect }: Resource3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeItem, setActiveItem] = useState<string>('Hover or drag materials in 3D')
  const [isInteracting, setIsInteracting] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    // Soft transparent / dark forest background gradient
    scene.background = null

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 7.5)

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2)
    scene.add(ambientLight)

    // Key warm sunlight
    const dirLight = new THREE.DirectionalLight(0xffe8c2, 2.8)
    dirLight.position.set(5, 8, 6)
    dirLight.castShadow = true
    scene.add(dirLight)

    // Soft mint bounce light
    const fillLight = new THREE.DirectionalLight(0xddede5, 1.5)
    fillLight.position.set(-6, -4, 4)
    scene.add(fillLight)

    // Recursive Minds neon cyan/violet rim light
    const rimLight = new THREE.PointLight(0x25d9f0, 2.5, 15)
    rimLight.position.set(0, -4, -3)
    scene.add(rimLight)

    const violetLight = new THREE.PointLight(0x7041d9, 2.0, 15)
    violetLight.position.set(4, 3, -2)
    scene.add(violetLight)

    // Group for all rotating objects
    const mainGroup = new THREE.Group()
    scene.add(mainGroup)

    // 1. Central Infinite Loop / Circular Ring (Representing Circular Economy)
    const torusGeo = new THREE.TorusGeometry(2.1, 0.045, 32, 100)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x2f6b56,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x18332f,
      emissiveIntensity: 0.4
    })
    const ringMesh = new THREE.Mesh(torusGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 3
    mainGroup.add(ringMesh)

    // Second faint orbital ring
    const torusGeo2 = new THREE.TorusGeometry(2.8, 0.02, 24, 100)
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x25d9f0,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.4
    })
    const ringMesh2 = new THREE.Mesh(torusGeo2, ringMat2)
    ringMesh2.rotation.y = Math.PI / 4
    ringMesh2.rotation.x = -Math.PI / 6
    mainGroup.add(ringMesh2)

    // 2. Sea-Glass Ceramic Tiles (Stack of glazed ceramic)
    const tileGroup = new THREE.Group()
    const tileGeo = new THREE.BoxGeometry(0.85, 0.12, 0.85)
    const tileMat = new THREE.MeshPhysicalMaterial({
      color: 0x2ac4b2,
      roughness: 0.1,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9
    })
    const tileMat2 = tileMat.clone()
    tileMat2.color.setHex(0x38b2a3)
    const tileMat3 = tileMat.clone()
    tileMat3.color.setHex(0x5cc9bb)

    const t1 = new THREE.Mesh(tileGeo, tileMat)
    const t2 = new THREE.Mesh(tileGeo, tileMat2)
    t2.position.y = 0.13
    t2.rotation.y = 0.08
    const t3 = new THREE.Mesh(tileGeo, tileMat3)
    t3.position.y = 0.26
    t3.rotation.y = -0.06

    tileGroup.add(t1, t2, t3)
    tileGroup.position.set(-1.6, 0.9, 0.4)
    tileGroup.userData = { name: 'Sea-Glass Ceramic Mosaic Tiles', desc: '100% Waterproof glazed salvage' }
    mainGroup.add(tileGroup)

    // 3. Solid Pine Timber Block (Realistic wood grain texture simulation)
    const woodGeo = new THREE.BoxGeometry(0.55, 1.4, 0.4)
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.65,
      metalness: 0.02
    })
    const woodMesh = new THREE.Mesh(woodGeo, woodMat)
    woodMesh.position.set(1.5, -0.6, 0.5)
    woodMesh.rotation.set(0.4, -0.3, 0.2)
    woodMesh.userData = { name: 'Solid Pine Timber Offcuts', desc: 'Planed untreated architectural salvage' }
    mainGroup.add(woodMesh)

    // 4. Terracotta Garden Vessel / Clay Pot (Using LatheGeometry)
    const potPoints = []
    potPoints.push(new THREE.Vector2(0, -0.6))
    potPoints.push(new THREE.Vector2(0.32, -0.6))
    potPoints.push(new THREE.Vector2(0.46, 0.1))
    potPoints.push(new THREE.Vector2(0.52, 0.45))
    potPoints.push(new THREE.Vector2(0.56, 0.52))
    potPoints.push(new THREE.Vector2(0.48, 0.52))
    potPoints.push(new THREE.Vector2(0.44, 0.45))
    potPoints.push(new THREE.Vector2(0.38, 0.1))
    potPoints.push(new THREE.Vector2(0.24, -0.52))
    potPoints.push(new THREE.Vector2(0, -0.52))
    const potGeo = new THREE.LatheGeometry(potPoints, 32)
    const potMat = new THREE.MeshStandardMaterial({
      color: 0xc86a45,
      roughness: 0.88,
      metalness: 0.0
    })
    const potMesh = new THREE.Mesh(potGeo, potMat)
    potMesh.position.set(-0.9, -1.2, -0.2)
    potMesh.rotation.set(0.2, 0.4, -0.15)
    potMesh.userData = { name: 'Terracotta Planter Pots', desc: 'Natural porous clay for garden upcycling' }
    mainGroup.add(potMesh)

    // 5. Brushed Brass Architectural Handle (Hardware fitting)
    const brassGroup = new THREE.Group()
    const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.3, 24)
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xe5c158,
      metalness: 0.92,
      roughness: 0.22
    })
    const handleBar = new THREE.Mesh(handleGeo, brassMat)
    handleBar.rotation.z = Math.PI / 2

    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 16)
    const leg1 = new THREE.Mesh(legGeo, brassMat)
    leg1.position.set(-0.45, -0.18, 0)
    const leg2 = new THREE.Mesh(legGeo, brassMat)
    leg2.position.set(0.45, -0.18, 0)

    brassGroup.add(handleBar, leg1, leg2)
    brassGroup.position.set(1.4, 1.2, -0.4)
    brassGroup.rotation.set(-0.3, 0.5, 0.4)
    brassGroup.userData = { name: 'Brushed Brass Hardware', desc: 'Surplus solid brass fittings' }
    mainGroup.add(brassGroup)

    // 6. Warm Sandstone Paver
    const stoneGeo = new THREE.BoxGeometry(0.9, 0.9, 0.18)
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xc2b092,
      roughness: 0.92,
      metalness: 0.04
    })
    const stoneMesh = new THREE.Mesh(stoneGeo, stoneMat)
    stoneMesh.position.set(0.2, 1.7, -0.8)
    stoneMesh.rotation.set(0.6, 0.2, -0.3)
    stoneMesh.userData = { name: 'Dressed Sandstone Pavers', desc: 'Textured natural patio stones' }
    mainGroup.add(stoneMesh)

    // 7. Ambient Floating Dust / Light Spores
    const particleCount = 120
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8
      particlePositions[i + 1] = (Math.random() - 0.5) * 8
      particlePositions[i + 2] = (Math.random() - 0.5) * 6
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 2))

    const particleMat = new THREE.PointsMaterial({
      color: 0xffedd5,
      size: 0.055,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    })
    const particleSystem = new THREE.Points(particleGeo, particleMat)
    scene.add(particleSystem)

    // Raycaster for hover/click interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const interactiveObjects = [tileGroup, woodMesh, potMesh, brassGroup, stoneMesh]

    // Mouse & Drag State
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0
    let targetCameraX = 0
    let targetCameraY = 0

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      mouse.x = x
      mouse.y = y

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX
        const deltaY = e.clientY - prevMouseY
        targetRotationY += deltaX * 0.008
        targetRotationX += deltaY * 0.008
        prevMouseX = e.clientX
        prevMouseY = e.clientY
      } else {
        targetCameraX = x * 0.6
        targetCameraY = y * 0.4
      }

      // Check intersections
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(interactiveObjects, true)
      if (hits.length > 0) {
        let rootObj = hits[0].object
        while (rootObj.parent && rootObj.parent !== mainGroup) {
          rootObj = rootObj.parent
        }
        if (rootObj.userData?.name) {
          container.style.cursor = 'pointer'
          setActiveItem(`${rootObj.userData.name} — ${rootObj.userData.desc}`)
          onMaterialSelect?.(rootObj.userData.name)
        }
      } else {
        container.style.cursor = isDragging ? 'grabbing' : 'grab'
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      setIsInteracting(true)
      prevMouseX = e.clientX
      prevMouseY = e.clientY
      container.style.cursor = 'grabbing'
    }

    const onPointerUp = () => {
      isDragging = false
      setIsInteracting(false)
      container.style.cursor = 'grab'
    }

    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)

    // Resize handler
    const onResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // Animation Loop
    let clock = new THREE.Clock()
    let reqId: number

    const animate = () => {
      reqId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Idle levitation & gentle rotation
      if (!isDragging) {
        mainGroup.rotation.y += 0.004
      } else {
        mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.1
        mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.1
      }

      // Individual object bobbing & gentle tumbling
      tileGroup.position.y = 0.9 + Math.sin(elapsedTime * 1.5) * 0.08
      tileGroup.rotation.x = Math.sin(elapsedTime * 0.8) * 0.15
      tileGroup.rotation.z = Math.cos(elapsedTime * 0.9) * 0.1

      woodMesh.position.y = -0.6 + Math.cos(elapsedTime * 1.3) * 0.08
      woodMesh.rotation.y += 0.008
      woodMesh.rotation.x = 0.4 + Math.sin(elapsedTime * 1.1) * 0.1

      potMesh.position.y = -1.2 + Math.sin(elapsedTime * 1.2 + 1) * 0.07
      potMesh.rotation.y += 0.006

      brassGroup.position.y = 1.2 + Math.cos(elapsedTime * 1.4 + 2) * 0.09
      brassGroup.rotation.y += 0.01

      stoneMesh.position.y = 1.7 + Math.sin(elapsedTime * 1.0 + 3) * 0.06
      stoneMesh.rotation.y += 0.005

      // Orbital rings rotation
      ringMesh.rotation.z += 0.002
      ringMesh2.rotation.z -= 0.003

      // Camera parallax
      camera.position.x += (targetCameraX - camera.position.x) * 0.05
      camera.position.y += (targetCameraY - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)

      // Light drift
      dirLight.position.x = 5 + Math.sin(elapsedTime * 0.5) * 1.5
      dirLight.position.y = 8 + Math.cos(elapsedTime * 0.5) * 1.0

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', onResize)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [onMaterialSelect])

  return (
    <div className="resource-3d-wrapper">
      <div ref={containerRef} className="resource-3d-viewport" />
      <div className="resource-3d-hint">
        <div className="hint-pill">
          <RotateCw size={11} className={isInteracting ? 'spin-icon' : ''} />
          <span>{activeItem}</span>
        </div>
      </div>
    </div>
  )
}
