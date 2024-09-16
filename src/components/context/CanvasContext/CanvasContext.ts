import { Dispatch, RefObject, SetStateAction, createContext, createRef } from "react";

export type ToolType = 'movable' | 'eyedropper' | ''

export interface CanvasContextSchema {
  canvasRef: RefObject<HTMLCanvasElement>
  defaultImageData?: ImageData,
  isVisibleDefaultCanvas: boolean,
  scaleValue?: number,
  isMoveable?: boolean,
  isEyedropper?: boolean,
  currentTool?: ToolType,
  setCurrentTool?: Dispatch<SetStateAction<ToolType>>,
  setScaleValue?: Dispatch<SetStateAction<number>>,
  setIsVisibleDefaultCanvas?: Dispatch<SetStateAction<boolean>>
  setDefaultImageData?: Dispatch<SetStateAction<ImageData | undefined>>
}

export const canvasRef = createRef<HTMLCanvasElement>();
export const defaultCanvasRef = createRef<HTMLCanvasElement>();
export const CanvasContext = createContext<CanvasContextSchema>({
  canvasRef: canvasRef,
  isVisibleDefaultCanvas: false,
})
