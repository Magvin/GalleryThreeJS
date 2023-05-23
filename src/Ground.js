import { CuboidCollider, RigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { useTexture } from "@react-three/drei"
import woodfloor from "./assets/woodfloor.jpg"
export function Ground(props) {
    const texture = useTexture(woodfloor)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    console.log(texture)
  return (
    <RigidBody {...props} type="fixed" colliders={false}>
      <mesh receiveShadow position={[0, 0.5, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial map={texture} map-repeat={[720, 720]} color="#D6AE84" />
      </mesh>
      <CuboidCollider args={[1000, 2, 1000]} position={[0, -2, 0]} />
    </RigidBody>
  )
}
