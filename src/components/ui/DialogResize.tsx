import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './button';
import { ImageDataContext } from '../context/ImageDataContext/ImageDataContext';
import { Label } from './label';
import { Input } from './input';
import { stepwiseScript, WorkerRequest, WorkerResponse } from '@/lib/workers/stepwiseWorker';
import { Progress } from './progress';
import { Toggle } from './toggle';

type TypeResize = 'pixels' | 'percentages';

interface IFormValue {
	width: string;
	height: string;
}

const canvas = document.createElement('canvas');

export const DialogResize = () => {
	const { img } = useContext(ImageDataContext);
	const [isLock, setIsLock] = useState(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(false);
	const [percentages, setPercentages] = useState(0);
	const [type, setType] = useState<TypeResize>('pixels');
	const [formValue, setFormValue] = useState<Record<TypeResize, IFormValue>>({
		pixels: {
			height: img.height.toString(),
			width: img.width.toString(),
		},
		percentages: {
			height: '100',
			width: '100',
		},
	});

	const stepwiseWorker: Worker = useMemo(() => new Worker(stepwiseScript), []);
  // обнолвение размера канваса и его очитска
	const updateCanvas = (
		width: number = canvas.width,
		height: number = canvas.height
	) => {
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
	};
  // получить старое значение и новое 
	const getSizes = () => {
		return {
			oldWidth: img.width,
			oldHeight: img.height,
			newWidth:
				type === 'pixels'
					? +formValue.pixels.width
					: Math.floor(
							(img.width * parseInt(formValue.percentages.width)) / 100
          ),
			newHeight:
				type === 'pixels'
					? +formValue.pixels.height
					: Math.floor(
							(img.height * parseInt(formValue.percentages.height)) / 100
          ),
		};
	};
  // обновить изображение основное 
	const updateImg = useCallback(
		async (ImageData: ImageData) => {
			const context = canvas.getContext('2d');

			if (!context) {
				return;
			}

			const ImageBitmap = await createImageBitmap(ImageData);
			context.drawImage(ImageBitmap, 0, 0);

			canvas.toBlob(function (blob) {
				if (!blob) {
					return;
				}

				img.src = URL.createObjectURL(blob);
			});
		},
		[img]
	);
  // подключение воркеров
	useEffect(() => {
		if (window.Worker) {
			const onMessage = async (e: MessageEvent<WorkerResponse>) => {
				const { data } = e;

				if (data.type === 'loading') {
					setPercentages(data.percentages);
				}

				if (data.type === 'finally') {
					const imageData = new ImageData(
						data.data,
						data.newWidth,
						data.newHeight
					);

					updateCanvas(data.newWidth, data.newHeight);

					await updateImg(imageData);
					setIsLoading(false);
					setIsOpen(false);
				}
			};

			stepwiseWorker.onmessage = onMessage;
		}
	}, [stepwiseWorker, updateImg]);
  // сборос значений полей ввода при изменении изображения или отрытии 
	useEffect(() => {
		setFormValue({
			pixels: {
				height: img.height.toString(),
				width: img.width.toString(),
			},
			percentages: {
				height: '100',
				width: '100',
			},
		});
	}, [img.height, img.width, isOpen]);
  // обработчик открытия 
	const handleOnOpenChange = (e: boolean) => {
		setIsOpen(e);
	};
  // примененеие 
	const onSubmit = () => {
		setIsLoading(true);
		const sizeData = getSizes();

		updateCanvas(sizeData.oldWidth, sizeData.oldHeight);
		const context = canvas.getContext('2d');

		if (!context) {
			return;
		}
		context.drawImage(img, 0, 0);

		const imageData = context.getImageData(
			0,
			0,
			canvas.width,
			canvas.height
		).data;

		const workerData = {
			ImageData: imageData,
			...sizeData,
		} as WorkerRequest;

		stepwiseWorker.postMessage(workerData);
	};
  // новое значение пикселей 
	const newCountPx = useMemo(() => {
		if (type === 'pixels') {
			return Math.ceil(
				parseInt(formValue.pixels.width) * parseInt(formValue.pixels.height) * 4
			);
		}

		return (
			img.width *
			Math.ceil(parseInt(formValue.percentages.width) / 100) *
			img.height *
			Math.ceil(parseInt(formValue.percentages.height) / 100) *
			4
		);
	}, [
		formValue.percentages.height,
		formValue.percentages.width,
		formValue.pixels.height,
		formValue.pixels.width,
		img.height,
		img.width,
		type,
	]);

	return (
		<Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
			<DialogTrigger>
				<Button>Изменить размер</Button>
			</DialogTrigger>

			<DialogContent className="w-screen! max-w-none h-screen max-h-none flex flex-col items-normal">
				<DialogHeader>
					<DialogTitle>Изменение размеров изображения</DialogTitle>
					<DialogDescription>
						Изначальное кол-во пикселей: <b>{img.width * img.height * 4}px</b>
					</DialogDescription>
					<DialogDescription>
						Новое кол-во пикселей: <b>{newCountPx}px</b>
					</DialogDescription>
				</DialogHeader>
				<div className="mb-auto">
					<div className="grid gap-4 py-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="wight" className="text-left">
								Тип:
							</Label>
							<Toggle
								pressed={type === 'pixels'}
								onPressedChange={() => setType('pixels')}>
								Пикселеи
							</Toggle>
							<Toggle
								pressed={type === 'percentages'}
								onPressedChange={() => setType('percentages')}>
								Проценты
							</Toggle>
							<Toggle
								pressed={isLock}
								onPressedChange={setIsLock}>
								<div>
									Сохранить соотношение
								</div>
							</Toggle>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="wight" className="text-left">
								Ширина({type === 'pixels' ? 'px' : '%'}):
							</Label>
							<Input
								id="wight"
								value={formValue[type].width}
								onChange={(e) => {
									setFormValue((prev) => {
										const newValue = { ...prev };
										formValue[type].width = e.target.value;
										if (isLock) {
											if (type === 'percentages') {
												formValue[type].height = formValue[type].width;
											} else {
												const scale = img.width / img.height;
												formValue[type].height = Math.floor(
													parseInt(formValue[type].width) / scale || 0
												).toString();
											}
										}
										return newValue;
									});
								}}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor="height" className="text-left">
								Высота({type === 'pixels' ? 'px' : '%'}):
							</Label>
							<Input
								id="height"
								value={formValue[type].height}
								onChange={(e) => {
									setFormValue((prev) => {
										const newValue = { ...prev };
										formValue[type].height = e.target.value;
										if (isLock) {
											if (type === 'percentages') {
												formValue[type].width = formValue[type].height;
											} else {
												const scale = img.height / img.width;
												formValue[type].width = Math.floor(
													parseInt(formValue[type].height) / scale
												).toString();
											}
										}
										return newValue;
									});
								}}
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					{isLoading && <Progress value={percentages} />}

					{!isLoading && (
						<Button onClick={onSubmit} type="submit">
							Подтвердить
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
