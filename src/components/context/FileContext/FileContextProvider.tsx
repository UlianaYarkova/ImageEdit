import { ReactNode, useState } from "react"
import { FileContext, FileContextSchema } from "./FileContext"

export interface FileContextProviderProps {
  children?: ReactNode
}

export const FileContextProvider= ({ children }: FileContextProviderProps) => {
  const [ file, setFile ] = useState<File>()
  const [ fileUrl, setFileUrl ] = useState<string>('')


  const setFileHandler = (file: File) => {
    URL.revokeObjectURL(fileUrl)
    setFile(file)
    setFileUrl(URL.createObjectURL(file))
  }

  const value: FileContextSchema = {
    file,
    fileUrl,
    setFile: setFileHandler,
  }
  return (
    <FileContext.Provider value={value}>
      { children }
    </FileContext.Provider>
  )
}