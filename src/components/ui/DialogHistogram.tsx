import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './dialog';
import { Button } from './button';
import { ImageDataContext } from '../context/ImageDataContext/ImageDataContext';
import { Input } from './input';
import { Label } from './label';

export const DialogHistogram = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isPreview, setIsPreview] = useState(false);
	const [imgData, setImgData] = useState<ImageData>();
	const [imgDataToPreview, setImgDataToPreview] = useState<ImageData>();
	const [firstX, setFirstX] = useState(0);
	const [firstY, setFirstY] = useState(0);
	const [secondX, setSecondX] = useState(255);
	const [secondY, setSecondY] = useState(255);

	const { img } = useContext(ImageDataContext);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const prewCanvasRef = useRef<HTMLCanvasElement>(null);

  // инициализациия начальной ImageData
	const onInitImgData = useCallback(() => {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.drawImage(img, 0, 0);
		const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		setImgData(data);
		setImgDataToPreview(data);
	}, [img]);

  // Отрисовка гистограммы
	const drawHistogram = useCallback(() => {
		const ctx = canvasRef.current?.getContext('2d');
		if (!canvasRef.current || !imgDataToPreview || !ctx) {
			return;
		}

		const src = imgDataToPreview.data;
		const histR = new Array(256).fill(0);
		const histG = new Array(256).fill(0);
		const histB = new Array(256).fill(0);

		for (let i = 0; i < src.length; i += 4) {
			const r = src[i + 0];
			const g = src[i + 1];
			const b = src[i + 2];
			histR[r]++;
			histG[g]++;
			histB[b]++;
		}

		let maxBrightness = 0;
		for (let i = 0; i < 256; i++) {
			if (maxBrightness < histR[i]) {
				maxBrightness = histR[i];
			} else if (maxBrightness < histG[i]) {
				maxBrightness = histG[i];
			} else if (maxBrightness < histB[i]) {
				maxBrightness = histB[i];
			}
		}
		const guideHeight = 0;
		const startY = canvasRef.current.height - guideHeight;
		const dx = canvasRef.current.width / 256;
		const dy = startY / maxBrightness;
		ctx.lineWidth = dx;
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

		for (let i = 0; i < 256; i++) {
			const x = i * dx;
			// Red
			ctx.strokeStyle = 'rgba(220,0,0,0.5)';
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, startY - histR[i] * dy);
			ctx.closePath();
			ctx.stroke();
			// Green
			ctx.strokeStyle = 'rgba(0,210,0,0.5)';
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, startY - histG[i] * dy);
			ctx.closePath();
			ctx.stroke();
			// Blue
			ctx.strokeStyle = 'rgba(0,0,255,0.5)';
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, startY - histB[i] * dy);
			ctx.closePath();
			ctx.stroke();
			// Guide
			ctx.strokeStyle = 'rgb(' + i + ', ' + i + ', ' + i + ')';
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, canvasRef.current.height);
			ctx.closePath();
			ctx.stroke();
		}

		{
			const x = secondX;
			const y = 256 - secondY;
			ctx.beginPath();
			ctx.arc(x, y, 5, 0, 2 * Math.PI);
			ctx.fillStyle = 'grey';
			ctx.fill();
		}

		{
			const x = firstX;
			const y = 256 - firstY;
			ctx.beginPath();
			ctx.arc(x, y, 5, 0, 2 * Math.PI);
			ctx.fillStyle = 'grey';
			ctx.fill();
		}

		ctx.strokeStyle = 'grey';
		ctx.beginPath();
		ctx.moveTo(0, 256 - firstY);
		ctx.lineTo(firstX, 256 - firstY);
		ctx.closePath();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(256, 256 - secondY);
		ctx.lineTo(secondX, 256 - secondY);
		ctx.closePath();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(firstX, 256 - firstY);
		ctx.lineTo(secondX, 256 - secondY);
		ctx.closePath();
		ctx.stroke();
	}, [firstX, firstY, imgDataToPreview, secondX, secondY]);
  // Создания LUT матрицы
	const getLUT = () => {
		const lut = new Uint8ClampedArray(256);
		for (let i = 0; i < 256; i++) {
			if (i <= firstX) {
				lut[i] = firstY;
			} else if (i >= secondX) {
				lut[i] = secondY;
			} else {
				lut[i] =
					firstY + ((i - firstX) * (secondY - firstY)) / (secondX - firstX);
			}
		}
		return lut;
	};
  // ПРеменнеи LUT
	const applyLUT = (imageData: ImageData, lut: Uint8ClampedArray) => {
		const newImageData = new ImageData(imageData.width, imageData.height, {
			colorSpace: 'srgb',
		});

		for (let i = 0; i < imageData.data.length; i += 4) {
			newImageData.data[i] = lut[imageData!.data[i]]; // Red channel
			newImageData.data[i + 1] = lut[imageData!.data[i + 1]]; // Green channel
			newImageData.data[i + 2] = lut[imageData!.data[i + 2]]; // Blue channel
			newImageData.data[i + 3] = 255; // Alfa channel
		}
		return newImageData;
	};
  // Применение изменения гистограммы к превью
	const applyCorrection = () => {
		const ctx = canvasRef.current?.getContext('2d');
		if (!ctx || !canvasRef.current) return;

		const lut = getLUT();
		setImgDataToPreview((prev) => prev && applyLUT(prev, lut));
	};
  // Применения изменений к основной картинке
	const applyFilter = () => {
		if (!imgDataToPreview) return;

		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

		ctx.putImageData(imgDataToPreview, 0, 0);
		canvas.toBlob(function (blob) {
			if (!blob) {
				setIsOpen(false);
				return;
			}

			img.src = URL.createObjectURL(blob);
			setIsOpen(false);
		});
	};
  // Эфект на обновление превью
	useEffect(() => {
		if (imgDataToPreview && isPreview) {
			prewCanvasRef.current
				?.getContext('2d')
				?.putImageData(imgDataToPreview, 0, 0);
		}
	}, [imgDataToPreview, isPreview]);

  // обновление пресью
	useEffect(() => {
		if (isOpen) {
			drawHistogram();
		}
	}, [drawHistogram, secondX, secondY, firstX, firstY]);

  // начальная отрисовка
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				console.log(canvasRef.current);

				if (canvasRef.current) {
					drawHistogram();
				}
			}, 0);
		}
	}, [isOpen]);

  // сброс значений полей ввода 
	const resetPointsPosition = () => {
		setFirstX(0);
		setFirstY(0);
		setSecondX(255);
		setSecondY(255);
	};

	const handleOnOpenChange = (e: boolean) => {
		if (e) {
			setIsPreview(false);
			resetPointsPosition();
			onInitImgData();
		}
		setIsOpen(e);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
			<DialogTrigger>
				<div>
					<Button variant={'default'}>Гистограмма</Button>
				</div>
			</DialogTrigger>

			<DialogContent className="w-screen! max-w-none h-screen max-h-none flex flex-col items-normal">
				<DialogHeader>
					<DialogTitle>Гистограмма</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-auto">
					<div className="flex justify-center gap-6">
						<div className="flex justify-center pb-2">
							<canvas width={256} height={256} ref={canvasRef} />
						</div>
						<div className="flex flex-col w-[600px] gap-2 items-center">
							<div className="flex gap-2 w-full">
								<div className="flex-1">
									<Label>x1</Label>
									<Input
										value={firstX}
										onChange={(e) =>
											setFirstX(
												Math.min(
													255,
													secondX - 1,
													Math.max(0, Number(e.target.value))
												)
											)
										}
										inputMode="numeric"
										type="number"
										className="flex-1"
									/>
								</div>
								<div className="flex-1">
									<Label>y1</Label>
									<Input
										value={firstY}
										onChange={(e) =>
											setFirstY(
												Math.min(255, Math.max(0, Number(e.target.value)))
											)
										}
										inputMode="numeric"
										type="number"
										className="flex-1"
									/>
								</div>
							</div>
							<div className="flex gap-2 w-full">
								<div className="flex-1">
									<Label>x2</Label>
									<Input
										value={secondX}
										onChange={(e) =>
											setSecondX(
												Math.min(
													255,
													Math.max(0, firstX + 1, Number(e.target.value))
												)
											)
										}
										inputMode="numeric"
										type="number"
										className="flex-1"
									/>
								</div>
								<div className="flex-1">
									<Label>y2</Label>
									<Input
										value={secondY}
										onChange={(e) =>
											setSecondY(
												Math.min(255, Math.max(0, Number(e.target.value)))
											)
										}
										inputMode="numeric"
										type="number"
										className="flex-1"
									/>
								</div>
							</div>
							<div className="flex gap-2 w-full">
								<Button
									className="flex-1"
									onClick={() => {
										resetPointsPosition();
										setImgDataToPreview(imgData);
									}}>
									Сбросить
								</Button>
								<Button className="flex-1" onClick={applyCorrection}>
									Применить
								</Button>
							</div>
						</div>
					</div>
					<div>
						<div>
							<Label className="flex gap-2 items-center">
								<Input
									type="checkbox"
									checked={isPreview}
									className="w-4 h-4"
									onChange={(e) => setIsPreview(e.target.checked)}
								/>
								Показать изображение
							</Label>
						</div>
						{isPreview && (
							<canvas
								width={img.width}
								height={img.height}
								className="max-w-[1000px] max-h-[700px] mx-auto"
								ref={prewCanvasRef}
							/>
						)}
					</div>
				</div>
				<DialogFooter>
					<Button type="submit" onClick={applyFilter}>
						Подтвердить
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
