import { Dispatch, SetStateAction, createContext } from "react";

export interface ImageDataContextSchema {
  x?: number,
  y?: number,
  setY?: Dispatch<SetStateAction<number>>,
  setX?: Dispatch<SetStateAction<number>>,
  currentColor?: Uint8ClampedArray,
  setCurrentColor?: Dispatch<SetStateAction<Uint8ClampedArray>>,
  img: HTMLImageElement,
  startImg: HTMLImageElement,
}

export const img = new Image()
export const startImg = new Image()

export const ImageDataContext = createContext<ImageDataContextSchema>({
  img,
  startImg,
})