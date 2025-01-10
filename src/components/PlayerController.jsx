import { useRef, useState, useEffect, forwardRef } from "react";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useGLTF, useKeyboardControls, Text } from "@react-three/drei";
import { Vector3, MathUtils } from "three";
import { useFrame, createPortal } from "@react-three/fiber";
import { useControls } from "leva";
import { degToRad } from "three/src/math/MathUtils";
import { Player } from "./Player";


export const PlayerController = forwardRef(({onEnterVehicle, vehicleRef, startPosition}, ref) => {

    const ypos = 10;

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
    var hasEnteredVehicle = false;

    const [showPopup, setShowPopup] = useState(false); // State for popup visibility



    // Proximity check state
    var isNearVehicle = false;


    // Proximity check logic
    useEffect(() => {
        const checkProximity = () => {
            const playerPosition = new Vector3().copy(rb.current.translation());
            const vehicleStartPosition = new Vector3(0, 0, -60); // Example vehicle position
            
            // console.log(vehicleRef.current)
            const distanceToStart = playerPosition.distanceTo(vehicleStartPosition);
            console.log(hasEnteredVehicle);
            
            if (!hasEnteredVehicle) {
                if (distanceToStart < 6) {
                    isNearVehicle = true;
                    // console.log("Near vehicle");
                }   else {
                    isNearVehicle = false;
                    // console.log("Not near vehicle");
                }
            };
            if (hasEnteredVehicle) {
                const vehiclePosition = vehicleRef.current.translation();
                const distance = playerPosition.distanceTo(vehiclePosition);
                console.log(distance);
                if (distance < 6) {
                    isNearVehicle = true;
                    console.log("Near vehicle");
                } else {
                    isNearVehicle = false;
                    console.log("Not near vehicle");
                }
            };
            // if (distance < 6 || distanceToStart < 6) {
            //     isNearVehicle = true;
            //     console.log("Near vehicle");
            // } else  if (distance > 6 || distanceToStart > 6) {
            //     isNearVehicle = false;
            //     console.log("Not near vehicle");
            // }
        };

        const interval = setInterval(checkProximity, 1000); // Check proximity periodically
        return () => clearInterval(interval);
    }, []);

    // Key press handling for entering/exiting the vehicle
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.key === "e" || event.key =="E") && onEnterVehicle && isNearVehicle) {
                console.log("Switching to VehicleController..."); // Debugging log
                onEnterVehicle();
                hasEnteredVehicle = true;
            }
            if (event.key === "o" || event.key === "O") {
                setShowPopup((prev) => !prev); // Toggle popup visibility
            }
        };
    
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onEnterVehicle]);



    useFrame(({ camera }) => {

        if (rb.current) {
            const vel = rb.current.linvel();
            const movement = { x: 0, z: 0, y: vel.y };

            if (get().forward) movement.z = 1;
            if (get().backward) movement.z = -1;
            if (get().left) movement.x = 1;
            if (get().right) movement.x = -1;
            if (get().jump && !isJumping) {
                movement.y = 5;
                setIsJumping(true);
                setAnimation("jumping");
            }
            

            if (movement.x !== 0){
                rotationTarget.current += ROTATION_SPEED * movement.x;
            }

            let speed = get().run ? RUN_SPEED : WALK_SPEED;


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
        <>
            {/* Popup */}
            {showPopup && (
                <Text
                    position={[-2, 10, -37]} // Position relative to player
                    rotation = {[0, Math.PI, 0]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={10}
                    outlineWidth={0.1}
                    outlineColor="black"
                >
                    This is a popup. Press "O" to close it.
                </Text>
            )}
        
            
            <RigidBody colliders={false} lockRotations ref={rb} 
                position={startPosition}
            >
                <group ref={container} > 
                    <group ref={cameraTarget} position-y = {ypos} position-z={1.5} />
                    <group ref={cameraPosition} position={[0, ypos+2, -10]} />
                    <group ref={character}>
                        <Player scale={[1,1,1]} position={[0, ypos-1.85, 0]} animation={animation}/>
                    </group>
                </group>
                <CapsuleCollider args = {[0.55, 0.3]} position={[0, ypos-1, 0]} /> 
            </RigidBody>
        </>
    );
});

