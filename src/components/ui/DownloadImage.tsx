import { downloadImage } from "@/lib/filters";
import { useCanvasContext } from "../context/CanvasContext/useCanvasContext";
import { useContext } from "react";
import { ImageDataContext } from "../context/ImageDataContext/ImageDataContext";
import { Button } from "./button";

export interface DownloadImageProps {
  className?: string
}

export const DownloadImage = () => {
  const canvasRef = useCanvasContext();
  const { img } = useContext(ImageDataContext);

  const onDownload = () => {
    if (!canvasRef?.current) {
      return
    }

    downloadImage(img)
  }

  return (
    <Button className="cursor-pointer" onClick={onDownload}>
      Скачать
    </Button>
  )
}