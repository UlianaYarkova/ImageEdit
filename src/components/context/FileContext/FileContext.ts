import { createContext } from "react";

export interface FileContextSchema {
  file?: File;
  fileUrl?: string;
  setFile?: (file: File | undefined) => void;
}

export const FileContext = createContext<FileContextSchema>({})