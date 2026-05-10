import { Pipe, PipeTransform } from '@angular/core';

const VALID_IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i;

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" fill="#1f2937"/>' +
      '<path d="M20 22h24v20H20z" fill="none" stroke="#94a3b8" stroke-width="2"/>' +
      '<circle cx="27" cy="29" r="2.5" fill="#94a3b8"/>' +
      '<path d="M22 40l8-8 6 6 4-4 6 6" fill="none" stroke="#94a3b8" stroke-width="2"/>' +
      '</svg>',
  );

@Pipe({ name: 'coverImageUrl', standalone: true })
export class CoverImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return PLACEHOLDER;
    const trimmed = value.trim();
    if (!trimmed) return PLACEHOLDER;

    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
      return trimmed;
    }

    if (trimmed.startsWith('/') || trimmed.startsWith('uploads/')) {
      if (!VALID_IMAGE_EXT.test(trimmed)) return PLACEHOLDER;
      return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    }

    if (!VALID_IMAGE_EXT.test(trimmed)) return PLACEHOLDER;

    return `/uploads/${encodeURIComponent(trimmed)}`;
  }
}

export default CoverImageUrlPipe;
