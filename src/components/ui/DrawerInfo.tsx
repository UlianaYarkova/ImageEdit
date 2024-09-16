import { useContext, useMemo } from "react";
import { FileContext } from "../context/FileContext/FileContext";
import { ImageDataContext } from "../context/ImageDataContext/ImageDataContext";
import { CanvasContext } from "../context/CanvasContext/CanvasContext";
import { Slider } from "@/components/ui/slider";
import { DrawerActions } from "./DrawerActions";
import { ResetImage } from "./ResetImage";
import { DialogResize } from "./DialogResize";
import { DialogHistogram } from "./DialogHistogram";
import { DialogFilters } from "./DialogFilters";
import { DownloadImage } from "./DownloadImage";

export const DrawerInfo = () => {
  const { file } = useContext(FileContext);
  const { img, x, y, currentColor } = useContext(ImageDataContext);
  const { canvasRef, scaleValue, setScaleValue } = useContext(CanvasContext);

  const rgb = useMemo(() => {
    //вычисление rgb-значения пикселя
    const context = canvasRef.current?.getContext("2d");

    if (!context || !x || !y) {
      return;
    }

    const pixel = context.getImageData(x, y, 1, 1);
    return pixel.data;
  }, [canvasRef, x, y]);

  if (!file) {
    return;
  }

  return (
    <div className="py-3 pt-4 border-l w-[400px] border-l-black border-opacity-25">
      <div className="container">
        <div className="flex justify-between">
          <div className="flex gap-4 flex-col">
            <div className="flex gap-2">
              <div>
                Ширина: <b>{img.width}</b>
              </div>
              <div>
                Высота: <b>{img.height}</b>
              </div>
            </div>
            <div className="flex gap-2">
              <div>
                X: <b>{x}</b>
              </div>
              <div>
                Y: <b>{y}</b>
              </div>
            </div>
            {rgb && (
              <div className="flex items-center">
                rgb:{" "}
                <span className="flex items-center gap-2">
                  <b>{currentColor?.toString()}</b>
                  <div
                    className="size-4"
                    style={{
                      backgroundColor: `rgba(${currentColor?.toString()})`,
                    }}
                  />
                </span>
              </div>
            )}
            <div className="flex gap-2 flex-col">
              <Slider
                className=""
                defaultValue={[scaleValue || 100]}
                max={300}
                min={12}
                onValueChange={(e) => setScaleValue?.(e[0])}
              />
              <div>
                Значение: <b>{scaleValue}%</b>
              </div>
            </div>
            <DrawerActions />

            <div className="flex flex-col gap-2 items-start">
              <DialogResize />
              <DialogHistogram />
              <DialogFilters />
              <DownloadImage />
              <ResetImage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
