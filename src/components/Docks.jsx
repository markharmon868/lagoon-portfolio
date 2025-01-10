import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";

export const Docks = () => {
    const { scene } = useGLTF("/models/docks.glb");


    return (
        <>
            <RigidBody type="fixed" colliders="trimesh" position={[0, 0, 0]} friction={0}>
                <primitive object={scene} scale={[1,1,1]} />
            </RigidBody>
        </>
    );
};

useGLTF.preload("/models/docks.glb");