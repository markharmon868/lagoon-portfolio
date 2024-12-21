import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";


export const Player = () => {
    const { scene } = useGLTF("/models/character_v1.glb");

    const player = scene.children[0]; // Assuming the road is the first child

    const ypos = 90;

    return (
        <group>
            <RigidBody colliders={false} type="dynamic" >
                <CapsuleCollider args = {[0.45, 1.4]} position={[0, ypos, 0]} /> 
                <primitive object={player} scale={[2,2,2]} position={[0, ypos-1.85, 0]} />
            </RigidBody>
        </group>
    );
};

useGLTF.preload("/models/character_v1.glb");