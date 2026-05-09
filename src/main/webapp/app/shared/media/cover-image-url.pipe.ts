import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'coverImageUrl', standalone: true })
export class CoverImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
      return trimmed;
    }

    if (trimmed.startsWith('uploads/')) {
      return `/${trimmed}`;
    }

    return `/uploads/${encodeURIComponent(trimmed)}`;
  }
}

export default CoverImageUrlPipe;
