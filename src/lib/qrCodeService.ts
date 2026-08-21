'use client';

import QRCode from 'qrcode';

export interface SmartUrlParams {
  type: 'event' | 'programme' | 'result' | 'leaderboard';
  programmeSlug?: string;
  categorySlug?: string;
  filters?: Record<string, string>;
}

export function getBaseUrl(): string {
  // 1. Use the explicitly configured production URL if available (set by Vercel env var)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // 2. In the browser, use the current origin (works correctly after deployment)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // 3. Server-side fallback
  return 'https://meelad-gold.vercel.app';
}

export function buildSmartPublicUrl({ type, programmeSlug, categorySlug, filters }: SmartUrlParams): string {
  const origin = getBaseUrl();
  let path = '/';

  if (type === 'event') {
    path = '/';
  } else if (type === 'programme') {
    path = programmeSlug ? `/programs` : '/programs';
  } else if (type === 'result') {
    if (programmeSlug && categorySlug) {
      path = `/results/${programmeSlug}/${categorySlug}`;
    } else {
      path = '/results';
    }
  } else if (type === 'leaderboard') {
    path = '/leaderboard';
  }

  const url = new URL(path, origin);

  if (type === 'programme' && programmeSlug) {
    url.searchParams.set('programme', programmeSlug);
  }

  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== 'All' && v !== 'all') {
        url.searchParams.set(k, v);
      }
    });
  }

  return url.toString();
}

export async function generateQRCodeDataURL(url: string, width = 400): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width,
      margin: 2,
      color: {
        dark: '#064e3b', // Emerald-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR Code Data URL:', err);
    throw err;
  }
}

export async function generateBrandedQRCodeCanvas(
  url: string,
  title: string,
  subtitle = 'Scan to view on Milad Fest 2K26 Portal'
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const canvasWidth = 600;
  const canvasHeight = 750;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Background Gradient (Islamic Emerald)
  const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  bgGrad.addColorStop(0, '#022c22'); // Emerald 950
  bgGrad.addColorStop(0.5, '#064e3b'); // Emerald 900
  bgGrad.addColorStop(1, '#022c22');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Decorative Border & Corners
  ctx.strokeStyle = '#f59e0b'; // Amber Gold
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, canvasWidth - 56, canvasHeight - 56);

  // Header Title & Branding
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef3c7'; // Amber 100
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('MILAD FEST 2K26', canvasWidth / 2, 80);

  ctx.fillStyle = '#fbbf24'; // Amber 400
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(title.toUpperCase(), canvasWidth / 2, 125);

  ctx.fillStyle = '#6ee7b7'; // Emerald 300
  ctx.font = '14px sans-serif';
  ctx.fillText(subtitle, canvasWidth / 2, 155);

  // Generate Raw QR Data URL
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 380,
    margin: 2,
    color: {
      dark: '#064e3b',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });

  // Load and Draw QR Image on Canvas Card
  const qrImage = new Image();
  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });

  const qrX = (canvasWidth - 380) / 2;
  const qrY = 190;

  // White Card Background behind QR
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qrX - 15, qrY - 15, 410, 410, 24);
  ctx.fill();

  ctx.drawImage(qrImage, qrX, qrY, 380, 380);

  // Footer Instructions
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('OFFICIAL COMPETITION PUBLICATION', canvasWidth / 2, 640);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px sans-serif';
  ctx.fillText(url, canvasWidth / 2, 675);

  return canvas;
}

export async function downloadQRCodePNG(
  url: string,
  filename: string,
  title: string,
  subtitle?: string
): Promise<void> {
  const canvas = await generateBrandedQRCodeCanvas(url, title, subtitle);
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function shareNativeUrl(data: { title: string; text: string; url: string }): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share error:', err);
      }
    }
  }
  return copyTextToClipboard(data.url);
}

export async function downloadElementAsPNG(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }
  
  try {
    const bbox = element.getBoundingClientRect();
    const width = bbox.width || 800;
    const height = bbox.height || 1000;

    const clone = element.cloneNode(true) as HTMLElement;
    const wrapper = document.createElement('div');
    wrapper.appendChild(clone);
    
    // Copy stylesheets
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('');

    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${styles}
          ${wrapper.innerHTML}
        </div>
      </foreignObject>
    </svg>`;

    const img = new Image();
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width * 2;
          canvas.height = height * 2;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `${filename}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve();
          } else {
            URL.revokeObjectURL(url);
            window.print();
            resolve();
          }
        } catch (e) {
          URL.revokeObjectURL(url);
          window.print();
          resolve();
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        window.print();
        resolve();
      };
      img.src = url;
    });
  } catch (err) {
    window.print();
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('Clipboard write failure:', e);
    }
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch {
    document.body.removeChild(textArea);
    return false;
  }
}

