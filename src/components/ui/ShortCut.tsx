import cls from 'classnames'
import { ReactNode } from 'react'

interface ShortCutProps {
  className?: string
  children: ReactNode
}

export const ShortCut = ({ className, children }: ShortCutProps) => {
  return (
    <div className={cls('ml-auto text-xs tracking-widest text-muted-foreground', [className])}>
      {children}
    </div>
  )
}