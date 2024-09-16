import cls from 'classnames';
import { useContext } from 'react';
import { CanvasContext } from '../context/CanvasContext/CanvasContext';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './tooltip';
import { useHotkeys } from '@/hooks/useHotkeys';
import { ShortCut } from './ShortCut';
import { Icon } from '@iconify/react/dist/iconify.js';
interface DrawerActionsProps {
	className?: string;
}

export const DrawerActions = ({ className }: DrawerActionsProps) => {
	const { isMoveable, isEyedropper, setCurrentTool } =
		useContext(CanvasContext);
	useHotkeys('m', 'ctrl', (e) => {
		e.preventDefault();
		setCurrentTool?.((prev) => (prev === 'movable' ? '' : 'movable'));
	});

	useHotkeys('e', 'ctrl', (e) => {
		e.preventDefault();
		setCurrentTool?.((prev) => (prev === 'eyedropper' ? '' : 'eyedropper'));
	});

	return (
		<div className={cls('flex gap-2', [className])}>
			<TooltipProvider>
				<Tooltip delayDuration={100}>
					<TooltipTrigger>
						<div
							className={cls(
								'p-[2px] border hover:border-black cursor-pointer',
								{
									'bg-black': isMoveable,
									'border-transparent': !isMoveable,
								}
							)}
							onClick={() => {
								setCurrentTool?.((prev) =>
									prev === 'movable' ? '' : 'movable'
								);
							}}>
							<Icon
								icon="pixelarticons:drag-and-drop"
								className={cls('w-5 h-5', {
									'text-white': isMoveable,
									'text-black': !isMoveable,
								})}
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<div>
							Перетаскивание <ShortCut className="inline">Ctrl+M</ShortCut>
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<TooltipProvider>
				<Tooltip delayDuration={100}>
					<TooltipTrigger>
						<div
							className={cls(
								'p-[2px] border hover:border-black cursor-pointer',
								{
									'bg-black': isEyedropper,
									'border-transparent': !isEyedropper,
								}
							)}
							onClick={() => {
								setCurrentTool?.((prev) =>
									prev === 'eyedropper' ? '' : 'eyedropper'
								);
							}}>
							<Icon
								icon="carbon:eyedropper"
								className={cls('w-5 h-5', {
									'text-white': isEyedropper,
									'text-black': !isEyedropper,
								})}
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<div>
							Пипетка <ShortCut className="inline">Ctrl+E</ShortCut>
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
};
