export type FilterFunction = (r: number, g: number, b: number, a: number) => [number, number, number, number];

export const invert: FilterFunction = (r: number, g: number, b: number, a: number) => {
  return [255 - r, 255 - g, 255 - b, a]
}

export const blackAndWhite: FilterFunction = (r: number, g: number, b: number, a: number) => {
  const avg = 0.3 * r + 0.59 * g + 0.11 * b;
  return [avg, avg, avg, a]
}

export const downloadImage = (img: HTMLImageElement) => {
  const link = document.createElement("a");
  link.href = img.src;
  link.download = `${Date.now()}.jpg`;
  link.click();

}

export const acceptFiler = (canvas: HTMLCanvasElement, fn: FilterFunction) => {
  const context = canvas.getContext('2d')
  const { width, height } = canvas
  if (context) {
    const imageData = context.getImageData(0, 0, width, height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]] = fn(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3])
    }

    context.putImageData(imageData, 0, 0);
  }
}