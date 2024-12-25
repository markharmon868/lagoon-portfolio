import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useRef } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";


export const Player = () => {
    const { scene } = useGLTF("/models/character_v1.glb");

    const player = scene.children[0]; // Assuming the road is the first child

    const ypos = 70;

    const { WALK_SPEED, RUN_SPEED} = useControls("Character Control", {
        WALK_SPEED: {value: 0.8, min: 0.1, max: 4, step: 0.1},
        RUN_SPEED: {value: 1.6, min: 0.2, max: 12, step: 0.1},
    });

    // refs
    const rb = useRef();
    const character = useRef();
    const container = useRef();
    const cameraTarget = useRef();
    const cameraPosition = useRef();

    const cameraWorldPosition = useRef(new Vector3());
    const cameraLookAtWorldPosition = useRef(new Vector3());
    const cameraLookAt = useRef(new Vector3());

    const [, get] = useKeyboardControls();

    useFrame(({ camera }) => {

        if(rb.current) {
            const vel = rb.current.linvel();
            
            const movement = {
                x:0,
                z:0,
            }

            if (get().forward) {
                movement.z = 1;
            }
            if (get().backward) {
                movement.z = -1;
            }
            if (get().left) {
                movement.x = 1;
            }
            if (get().right) {
                movement.x = -1;
            }

            let speed = get().run ? RUN_SPEED : WALK_SPEED;

            if (movement.z !== 0 || movement.x !== 0) {
                vel.z = speed * movement.z;

            }

            rb.current.setLinvel(vel, true);
            
        }



        cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
        camera.position.lerp(cameraWorldPosition.current, 0.1);

        if(cameraTarget.current)
            cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
            cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);

            camera.lookAt(cameraLookAt.current);
    });

    return (
        
        <RigidBody colliders={false} lockRotations ref={rb}>
            <group ref={container}> 
                <group ref={cameraTarget} position-y = {ypos} position-z={1.5} />
                <group ref={cameraPosition} position={[0, ypos+4, -10]} />
                <group ref={character}>
                    <primitive object={player} scale={[2,2,2]} position={[0, ypos-1.85, 0]} />
                </group>
            </group>
            <CapsuleCollider args = {[0.45, 1.4]} position={[0, ypos, 0]} /> 
        </RigidBody>
    );
};

useGLTF.preload("/models/character_v1.glb");