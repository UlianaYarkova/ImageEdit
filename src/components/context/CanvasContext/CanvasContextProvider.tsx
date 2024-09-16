import { ReactNode, useMemo, useState } from "react"
import { CanvasContext, CanvasContextSchema, ToolType, canvasRef } from "./CanvasContext"

export interface CanvasContextProviderProps {
  children: ReactNode
}

export const CanvasContextProvider = ({ children }: CanvasContextProviderProps) => {
  const [currentTool, setCurrentTool] = useState<ToolType>('')
  const isMoveable = useMemo(() => currentTool === 'movable', [currentTool])
  const isEyedropper = useMemo(() => currentTool === 'eyedropper', [currentTool])
  
  const [isVisibleDefaultCanvas, setIsVisibleDefaultCanvas] = useState(false)
  const [defaultImageData, setDefaultImageData] = useState<ImageData>()
  const [scaleValue, setScaleValue] = useState<number>(100)

  const value: CanvasContextSchema = {
    canvasRef, 
    isVisibleDefaultCanvas,
    setIsVisibleDefaultCanvas,
    defaultImageData,
    setDefaultImageData,
    scaleValue,
    setScaleValue,
    isMoveable,
    isEyedropper,
    currentTool,
    setCurrentTool
  }

  return <CanvasContext.Provider value={value}>
    { children }
  </CanvasContext.Provider>
}