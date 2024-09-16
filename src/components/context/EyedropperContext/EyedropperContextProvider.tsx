import { ReactNode, useState } from "react"
import { EyedropperContext, EyedropperContextSchema, EyedropperItemSchema } from "./EyedropperContext"

export interface EyedropperContextProviderProps {
  children: ReactNode
}

export const EyedropperContextProvider = ({ children }: EyedropperContextProviderProps) => {

  const [firstHistory, setFirstHistory] = useState<EyedropperItemSchema[]>([])
  const [secondHistory, setSecondHistory] = useState<EyedropperItemSchema[]>([])


  const addFirstHistory = (item: EyedropperItemSchema) => {
    setFirstHistory((prev) => {
      if (prev.length >= 25) {
        return [...prev.slice(1, 25), item]
      }
      return [...prev, item]
    })
  }

  const addSecondHistory = (item: EyedropperItemSchema) => {
    setSecondHistory((prev) => {
      if (prev.length >= 25) {
        return [...prev.slice(1, 25), item]
      }
      return [...prev, item]
    })
  }

  const resetFirstHistory = () => {
    setFirstHistory([])
  }
  const resetSecondHistory = () => {
    setSecondHistory([])
  }

  const value: EyedropperContextSchema = {
    firstHistory,
    secondHistory,
    addFirstHistory,
    addSecondHistory,
    resetFirstHistory,
    resetSecondHistory,
  }

  return <EyedropperContext.Provider value={value}>
    { children }
  </EyedropperContext.Provider>
}