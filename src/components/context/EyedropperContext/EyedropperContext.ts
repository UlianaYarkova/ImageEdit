import { createContext } from "react";

export interface EyedropperItemSchema {
  id: number
  rbga: number[],
  x: number,
  y: number
}

export interface EyedropperContextSchema {
  firstHistory?: EyedropperItemSchema[]
  secondHistory?: EyedropperItemSchema[]
  addFirstHistory?: (e: EyedropperItemSchema) => void
  addSecondHistory?: (e: EyedropperItemSchema) => void
  resetFirstHistory?: () => void
  resetSecondHistory?: () => void
}

export const EyedropperContext = createContext<EyedropperContextSchema>({})
