export function rgbToHsl(rgb: number[]): {h: number, s: number, l: number} {
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s, l = (max + min) / 2

  if (max == min) {
    s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  h = Math.ceil(h * 360)
  s = Math.ceil(s * 100)
  l = Math.ceil(l * 100)

  return { h, s, l }
}

export function rgbToXyz(rgb: number[]) {
  let r = rgb[0] / 255
  let g = rgb[1] / 255
  let b = rgb[2] / 255

  if (r > 0.04045) {
    r = Math.pow(((r + 0.055) / 1.055), 2.4)
  } else {
    r = r / 12.92
  }

  if (g > 0.04045) {
    g = Math.pow(((g + 0.055) / 1.055), 2.4)
  } else {
    g = g / 12.92
  }

  if (b > 0.04045) {
    b = Math.pow(((b + 0.055) / 1.055), 2.4)
  } else {
    b = b / 12.92
  }

  r *= 100
  g *= 100
  b *= 100

  // Observer = 2°, Illuminant = D65
  const x = Math.ceil(r * 0.4124 + g * 0.3576 + b * 0.1805)
  const y = Math.ceil(r * 0.2126 + g * 0.7152 + b * 0.0722)
  const z = Math.ceil(r * 0.0193 + g * 0.1192 + b * 0.9505)

  return { x, y, z}
}

export function rgbToLab(rgb: number[]){
  let r = rgb[0] / 255
  let g = rgb[1] / 255
  let b = rgb[2] / 255


  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return {
    l: ((116 * y) - 16).toFixed(2),
    a: (500 * (x - y)).toFixed(2),
    b: (200 * (y - z)).toFixed(2),
  }
}

export function contrast(rgb1: number[], rgb2: number[]) {
  const [r1, g1, b1] = rgb1
  const [r2, g2, b2] = rgb2
  const [sR1, sG1, sB1] = [r1 / 255, g1 / 255, b1 / 255]
  const [sR2, sG2, sB2] = [r2 / 255, g2 / 255, b2 / 255]

  const lR1 = sR1 <= 0.03928 ? sR1 / 12.92 : Math.pow(((sR1+0.055)/1.055), 2.4)
  const lG1 = sG1 <= 0.03928 ? sG1 / 12.92 : Math.pow(((sG1+0.055)/1.055), 2.4)
  const lB1 = sB1 <= 0.03928 ? sB1 / 12.92 : Math.pow(((sB1+0.055)/1.055), 2.4)

  const lR2 = sR2 <= 0.03928 ? sR2 / 12.92 : Math.pow(((sR2+0.055)/1.055), 2.4)
  const lG2 = sG2 <= 0.03928 ? sG2 / 12.92 : Math.pow(((sG2+0.055)/1.055), 2.4)
  const lB2 = sB2 <= 0.03928 ? sB2 / 12.92 : Math.pow(((sB2+0.055)/1.055), 2.4)

  const L1 = 0.2126 * lR1 + 0.7152 * lG1 + 0.0722 * lB1
  const L2 = 0.2126 * lR2 + 0.7152 * lG2 + 0.0722 * lB2

  const [L1Max, L2Min] = [Math.max(L1, L2), Math.min(L1, L2)]

  const L2ValueByOne = 1 / (L2Min + 0.05)
  const L1Value = (L2ValueByOne * (L1Max + 0.05)).toFixed(1)
  const L2Value = (L2ValueByOne * (L2Min + 0.05)).toFixed(1)
  return {L1: L1Value, L2: L2Value}
}