import { contrast } from '@/lib/colorConversions';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
	EyedropperContext,
	EyedropperItemSchema,
} from '../context/EyedropperContext/EyedropperContext';
import { ShortCut } from './ShortCut';
import { ColorSwatch } from './ColorSwatch';
import { CanvasContext } from '../context/CanvasContext/CanvasContext';
import { ResetIcon } from './ResetIcon';

interface SelectedColorSchema {
	first: EyedropperItemSchema | null;
	second?: EyedropperItemSchema | null;
}

export const EyedropperMenu = () => {
	const { setCurrentTool } = useContext(CanvasContext);
	const { firstHistory, secondHistory, resetFirstHistory, resetSecondHistory } =
		useContext(EyedropperContext);
	const [selectedColor, setSelectColor] = useState<SelectedColorSchema>({
		first: null,
		second: null,
	});

	const contrastData = useMemo(() => {
		const { first, second } = selectedColor;
		if (!first || !second) {
			return;
		}

		return contrast(first.rbga, second.rbga);
	}, [selectedColor]);

	useEffect(() => {
		if (firstHistory?.length === 1 && !selectedColor.first) {
			setSelectColor((prev) => ({
				...prev,
				first: firstHistory[0],
			}));
		}

		if (!firstHistory?.length) {
			setSelectColor((prev) => ({
				...prev,
				first: null,
			}));
		}
	}, [firstHistory, resetFirstHistory, selectedColor.first]);

	useEffect(() => {
		if (secondHistory?.length === 1 && !selectedColor.second) {
			setSelectColor((prev) => ({
				...prev,
				second: secondHistory[0],
			}));
		}

		if (!secondHistory?.length) {
			setSelectColor((prev) => ({
				...prev,
				second: null,
			}));
		}
	}, [secondHistory, selectedColor.second]);

	return (
		<div className="w-[400px] py-2 px-4 overflow-x-scroll space-y-4 fixed top-0 right-0 bottom-0 bg-white border-l border-l-black">
			<div className="space-y-2">
				<div className="flex justify-between">
					<div>
						<div className="flex justify-between items-center">
							<div>
								1 набор цветов <ShortCut className="inline">ЛКМ</ShortCut>
							</div>
							<div
								className="ml-2 cursor-pointer"
								onClick={() => resetFirstHistory?.()}>
								<ResetIcon width={20} height={20} />
							</div>
						</div>
					</div>
					<div>
						<div
							className="-m-2 p-2 cursor-pointer"
							onClick={() => setCurrentTool?.('')}>
							X
						</div>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					{firstHistory?.map((item) => (
						<ColorSwatch
							selected={item.id === selectedColor.first?.id}
							rgb={item.rbga}
							x={item.x}
							y={item.y}
							key={item.id}
							onClick={() => {
								setSelectColor((prev) => ({
									...prev,
									first: item,
								}));
							}}
						/>
					))}
				</div>
			</div>
			<div className="space-y-2">
				<div className="flex items-center">
					<div>
						2 набор цветов <ShortCut className="inline">Shift+ЛКМ</ShortCut>
					</div>
					<div
						className="ml-2 cursor-pointer"
						onClick={() => resetSecondHistory?.()}>
						<ResetIcon width={20} height={20} />
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					{secondHistory?.map((item) => (
						<ColorSwatch
							selected={item.id === selectedColor.second?.id}
							rgb={item.rbga}
							x={item.x}
							y={item.y}
							key={item.id}
							onClick={() => {
								setSelectColor((prev) => ({
									...prev,
									second: item,
								}));
							}}
						/>
					))}
				</div>
			</div>
			{selectedColor?.first && contrastData?.L1 && (
				<div>
					Первый цвет:
					<div>RGBA: {`rgba(${selectedColor.first.rbga.join(', ')})`}</div>
					<div>Контрастность: {contrastData.L1}</div>
				</div>
			)}
      {selectedColor?.second && contrastData?.L2 && (
				<div>
					Второй цвет:
					<div>RGBA: {`rgba(${selectedColor.second.rbga.join(', ')})`}</div>
					<div>Контрастность: {contrastData.L2}</div>
				</div>
			)}
			{contrastData ? (
				<div
					className={`${
						parseFloat(contrastData.L1) >= 4.5 ? '' : 'text-red-400'
					}`}>
					Контрастность 1 цвета ко 2 цвету:{' '}
					<b>
						{contrastData.L1}:{contrastData.L2}
					</b>
				</div>
			) : (
				<div>Выберите два цвета для проверки контрастности</div>
			)}
		</div>
	);
};
