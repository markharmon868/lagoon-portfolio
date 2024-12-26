import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useRef } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { MathUtils } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { Player } from "./Player";
import { useState } from "react";


export const PlayerController = () => {
    const { scene } = useGLTF("/models/sk8r_animated.glb");

    const road = scene.children[0]; // Assuming the road is the first child

    const ypos = 70;

    const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED} = useControls("Character Control", {
        WALK_SPEED: {value: 0.8, min: 0.1, max: 4, step: 0.1},
        RUN_SPEED: {value: 1.6, min: 0.2, max: 12, step: 0.1},
        ROTATION_SPEED: {
            value: degToRad(0.5),
            min: degToRad(0.1),
            max: degToRad(5),
            step: degToRad(0.1),
        },
    });

    // refs
    const rb = useRef();
    const character = useRef();
    const container = useRef();

    const [animation, setAnimation] = useState("idle");

    const characterRotationTarget = useRef(0);
    const rotationTarget = useRef(0);
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

            if (movement.x !== 0){
                rotationTarget.current += ROTATION_SPEED * movement.x;
            }

            let speed = get().run ? RUN_SPEED : WALK_SPEED;

            if (movement.z !== 0 || movement.x !== 0) {
                characterRotationTarget.current = Math.atan2(movement.x, movement.z);
                vel.x = Math.sin(rotationTarget.current + characterRotationTarget.current) * speed;
                vel.z = Math.cos(rotationTarget.current + characterRotationTarget.current) * speed;

                if (speed === RUN_SPEED || speed == WALK_SPEED) {
                    setAnimation("running");
                }
            } else {
                setAnimation("idle");
            }
            character.current.rotation.y = MathUtils.lerp(
                character.current.rotation.y,
                characterRotationTarget.current,
                0.1
            );

            rb.current.setLinvel(vel, true);
            
        }


        // CAMERA
        container.current.rotation.y = MathUtils.lerp(
            container.current.rotation.y,
            rotationTarget.current,
            0.1
        )

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
                    <Player scale={[2,2,2]} position={[0, ypos-1.85, 0]} animation={animation}/>
                </group>
            </group>
            <CapsuleCollider args = {[0.45, 1.4]} position={[0, ypos, 0]} /> 
        </RigidBody>
    );
};

useGLTF.preload("/models/character_v1.glb");