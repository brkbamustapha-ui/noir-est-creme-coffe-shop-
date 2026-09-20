/**
 * Prepares a photo chosen on a phone for upload: a 4 MB camera shot becomes a
 * ~150 KB WebP, so the upload works on a café's connection and the menu stays
 * light for customers.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    // browsers apply EXIF orientation when decoding an <img>, so portrait
    // photos from a phone don't come out sideways
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // revoked after decode: the bitmap is already in memory
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImage(file: File): Promise<File> {
  const img = await loadImage(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // WebP where available, JPEG on older Safari
  const blob = (await toBlob(canvas, "image/webp", QUALITY)) ?? (await toBlob(canvas, "image/jpeg", 0.85));
  if (!blob) return file;

  const type = blob.type === "image/webp" ? "image/webp" : "image/jpeg";
  const name = `photo.${type === "image/webp" ? "webp" : "jpg"}`;
  return new File([blob], name, { type });
}
