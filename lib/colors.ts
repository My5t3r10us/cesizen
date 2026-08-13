export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => {
    const adjusted = value + (value * percent / 100);
    return Math.max(0, Math.min(255, adjusted));
  };

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

export function generateShades(baseColor: string, count: number = 5): string[] {
  const shades: string[] = [];
  const step = 40 / (count - 1);

  for (let i = 0; i < count; i++) {
    const brightness = 20 - (step * i);
    shades.push(adjustBrightness(baseColor, brightness));
  }

  return shades;
}

export function generateTints(baseColor: string, count: number = 5): string[] {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];

  const tints: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const factor = i / (count - 1);
    const r = rgb.r + (255 - rgb.r) * factor * 0.5;
    const g = rgb.g + (255 - rgb.g) * factor * 0.5;
    const b = rgb.b + (255 - rgb.b) * factor * 0.5;
    tints.push(rgbToHex(r, g, b));
  }

  return tints;
}

export function generateColorVariations(baseColor: string): string[] {
  const variations: string[] = [];
  
  variations.push(adjustBrightness(baseColor, -30));
  variations.push(adjustBrightness(baseColor, -15));
  variations.push(baseColor);
  variations.push(adjustBrightness(baseColor, 15));
  variations.push(adjustBrightness(baseColor, 30));

  return variations;
}

export function generateSaturatedVariations(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];

  const variations: string[] = [];
  
  const toHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h, s, l };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const hsl = toHsl(rgb.r, rgb.g, rgb.b);
  
  const saturations = [
    Math.max(0, hsl.s - 0.3),
    Math.max(0, hsl.s - 0.15),
    hsl.s,
    Math.min(1, hsl.s + 0.15),
    Math.min(1, hsl.s + 0.3),
  ];

  saturations.forEach(sat => {
    const rgb = hslToRgb(hsl.h, sat, hsl.l);
    variations.push(rgbToHex(rgb.r, rgb.g, rgb.b));
  });

  return variations;
}
