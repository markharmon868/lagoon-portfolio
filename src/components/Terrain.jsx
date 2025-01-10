import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";

export const Terrain = () => {
    const { scene } = useGLTF("/models/lagoon.glb");

    console.log(scene); 

    const road = scene; // Assuming the road is the first child
    // const island = scene.children[0]; // Assuming the island is the second child
    

    return (
        <>
            {/* Add the road as a tri-mesh collider */}
            <RigidBody type="fixed" colliders="trimesh" position={[0, 0, 0]} friction={0}>
                <primitive object={road} scale={[1,1,1]} />
            </RigidBody>

            {/* Add the island as a tri-mesh collider */}
            {/* <RigidBody type="fixed" colliders="trimesh" position={[0, 0, 0]} friction={0}>
                <primitive object={island} scale={[1,1,1]} />
            </RigidBody> */}
        </>
    );
};

useGLTF.preload("/models/lagoon.glb");