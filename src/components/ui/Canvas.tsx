import {
  CSSProperties,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ImageDataContext } from "../context/ImageDataContext/ImageDataContext";
import { CanvasContext } from "../context/CanvasContext/CanvasContext";
import {
  EyedropperContext,
  EyedropperItemSchema,
} from "../context/EyedropperContext/EyedropperContext";

const position = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export const Canvas = () => {
  const {
    img,
    setX,
    setY,
    setCurrentColor,
    x: currentImageX,
    y: currentImageY,
  } = useContext(ImageDataContext);
  const {
    canvasRef,
    scaleValue,
    setDefaultImageData,
    isMoveable,
    isEyedropper,
  } = useContext(CanvasContext);
  const { addFirstHistory, addSecondHistory } = useContext(EyedropperContext);

  // Очитка канваса
  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [canvasRef]);

  // получение высоты и ширины с учетом скейла
  const getWidthAndHeight = useCallback(() => {
    return [
      img.width * ((scaleValue || 100) / 100),
      img.height * ((scaleValue || 100) / 100),
    ];
  }, [img.height, img.width, scaleValue]);

  // рисование, вызываем при обновлении позиции скейла новый ImageData
  const drawImage = useCallback(
    (img: HTMLImageElement, x: number, y: number) => {
      if (!canvasRef.current) {
        return;
      }

      const context = canvasRef.current.getContext("2d");
      if (!context) {
        return;
      }
      clearCanvas();
      const [w, h] = getWidthAndHeight();

      let newX = x;
      let newY = y;
      if (w > canvasRef.current.width) {
        newX = Math.max(canvasRef.current.width - w, Math.min(newX, 0));
      } else {
        newX = Math.min(canvasRef.current.width - w, Math.max(newX, 0));
      }
      if (h > canvasRef.current.height) {
        newY = Math.max(canvasRef.current.height - h, Math.min(newY, 0));
      } else {
        newY = Math.min(canvasRef.current.height - h, Math.max(newY, 0));
      }

      context.drawImage(img, newX, newY, w, h);
    },
    [canvasRef, clearCanvas, getWidthAndHeight]
  );

  // Обновление позиции изображения нужно для перетаскивания
  const updatePosition = useCallback(
    (x: number, y: number) => {
      const [w, h] = getWidthAndHeight();

      position.bottom = y + h;
      position.top = y;
      position.right = x + w;
      position.left = x;
    },
    [getWidthAndHeight]
  );

  // обработчик обновления ссылки на изображение, вызываем обрисовку и обновление позиции
  img.onload = () => {
    if (canvasRef.current) {
      const context = canvasRef.current?.getContext("2d");
      if (!context) {
        return;
      }
      updateCanvasSize();

      const [wightImg, heightImg] = [
        img.width * ((scaleValue || 100) / 100),
        img.height * ((scaleValue || 100) / 100),
      ];
      const [dx, dy] = [
        canvasRef.current.offsetWidth / 2 - wightImg / 2,
        canvasRef.current.offsetHeight / 2 - heightImg / 2,
      ];
      drawImage(img, dx, dy);
      updatePosition(dx, dy);

      setDefaultImageData?.(context.getImageData(0, 0, img.width, img.height));
    }
  };
  // эффект для обновления канваса
  useEffect(() => {
    drawImage(img, position.left, position.top);
    updatePosition(position.left, position.top);
  }, [drawImage, img, updatePosition]);

  // переменные для перетаскивания
  const [startMousePosition, setStartMousePosition] = useState<
    [number, number]
  >([0, 0]);
  const [isMouseOnImage, setIsMouseOnImage] = useState(false);
  const [isDrag, setIsDrag] = useState(false);

  // Логика перетаскивания
  const handleOnMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) {
      return;
    }
    const context = canvasRef.current?.getContext("2d");
    if (!context) {
      return;
    }

    setIsMouseOnImage(
      (isMoveable || false) && getIsImage(e.clientX, e.clientY)
    );
    if (isDrag) {
      const dx = e.clientX - startMousePosition[0];
      const dy = e.clientY - startMousePosition[1];
      const [w, h] = getWidthAndHeight();

      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      let newW = position.left + dx;
      let newH = position.top + dy;

      if (w > canvasRef.current.width) {
        newW = Math.max(canvasRef.current.width - w, Math.min(newW, 0));
      } else {
        newW = Math.min(canvasRef.current.width - w, Math.max(newW, 0));
      }
      if (h > canvasRef.current.height) {
        newH = Math.max(canvasRef.current.height - h, Math.min(newH, 0));
      } else {
        newH = Math.min(canvasRef.current.height - h, Math.max(newH, 0));
      }

      context.drawImage(
        img,
        newW,
        newH,
        img.width * ((scaleValue || 100) / 100),
        img.height * ((scaleValue || 100) / 100)
      );
    }

    const { x, y } = e.currentTarget.getBoundingClientRect();
    const newX = Math.ceil(e.clientX - x);
    const newY = Math.ceil(e.clientY - y);

    if (getIsImage(e.clientX, e.clientY) && !isDrag) {
      setX?.(Math.ceil(((newX - position.left) / (scaleValue || 100)) * 100));
      setY?.(Math.ceil(((newY - position.top) / (scaleValue || 100)) * 100));
      setCurrentColor?.(context.getImageData(newX, newY, 1, 1).data);
    }
  };

  // стили нужно для того чтобы выдавать курсор мув когда начали перетаскивание
  const styles = useMemo<CSSProperties>(() => {
    const res = {
      cursor: isMouseOnImage ? "pointer" : "",
    };

    if (isDrag) {
      res.cursor = "move";
    }

    return res;
  }, [isMouseOnImage, isDrag]);

  // получение данные что курсор находится над изображением
  const getIsImage = (x: number, y: number) => {
    if (!canvasRef.current) {
      return false;
    }

    const { y: canvasY } = canvasRef.current.getBoundingClientRect();
    const [clientX, clientY] = [x, y - canvasY];

    if (
      clientX >= position.left &&
      clientX <= position.right &&
      clientY >= position.top &&
      clientY <= position.bottom
    ) {
      return true;
    }
    return false;
  };

  // обработчик зажатия лкм
  const handleOnMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!isMoveable) {
      return;
    }

    if (getIsImage(event.clientX, event.clientY)) {
      setIsDrag(true);
      setStartMousePosition([event.clientX, event.clientY]);
    }
  };
  // обработчик отжатия лкм
  const handleOnMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!isMoveable) {
      return;
    }

    if (isDrag) {
      const dx = event.clientX - startMousePosition[0];
      const dy = event.clientY - startMousePosition[1];
      updatePosition(position.left + dx, position.top + dy);
    }
    setIsDrag(false);
  };
  // обнолвение размера канваса
  const updateCanvasSize = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }
    canvasRef.current.width = canvasRef.current.offsetWidth;
    canvasRef.current.height = canvasRef.current.offsetHeight;

    drawImage(img, position.left, position.top);
  }, [canvasRef, drawImage, img]);
  // эффект для слушателя изменения ширины экрана
  useEffect(() => {
    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  });

  useEffect(() => {
    updateCanvasSize();
  }, [updateCanvasSize, isEyedropper]);

  // получить ImageData в определенном месте холста
  const getImageData = (
    x: number,
    y: number,
    width: number = 1,
    height: number = 1
  ): ImageData | void => {
    if (!canvasRef.current) {
      return;
    }
    const context = canvasRef.current.getContext("2d");
    if (!context) {
      return;
    }

    const { x: canvasX, y: canvasY } =
      canvasRef.current.getBoundingClientRect();
    const [dx, dy] = [x - canvasX, y - canvasY];

    return context.getImageData(dx, dy, width, height);
  };
  // обработчик клика для пипетки
  const handleOnClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isEyedropper && getIsImage(e.clientX, e.clientY)) {
      const rbg = getImageData(e.clientX, e.clientY)?.data;
      if (!rbg) {
        return;
      }

      const item: EyedropperItemSchema = {
        id: Date.now(),
        rbga: [...rbg],
        x: currentImageX || 0,
        y: currentImageY || 0,
      };

      if (e.shiftKey) {
        addSecondHistory?.(item);

        return;
      }
      addFirstHistory?.(item);
    }
  };
  // функции для стрелок чтобы перемещалось изображение
  const fc: Record<string, () => void> = useMemo(
    () => ({
      ArrowRight: () => {
        position.right = Math.min(
          position.right + 20,
          canvasRef.current?.width || Infinity
        );
        position.left = position.right - getWidthAndHeight()[0];
        drawImage(img, position.left, position.top);
      },
      ArrowLeft: () => {
        position.left = Math.max(position.left - 20, 0);
        position.right = position.left + getWidthAndHeight()[0];

        drawImage(img, position.left, position.top);
      },
      ArrowUp: () => {
        position.top = Math.max(position.top - 20, 0);
        position.bottom = position.top + getWidthAndHeight()[1];

        drawImage(img, position.left, position.top);
      },
      ArrowDown: () => {
        position.bottom = Math.min(
          position.bottom + 20,
          canvasRef.current?.height || Infinity
        );
        position.top = position.bottom - getWidthAndHeight()[1];
        drawImage(img, position.left, position.top);
      },
    }),
    [canvasRef, drawImage, getWidthAndHeight, img]
  );

  const cb = useCallback(
    (e: KeyboardEvent) => {
      fc?.[e.key]?.();
    },
    [fc]
  );
  // обработчик нажатия кнопок
  useEffect(() => {
    if (isMoveable) {
      window.addEventListener("keydown", cb);
    }

    return () => window.removeEventListener("keydown", cb);
  }, [cb, isMoveable]);

  return (
    <>
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={styles}
          onMouseDown={handleOnMouseDown}
          onMouseUp={handleOnMouseUp}
          onMouseMove={handleOnMouseMove}
          onClick={handleOnClick}
        />
      </div>
    </>
  );
};
