import './App.css'
import { CanvasContextProvider } from './components/context/CanvasContext/CanvasContextProvider'
import { EyedropperContextProvider } from './components/context/EyedropperContext/EyedropperContextProvider'
import { FileContextProvider } from './components/context/FileContext/FileContextProvider'
import { ImageDataContextProvider } from './components/context/ImageDataContext/ImageDataContextProvider'
import { Main } from './components/ui/Main'

function App() {
  return (

      <CanvasContextProvider>
        <FileContextProvider>
          <ImageDataContextProvider>
            <EyedropperContextProvider>
                <div className='h-screen'>
                  <Main />
                </div>
            </EyedropperContextProvider>
          </ImageDataContextProvider>
        </FileContextProvider>
      </CanvasContextProvider>
  )
}

export default App
