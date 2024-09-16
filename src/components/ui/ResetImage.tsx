import { useContext } from 'react'
import { ImageDataContext } from '../context/ImageDataContext/ImageDataContext'
import { FileContext } from '../context/FileContext/FileContext'
import { Button } from './button'

export const ResetImage = () => {
  const { img } = useContext(ImageDataContext)
  const { setFile } = useContext(FileContext)
  const { fileUrl } = useContext(FileContext)
  
  const onReset = () => {
    img.src = fileUrl || '';
    setFile?.(undefined);
  }
  return (
    <Button className='cursor-pointer' onClick={onReset}>
      Отмена
    </Button>
  )
}