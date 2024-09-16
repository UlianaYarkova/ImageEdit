import { RefObject, useContext, useEffect, useState } from "react";
import { CanvasContext } from "./CanvasContext";

export function useCanvasContext() {
  const [ref, setRef] = useState<RefObject<HTMLCanvasElement>>();
  const { canvasRef } = useContext(CanvasContext);

  useEffect(() => {
    setRef(canvasRef);
  }, [canvasRef]);

  return ref
}