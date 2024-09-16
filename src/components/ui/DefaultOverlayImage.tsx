import cls from 'classnames'
import { useCallback, useContext, useEffect, useState } from 'react'
import { ImageDataContext } from '../context/ImageDataContext/ImageDataContext'
import { CanvasContext } from '../context/CanvasContext/CanvasContext'

interface DefaultOverlayImageProps {
  offsetWidth: number,
  isFixed: boolean
}

export const DefaultOverlayImage = ({ offsetWidth, isFixed }: DefaultOverlayImageProps) => {
  const { img, x } = useContext(ImageDataContext)
  const { isVisibleDefaultCanvas } = useContext(CanvasContext)
  const [ widthOverlay, setWidthOverlay ] = useState(0)


  const updateWidthOverlay = useCallback(() => {
    if (!isFixed) {
      setWidthOverlay((x || 1) / img.width * 100)
    }
  }, [img.width, isFixed, x])

  useEffect(() => {
    updateWidthOverlay()
  }, [updateWidthOverlay])


  return (
    <div className={cls('max-w-full w-0 h-full pointer-events-none absolute top-0 left-0 overflow-hidden', {
      'z-10': isVisibleDefaultCanvas
    })} style={{
      width: widthOverlay + '%'
    }}>
      <div className='h-full' style={{
        width: offsetWidth + 'px'
      }}>
        <img src={img.src} width={img.width} height={img.height} className='max-w-full h-full object-cover select-none'/>
      </div>
    </div>
  )
}