import * as THREE from "three"
import * as RAPIER from "@dimforge/rapier3d-compat"
import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier"
import Hand from "./PlayerHand"

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()
const rotation = new THREE.Vector3()

export function Player({ lerp = THREE.MathUtils.lerp }) {
  const hand = useRef()
  const ref = useRef()
  const rapier = useRapier()
  const [, get] = useKeyboardControls()
  const isTouching = useRef(false)
  const touchStartPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handlePointerDown = (event) => {
      isTouching.current = true
      touchStartPos.current = { x: event.clientX, y: event.clientY }
    }

    const handlePointerUp = () => {
      isTouching.current = false
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("pointerup", handlePointerUp)
    document.addEventListener("pointercancel", handlePointerUp)


    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("pointerup", handlePointerUp)
    document.removeEventListener("pointercancel", handlePointerUp)

    }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const { forward, backward, left, right, jump } = get()
    const velocity = ref?.current?.linvel()

    // update camera
    const cameraPos = ref.current.translation()
    state.camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z + 5)

    // update axe
    hand.current.children[0].rotation.x = lerp(hand.current.children[0].rotation.x, Math.sin((velocity.length > 1) * state.clock.elapsedTime * 10) / 6, 0.1)
    hand.current.rotation.copy(state.camera.rotation)
    hand.current.position.copy(state.camera.position).add(state.camera.getWorldDirection(rotation).multiplyScalar(1))

    // movement
    frontVector.set(0, 0, backward - forward)
    sideVector.set(left - right, 0, 0)
    direction.set(0, 0, 0) // Reset the direction vector

    if (isTouching.current) {
        const touchX = touchStartPos.current.x - window.innerWidth / 2
        const touchY = touchStartPos.current.y - window.innerHeight / 2
  
        direction.add(new THREE.Vector3(touchX, 0, touchY).multiplyScalar(0.01))
        ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
      } else {
        ref.current.setLinvel({ x: 0, y: velocity.y, z: 0 })
      }

    // jumping
    const world = rapier.world.raw()
    const ray = world.castRay(new RAPIER.Ray(ref.current.translation(), { x: 0, y: -1, z: 0 }))
    const grounded = ray && ray.collider && Math.abs(ray.toi) <= 1.75
    if (jump && grounded) ref.current.setLinvel({ x: 0, y: 7.5, z: 0 })
  })

  return (
    <>
      <RigidBody ref={ref} colliders={false} mass={1} type="dynamic" position={[0, 10, 0]} enabledRotations={[false, false, false]}>
        <CapsuleCollider args={[0.75, 0.5]} />
      </RigidBody>
      <group ref={hand} onPointerMissed={() => (hand.current.children[0].rotation.x = -0.5)}>
        <Hand />
      </group>
    </>
  )
}
