export interface WorkerResponse {
  type: 'finally' | 'loading',
  percentages: number,
  data: Uint8ClampedArray,
  newWidth: number,
  newHeight: number,
}

export interface WorkerRequest {
  newWidth: number,
  newHeight: number,
  oldWidth: number,
  oldHeight: number,
  ImageData: Uint8ClampedArray,
}

const stepwiseWorker = () => {
  onmessage = (e: MessageEvent<WorkerRequest>) => {
    const {newHeight, newWidth, ImageData, oldHeight, oldWidth} = e.data
    const newImageDataArray = new Uint8ClampedArray(newWidth * newHeight * 4);
    const scaleX = oldWidth / newWidth;
    const scaleY = oldHeight / newHeight;

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);

        const dstIndex = (y * newWidth + x) * 4;
        const srcIndex = (srcY * oldWidth + srcX) * 4;

        newImageDataArray[dstIndex] = ImageData[srcIndex];
        newImageDataArray[dstIndex+ 1] = ImageData[srcIndex + 1];
        newImageDataArray[dstIndex+ 2] = ImageData[srcIndex + 2];
        newImageDataArray[dstIndex+ 3] = ImageData[srcIndex + 3];

        if (x === newWidth - 1 && y % 100 === 0) {
          postMessage({
            type: 'loading',
            percentages: Math.ceil((y * x) / (newHeight * newWidth) * 100),
            data: newImageDataArray
          } as WorkerResponse)
        }
      }
    }

    postMessage({
      type: 'finally',
      percentages: 100,
      data: newImageDataArray,
      newHeight,
      newWidth,
    } as WorkerResponse)
  }
}

let code = stepwiseWorker.toString()
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"))
const blob = new Blob([code], { type: 'application/javascriptssky' })
const stepwiseScript = URL.createObjectURL(blob)
export { stepwiseScript }