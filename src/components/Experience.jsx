import { Box, Sphere, OrbitControls } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";
import { Terrain } from "./Terrain.jsx";
import { PlayerController } from "./PlayerController.jsx";
import { GameController } from "./GameController.jsx";
import { Docks } from "./Docks.jsx";


export const Experience = () => {
  return (
    <>
      {/* Scene setup */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[-10, 10, 0]} intensity={0.4} />
      <GameController/>

      <Terrain />
      <Docks />
    </>
  );
};

useGLTF.preload("/models/island_and_road.glb");
