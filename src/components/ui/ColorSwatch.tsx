import cls from 'classnames'
import { CSSProperties, MouseEvent, useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import { rgbToHsl, rgbToLab, rgbToXyz } from '@/lib/colorConversions'
import { invert } from '@/lib/filters'

interface ColorSwatchProps {
  className?: string
  rgb: Array<number>
  selected?: boolean
  x: number,
  y: number,
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export const ColorSwatch = ({ className, rgb, x, y, selected, onClick}: ColorSwatchProps) => {
  // создаем стили для цвета с инверсией
  const styles = useMemo<CSSProperties>(() => {
    const [r, g, b] = invert(rgb[0], rgb[1], rgb[2], rgb[3])
    const style = {
      backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${rgb[3]})`,
      '--invert-color': `rgb(${r}, ${g}, ${b})`,
    } as CSSProperties
    return style
  }, [rgb])

  // HSL
  const HSL = useMemo(() => {
    const {h, s, l} = rgbToHsl(rgb)
    return [h, s, l]
  }, [rgb])
  // XYZ
  const XYZ = useMemo(() => {
    const {x, y, z} = rgbToXyz(rgb)
    return [x, y, z]
  }, [rgb])
  // LAB
  const LAB = useMemo(() => {
    const {l, a, b} = rgbToLab(rgb)
    return [l, a, b]
  }, [rgb])



  return (
    <div onClick={(e) => onClick?.(e)}>
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger>
            <div className={cls('size-6 border-2 border-[var(--invert-color)]', {
              'relative after:content-[""] after:absolute after:w-[calc(100%_+_10px)] after:h-[calc(100%_+_10px)] after:p-1 after:border after:border-black   after:top-1/2 after:left-1/2 after:translate-x-[-50%] after:translate-y-[-50%]': !!selected
            }, [className])} style={styles}/>
          </TooltipTrigger>
          <TooltipContent >
            <div>
              <div>
                x: <b>{x}</b>; y: <b>{y}</b>;
              </div>
              <div>
                RGB:<b>{rgb[0]}, {rgb[1]}, {rgb[2]}</b> A:<b>{rgb[3]}</b>
              </div>
              <div>
                HSL:<b>{HSL[0]}, {HSL[1]}%, {HSL[2]}%</b> A:<b>{rgb[3]}</b>
              </div>
              <div>
                XYZ:<b>{XYZ[0]}, {XYZ[1]}, {XYZ[2]}</b> A:<b>{rgb[3]}</b>
              </div>
              <div>
                LAB:<b>{LAB[0]}, {LAB[1]}, {LAB[2]}</b> A:<b>{rgb[3]}</b>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}