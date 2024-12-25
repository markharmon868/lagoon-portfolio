import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Suspense } from "react";
import { Physics } from "@react-three/rapier";
import { KeyboardControls } from "@react-three/drei";

function App() {

  const keyboardMap = [
    {name: "forward", keys: ["KeyW", "ArrowUp"] },
    {name: "backward", keys: ["KeyS", "ArrowDown"] },
    {name: "left", keys: ["KeyA", "ArrowLeft"] },
    {name: "right", keys: ["KeyD", "ArrowRight"] },
    {name: "run", keys: ["Shift"] },
  ]

  return (
    <KeyboardControls map={keyboardMap}>
    <Canvas shadows camera={{ position: [10, 10, 5], fov: 30 }}>
      <color attach="background" args={["#ececec"]} />
      <Suspense fallback={null}>
        <Physics debug={true}>
          <Experience />
        </Physics>
      </Suspense>
    </Canvas>
    </KeyboardControls>
  );
}

export default App;
