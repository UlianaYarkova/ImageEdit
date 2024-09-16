import { useContext, } from "react"
import { FileContext } from "../context/FileContext/FileContext"
import { Canvas } from "./Canvas"
import { CanvasContext } from "../context/CanvasContext/CanvasContext"
import { EyedropperMenu } from "./EyedropperMenu"
import { StartScreen } from "./StartScreen"
import { DrawerInfo } from "./DrawerInfo"

export const Main = () => {
  const { file, fileUrl } = useContext(FileContext)
  const { isEyedropper } = useContext(CanvasContext)


  if (!file || !fileUrl) {
    return <div className="text-center">
      <StartScreen />
    </div>
  }

 

  return (
    <main className="h-full flex">
      <Canvas />
      <DrawerInfo />
      {isEyedropper &&  <EyedropperMenu />}
    </main>
  )
}