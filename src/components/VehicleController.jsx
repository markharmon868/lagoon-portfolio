import { RigidBody } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Quaternion, Euler, Vector3 } from "three";
import { useEffect } from "react";

export const VehicleController = ({ vehicleRef, onExitVehicle }) => {
    const [, get] = useKeyboardControls();

    const BASE_ACCELERATION = 15; // Forward/backward force
    const FRICTION = 0.99; // Friction for gradual deceleration
    const STEERING_SPEED = MathUtils.degToRad(1.7);
    const BREAK_FORCE = 0.985; // Gradual deceleration when moving forward

    const container = useRef();
    const rotationTarget = useRef(0);
    const cameraTarget = useRef();
    const cameraPosition = useRef();
    const cameraWorldPosition = useRef(new Vector3());
    const cameraLookAtWorldPosition = useRef(new Vector3());
    const cameraLookAt = useRef(new Vector3());

    

    useFrame(({ camera }) => {
        if (!vehicleRef.current) return;

        const vel = vehicleRef.current.linvel();
        const movement = {
            x: 0,
            z: 0,
        };

        if (get().forward) movement.z = 1;
        if (get().backward) movement.z = -1;
        if (get().left) movement.x = -1;
        if (get().right) movement.x = 1;

        // Steering logic
        if (movement.x !== 0) {
            rotationTarget.current += movement.x * STEERING_SPEED;
        }

        // Calculate speed and rotation
        const currentRotation = rotationTarget.current;
        const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);

        if (movement.z === 1) {
            // Forward movement
            const forwardForce = BASE_ACCELERATION;
            vel.x = forwardForce * -Math.sin(currentRotation);
            vel.z = forwardForce * Math.cos(currentRotation);
        } else if (movement.z === -1) {
            if (speed > 0.1) {
                // Gradually decelerate when moving forward
                vel.x *= BREAK_FORCE;
                vel.z *= BREAK_FORCE;
            } else {
                // Move backward only when stopped
                const backwardForce = -BASE_ACCELERATION;
                vel.x = backwardForce * -Math.sin(currentRotation);
                vel.z = backwardForce * Math.cos(currentRotation);
            }
        } else {
            // Gradual deceleration when no input
            vel.x *= FRICTION;
            vel.z *= FRICTION;

            // Align velocity with current rotation during deceleration
            if (speed > 0.1) {
                vel.x = speed * -Math.sin(currentRotation);
                vel.z = speed * Math.cos(currentRotation);
            }
        }

        vehicleRef.current.setLinvel(vel, true);

        // Rotate the rigid body to match the steering direction
        const quaternion = new Quaternion();
        const euler = new Euler(0, -rotationTarget.current, 0, "XYZ");
        quaternion.setFromEuler(euler);
        vehicleRef.current.setRotation(quaternion, true);

        // Update camera container position to match vehicle
        const vehiclePos = vehicleRef.current.translation();
        if (container.current) {
            container.current.position.x = vehiclePos.x;
            container.current.position.y = vehiclePos.y;
            container.current.position.z = vehiclePos.z;
        }

        // CAMERA
        container.current.rotation.y = MathUtils.lerp(
            container.current.rotation.y,
            -rotationTarget.current,
            0.1
        );

        // Update camera position
        cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
        camera.position.lerp(cameraWorldPosition.current, 0.5);

        // Update camera look target
        if (cameraTarget.current) {
            cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
        }
        cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.5);
        camera.lookAt(cameraLookAt.current);
    });

    // Handle exit vehicle key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "e") {
                onExitVehicle();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onExitVehicle]);

    return (
        <group ref={container}>
            <group ref={cameraTarget} position-z={10} />
            <group ref={cameraPosition} position={[0, 8, -15]} /> {/* Adjust these values to change camera distance/height */}
        </group>
    );
};
