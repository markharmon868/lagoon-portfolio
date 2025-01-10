import { CuboidCollider, RigidBody } from "@react-three/rapier";
import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Capsule, useGLTF } from "@react-three/drei";
import { CapsuleCollider } from "@react-three/rapier";

export const Vehicle = forwardRef(({ position, scale }, ref) => {
    const rigidBodyRef = useRef(); // Internal ref for the RigidBody

    const { scene } = useGLTF("/models/wrx.glb");

    // Expose the RigidBody itself to the parent
    useImperativeHandle(ref, () => rigidBodyRef.current);

    return (
        <RigidBody ref={rigidBodyRef} position={position} type="dyanmic" colliders={"hull"} mass={1000}>
            <primitive object={scene} scale={scale} />  
            {/* <CapsuleCollider position={[0, 0.5, -1]} args={[1,2,10]} rotation={[Math.PI/2,0,0]}  /> */}
        </RigidBody>
    );
});

useGLTF.preload("/models/wrx.glb");
