import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useAnimations } from "@react-three/drei";


export const Player = ({animation, ...props}) => {
    const group = useRef();

    const { scene, animations } = useGLTF("/models/sk8r_animated.glb");
    const { actions } = useAnimations(animations, group);
    useEffect(() => {
        actions[animation]?.reset().fadeIn(0.24).play();
        return () => actions?.[animation]?.fadeOut(0.24);
      }, [animation]);

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload("/models/sk8r_animated.glb");
