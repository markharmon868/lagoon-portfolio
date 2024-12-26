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
import { useEffect } from "react";



export const PlayerController = () => {
    const { scene } = useGLTF("/models/sk8r_animated.glb");

    const road = scene.children[0]; // Assuming the road is the first child

    const ypos = 70;

    const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED} = useControls("Character Control", {
        WALK_SPEED: {value: 2.1, min: 0.1, max: 4, step: 0.1},
        RUN_SPEED: {value: 4.2, min: 0.2, max: 12, step: 0.1},
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

    const [animation, setAnimation] = useState(" ");
    const [isJumping, setIsJumping] = useState(false);

    const characterRotationTarget = useRef(0);
    const rotationTarget = useRef(0);
    const cameraTarget = useRef();
    const cameraPosition = useRef();

    const cameraWorldPosition = useRef(new Vector3());
    const cameraLookAtWorldPosition = useRef(new Vector3());
    const cameraLookAt = useRef(new Vector3());

    const [, get] = useKeyboardControls();
    const isClickiing = useRef(false);

    useEffect(() => {
        const onMouseDown = (e) => {
            isClickiing.current = true;
        }
        const onMouseUp = (e) => {
            isClickiing.current = false;
        }
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
        }
    }, []);


    useFrame(({ camera, mouse }) => {

        if(rb.current) {
            const vel = rb.current.linvel();
            
            const movement = {
                x:0,
                z:0,
                y: vel.y,
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
            if (get().jump && !isJumping) {
                movement.y = 5;
                setIsJumping(true);
                setAnimation("jumping");
            }
            

            if (movement.x !== 0){
                rotationTarget.current += ROTATION_SPEED * movement.x;
            }

            let speed = get().run ? RUN_SPEED : WALK_SPEED;

            if (isClickiing.current) {
                console.log('clicking', mouse.x, mouse.y);
                movement.x = -mouse.x;
                movement.z = mouse.y + 0.5;
                if (Math.abs(movement.x) > 0.3 || Math.abs(movement.z) > 0.3) {
                    speed = RUN_SPEED;
                }
            }

            if (movement.y !== 0 && !isJumping) {
                vel.y = movement.y;
                setAnimation("jumping");
            } 

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
            
            if (Math.abs(vel.y) < 0.01 && isJumping) {
                setIsJumping(false);
                setAnimation("idle");
            }
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
                <group ref={cameraPosition} position={[0, ypos+8, -15]} />
                <group ref={character}>
                    <Player scale={[2,2,2]} position={[0, ypos-1.85, 0]} animation={animation}/>
                </group>
            </group>
            <CapsuleCollider args = {[0.45, 1.4]} position={[0, ypos, 0]} /> 
        </RigidBody>
    );
};

useGLTF.preload("/models/character_v1.glb");