import { useContext, useEffect, useRef, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from './select';
import { Label } from './label';
import { ImageDataContext } from '../context/ImageDataContext/ImageDataContext';

enum Filters {
	IDENTICAL = 'identical',
	SHARPENING = 'sharpening',
	GAUSSIAN = 'gaussian',
	BLUR = 'blur',
}

const FILTER_OPTIONS: Record<Filters, { value: Filters; title: string }> = {
	[Filters.IDENTICAL]: {
		title: 'Тождественное отображение',
		value: Filters.IDENTICAL,
	},
	[Filters.SHARPENING]: {
		title: 'Повышение резкости',
		value: Filters.SHARPENING,
	},
	[Filters.GAUSSIAN]: {
		title: 'Фильтр Гаусса (3 на 3)',
		value: Filters.GAUSSIAN,
	},
	[Filters.BLUR]: {
		title: 'Прямоугольное размытие',
		value: Filters.BLUR,
	},
};

const getFilterKernel = (filter: Filters) => {
  // матрица с весами
	return {
		[Filters.IDENTICAL]: [0, 0, 0, 0, 1, 0, 0, 0, 0],
		[Filters.SHARPENING]: [0, 1, 0, 1, -5, 1, 0, 1, 0],
		[Filters.GAUSSIAN]: [1, 2, 1, 2, 4, 2, 1, 2, 1],
		[Filters.BLUR]: [1, 1, 1, 1, 1, 1, 1, 1, 1],
	}[filter];
};

const DEFAULT_IMAGE_DATA = new ImageData(1, 1);

export const DialogFilters = () => {
	const { img } = useContext(ImageDataContext);

	const [isOpen, setIsOpen] = useState(false);
	const [isPreview, setIsPreview] = useState(false);
	const [imageData, setImageData] = useState(DEFAULT_IMAGE_DATA);
	const [kernel, setKernel] = useState(getFilterKernel(Filters.IDENTICAL));
	const [selectFilter, setSelectFilter] = useState<Filters>(Filters.IDENTICAL);

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const setSelectFilterHandler = (filter: Filters) => {
		setSelectFilter(filter);
		setKernel(getFilterKernel(filter));
	};
  // Применение фильтров в рамках окна
	const onAccept = () => {
		const width = imageData.width;
		const height = imageData.height;
		const data = imageData.data;
		const output = new Uint8ClampedArray(data.length);

		const kernelSize = Math.sqrt(kernel.length); // 9
		const half = Math.floor(kernelSize / 2); // 1

		const getPixel = (x: number, y: number, i: number) => {
			// Handle edges by extending the border pixels
			x = Math.min(Math.max(x, 0), width - 1);
			y = Math.min(Math.max(y, 0), height - 1);
			return data[(y * width + x) * 4 + i];
		};

		// Рассчитываем сумму ядра для нормализации
		const kernelSum = kernel.reduce((a, b) => a + b, 0) || 1;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				for (let i = 0; i < 3; i++) {
					let sum = 0;
					// от -1 до 1
					for (let ky = -half; ky <= half; ky++) {
						// от -1 до 1
						for (let kx = -half; kx <= half; kx++) {
							const px = x + kx;
							const py = y + ky;
							const kIndex = (ky + half) * kernelSize + (kx + half);
							sum += getPixel(px, py, i) * kernel[kIndex];
						}
					}
					// Нормализация и обрезка значений
					sum = sum / kernelSum;
					sum = Math.min(Math.max(sum, 0), 255);
					output[(y * width + x) * 4 + i] = sum;
				}
				output[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]; // Alpha channel
			}
		}

		setImageData(new ImageData(output, width, height));
	};
  // отрисопка предпросмотра
	useEffect(() => {
		const ctx = canvasRef.current?.getContext('2d');
		if (isPreview && ctx) {
			ctx.putImageData(imageData, 0, 0);
		}
	}, [isPreview, imageData]);

  // инициализации ничальной ImageData
	const onInitImageData = () => {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.drawImage(img, 0, 0);
		const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		setImageData(data);
	};
  // Обработчик отображения / скрытия предпросмотра
	const openHandler = (e: boolean) => {
		if (e) {
			setIsPreview(false);
			onInitImageData();
		}

		setIsOpen(e);
	};
  // применить к основному изображению
	const onAcceptToMain = () => {
		if (!imageData) return;

		const canvas = document.createElement('canvas');
		canvas.width = imageData.width;
		canvas.height = imageData.height;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

		ctx.putImageData(imageData, 0, 0);
		canvas.toBlob(function (blob) {
			if (!blob) {
				setIsOpen(false);
				return;
			}

			img.src = URL.createObjectURL(blob);
			setIsOpen(false);
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={openHandler}>
			<DialogTrigger>
				<Button>Фильтры</Button>
			</DialogTrigger>

			<DialogContent className="w-screen! max-w-none h-screen max-h-none flex flex-col items-normal">
				<DialogHeader>
					<DialogTitle>Фильтры</DialogTitle>
				</DialogHeader>
				<div className="overflow-auto">
					<div className="pb-2 grid grid-cols-3 gap-2">
						<Select value={selectFilter} onValueChange={setSelectFilterHandler}>
							<SelectTrigger className="col-span-3">
								<SelectValue placeholder="Select a fruit" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Выберите фильтр:</SelectLabel>
									{Object.values(FILTER_OPTIONS).map(({ value, title }) => (
										<SelectItem key={value} value={value}>
											{title}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="grid grid-cols-3 grid-rows-3 gap-2 pb-2">
						{kernel.map((value, index) => (
							<div key={index + 1}>
								<Label>X{index}</Label>
								<Input
									value={value}
									type="number"
									onChange={(e) =>
										setKernel((prev) => {
											prev[index] = Number(e.target.value);
											return [...prev];
										})
									}
								/>
							</div>
						))}
					</div>
					<div className="mb-2">
						<Button className='w-full' onClick={onAccept}>Применить</Button>
					</div>
					<div>
						<Label className="flex gap-2  pb-2 items-center">
							<Input
								type="checkbox"
								checked={isPreview}
								onChange={(e) => setIsPreview(e.target.checked)}
								className="w-4 h-4"
							/>
							Показать изображение
						</Label>
					</div>
					{isPreview && (
						<canvas
							className="max-w-[1000px] max-h-[700px] mx-auto"
							width={img.width}
							height={img.height}
							ref={canvasRef}
						/>
					)}
				</div>
				<DialogFooter className="mt-auto">
					<Button onClick={onInitImageData}>Сбросить</Button>
					<Button type="submit" onClick={onAcceptToMain}>
						Подтвердить
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
