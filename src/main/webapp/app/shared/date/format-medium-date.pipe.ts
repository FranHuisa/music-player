import { Pipe, PipeTransform } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs/esm';

@Pipe({ name: 'formatMediumDate', standalone: true })
export class FormatMediumDatePipe implements PipeTransform {
  transform(value: Dayjs | string | null | undefined): string {
    if (!value) return '';
    const d = typeof value === 'string' ? dayjs(value) : value;
    return d.isValid() ? d.format('D MMM YYYY') : '';
  }
}

export default FormatMediumDatePipe;
