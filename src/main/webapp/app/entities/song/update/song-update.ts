import { HttpResponse, HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { IAlbum } from 'app/entities/album/album.model';
import { AlbumService } from 'app/entities/album/service/album.service';
import { IArtist } from 'app/entities/artist/artist.model';
import { ArtistService } from 'app/entities/artist/service/artist.service';
import { IGenre } from 'app/entities/genre/genre.model';
import { GenreService } from 'app/entities/genre/service/genre.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { TranslateDirective } from 'app/shared/language';
import { SongService } from '../service/song.service';
import { ISong } from '../song.model';

import { SongFormGroup, SongFormService } from './song-form.service';

@Component({
  selector: 'jhi-song-update',
  templateUrl: './song-update.html',
  styleUrl: './song-update.scss',

  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class SongUpdate implements OnInit {
  readonly isSaving = signal(false);
  song: ISong | null = null;

  albumsSharedCollection = signal<IAlbum[]>([]);
  genresSharedCollection = signal<IGenre[]>([]);
  artistsSharedCollection = signal<IArtist[]>([]);
  protected http = inject(HttpClient);
  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected songService = inject(SongService);
  protected songFormService = inject(SongFormService);
  protected albumService = inject(AlbumService);
  protected genreService = inject(GenreService);
  protected artistService = inject(ArtistService);
  protected activatedRoute = inject(ActivatedRoute);
  // Validación de archivos
  selectedFile: File | null = null;
  selectedCover: File | null = null;
  coverPreviewUrl: string | null = null;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SongFormGroup = this.songFormService.createSongFormGroup();

  compareAlbum = (o1: IAlbum | null, o2: IAlbum | null): boolean => this.albumService.compareAlbum(o1, o2);

  compareGenre = (o1: IGenre | null, o2: IGenre | null): boolean => this.genreService.compareGenre(o1, o2);

  compareArtist = (o1: IArtist | null, o2: IArtist | null): boolean => this.artistService.compareArtist(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ song }) => {
      this.song = song;
      if (song) {
        this.updateForm(song);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(
          new EventWithContent<AlertErrorModel>('musicPlayerApp.error', { ...err, key: `error.file.${err.key}` }),
        ),
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post<{ url: string; filename: string }>('/api/upload/audio', formData).subscribe({
        next: res => {
          this.editForm.patchValue({ fileUrl: res.filename });
          this.saveSong();
        },
        error: () => {
          alert('Error al subir el archivo de audio');
          this.isSaving.set(false);
        },
      });
    } else {
      this.saveSong();
    }
  }
  private saveSong(): void {
    const song = this.songFormService.getSong(this.editForm);

    const artistsText = this.editForm.get('artistsText')?.value ?? '';

    song.artistses = artistsText
      .split(',')
      .map((name: string) => name.trim())
      .filter((name: string) => name.length > 0)
      .map((name: string, index: number) => ({
        id: index + 1,
        name,
      }));

    if (song.id === null) {
      this.subscribeToSaveResponse(this.songService.create(song));
    } else {
      this.subscribeToSaveResponse(this.songService.update(song));
    }
  }
  protected subscribeToSaveResponse(result: Observable<ISong | null>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }
  formatDuration(seconds: number): string {
    if (seconds == null) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/x-mpeg', 'audio/mpeg3'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos MP3 o WAV');
      return;
    }

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande (máx 15MB)');
      return;
    }

    this.selectedFile = file;

    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      this.editForm.patchValue({ duration: Math.floor(audio.duration) });
      URL.revokeObjectURL(audio.src);
    };
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedCover = null;
      this.coverPreviewUrl = null;
      return;
    }

    const file = input.files[0];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert('Formato no permitido');
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    //CAMBIAR POR DIALOG DE SWEETALERT2
    if (file.size > maxSize) {
      alert('Máximo 5MB');
      return;
    }

    const img = new Image();

    img.onload = () => {
      if (img.width < 300 || img.height < 300) {
        alert('Resolución mínima 300x300');
        return;
      }

      this.selectedCover = file;
      this.coverPreviewUrl = URL.createObjectURL(file);
    };

    img.src = URL.createObjectURL(file);
  }
  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(song: ISong): void {
    this.song = song;
    this.songFormService.resetForm(this.editForm, song);

    if (song.coverImage) {
      this.coverPreviewUrl = song.coverImage;
    }

    this.albumsSharedCollection.update(albums => this.albumService.addAlbumToCollectionIfMissing<IAlbum>(albums, song.album));
    this.genresSharedCollection.update(genres => this.genreService.addGenreToCollectionIfMissing<IGenre>(genres, song.genre));
    this.artistsSharedCollection.update(artists =>
      this.artistService.addArtistToCollectionIfMissing<IArtist>(artists, ...(song.artistses ?? [])),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.albumService
      .query()
      .pipe(map((res: HttpResponse<IAlbum[]>) => res.body ?? []))
      .pipe(map((albums: IAlbum[]) => this.albumService.addAlbumToCollectionIfMissing<IAlbum>(albums, this.song?.album)))
      .subscribe((albums: IAlbum[]) => this.albumsSharedCollection.set(albums));

    this.genreService
      .query()
      .pipe(map((res: HttpResponse<IGenre[]>) => res.body ?? []))
      .pipe(map((genres: IGenre[]) => this.genreService.addGenreToCollectionIfMissing<IGenre>(genres, this.song?.genre)))
      .subscribe((genres: IGenre[]) => this.genresSharedCollection.set(genres));

    this.artistService
      .query()
      .pipe(map((res: HttpResponse<IArtist[]>) => res.body ?? []))
      .pipe(
        map((artists: IArtist[]) => this.artistService.addArtistToCollectionIfMissing<IArtist>(artists, ...(this.song?.artistses ?? []))),
      )
      .subscribe((artists: IArtist[]) => this.artistsSharedCollection.set(artists));
  }
}
