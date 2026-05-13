import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import dayjs from 'dayjs/esm';
import { DatePipe } from '@angular/common';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IAlbum } from '../album.model';
import { AlbumService } from '../service/album.service';

@Component({
  selector: 'jhi-album-coming',
  templateUrl: './album-coming.html',
  styleUrls: ['./album-coming.scss'],
  imports: [FontAwesomeModule, FormsModule, NgbInputDatepicker, Alert, AlertError, FormatMediumDatePipe, DatePipe],
})
export class AlbumUpcoming implements OnInit {
  private readonly router = inject(Router);
  private readonly albumService = inject(AlbumService);

  readonly myAlbums = signal<IAlbum[]>([]);
  readonly isLoading = signal(false);
  selectedTime: string = '00:00';

  readonly editingAlbumId = signal<number | null>(null);
  readonly selectedDate = signal<NgbDateStruct | null>(null);
  selectedDateModel: any = null;

  readonly searchTerm = signal('');

  ngOnInit(): void {
    this.loadUpcomingAlbums();
  }

  readonly upcomingAlbums = computed(() => this.myAlbums().filter(a => a.releaseDate !== null && a.releaseDate !== undefined));

  readonly availableAlbums = computed(() => this.myAlbums().filter(a => !a.releaseDate));

  previousState(): void {
    this.router.navigate(['/album']);
  }

  startEditing(album: IAlbum): void {
    this.editingAlbumId.set(album.id ?? null);

    if (album.releaseDate) {
      const d = dayjs(album.releaseDate);
      const struct = {
        year: d.year(),
        month: d.month() + 1,
        day: d.date(),
      };

      this.selectedDate.set(struct);
      this.selectedDateModel = struct;
    } else {
      this.selectedDate.set(null);
      this.selectedDateModel = null;
    }
  }

  cancelEditing(): void {
    this.editingAlbumId.set(null);
    this.selectedDate.set(null);
    this.selectedDateModel = null;
    this.selectedTime = '00:00';
  }
  onDateChange(date: any): void {
    console.log('Fecha seleccionada:', date);
    this.selectedDateModel = date;
  }
  timeUntil(date?: string | null): string {
    if (!date) return '';

    const release = new Date(date);
    const now = new Date();

    const diff = release.getTime() - now.getTime();

    if (diff <= 0) return 'Hoy';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `En ${days} días`;
    if (hours > 0) return `En ${hours} horas`;
    if (minutes > 0) return `En ${minutes} minutos`;

    return 'En unos segundos';
  }
  saveReleaseDate(album: IAlbum): void {
    const date = this.selectedDateModel;
    if (!date) return;

    let parsed: dayjs.Dayjs;

    if (dayjs.isDayjs(date)) {
      parsed = date;
    } else {
      const struct = date as unknown as NgbDateStruct;
      parsed = dayjs(new Date(struct.year, struct.month - 1, struct.day));
    }

    if (!parsed.isValid()) return;

    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    parsed = parsed.hour(hours).minute(minutes).second(0);

    const releaseDate = parsed.format('YYYY-MM-DDTHH:mm:ss');

    const updated: IAlbum = { ...album, releaseDate };
    console.log('selectedTime:', this.selectedTime);
    console.log('hours:', hours, 'minutes:', minutes);
    console.log('releaseDate enviado:', releaseDate);
    this.albumService.update(updated).subscribe({
      next: res => {
        this.myAlbums.update(list => list.map(a => (a.id === res.id ? res : a)));
        this.cancelEditing();
      },
      error: err => console.error('Error al guardar:', err),
    });
  }

  removeFromUpcoming(album: IAlbum): void {
    const { releaseDate: _, ...rest } = album;
    const updated: IAlbum = {
      ...rest,
      releaseDate: undefined,
    };

    this.albumService.update(updated).subscribe({
      next: updatedAlbum => {
        this.myAlbums.update(list => list.map(a => (a.id === updatedAlbum.id ? updatedAlbum : a)));
      },
    });
  }
  transform(date: string | null | undefined): string {
    return date ? dayjs(date).format('LL') : '';
  }
  addToUpcoming(album: IAlbum): void {
    this.startEditing(album);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  daysUntil(date: string | null | undefined): number {
    if (!date) return 0;
    return dayjs(date).diff(dayjs(), 'day');
  }

  private loadUpcomingAlbums(): void {
    this.isLoading.set(true);

    this.albumService.getUpcoming().subscribe({
      next: res => {
        this.myAlbums.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
