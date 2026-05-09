import { HttpResponse, HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { SongService } from 'app/entities/song/service/song.service';
import { ISong } from 'app/entities/song/song.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { TranslateDirective } from 'app/shared/language';
import { IArtist } from '../artist.model';
import { ArtistService } from '../service/artist.service';

import { ArtistFormGroup, ArtistFormService } from './artist-form.service';

@Component({
  selector: 'jhi-artist-update',
  templateUrl: './artist-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class ArtistUpdate implements OnInit {
  readonly isSaving = signal(false);
  artist: IArtist | null = null;

  songsSharedCollection = signal<ISong[]>([]);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected artistService = inject(ArtistService);
  protected artistFormService = inject(ArtistFormService);
  protected songService = inject(SongService);
  protected activatedRoute = inject(ActivatedRoute);
  protected http = inject(HttpClient);

  selectedImage: File | null = null;
  imagePreviewUrl: string | null = null;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ArtistFormGroup = this.artistFormService.createArtistFormGroup();

  compareSong = (o1: ISong | null, o2: ISong | null): boolean => this.songService.compareSong(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ artist }) => {
      this.artist = artist;
      if (artist) {
        this.updateForm(artist);
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

    if (this.selectedImage) {
      const formData = new FormData();
      formData.append('file', this.selectedImage);
      this.http.post<{ url: string }>('/api/upload/image', formData).subscribe({
        next: res => {
          this.editForm.patchValue({ image: res.url });
          this.saveArtist();
        },
        error: () => {
          alert('Error al subir la imagen');
          this.isSaving.set(false);
        },
      });
    } else {
      this.saveArtist();
    }
  }

  private saveArtist(): void {
    const artist = this.artistFormService.getArtist(this.editForm);
    if (artist.id === null) {
      this.subscribeToSaveResponse(this.artistService.create(artist));
    } else {
      this.subscribeToSaveResponse(this.artistService.update(artist));
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedImage = null;
      this.imagePreviewUrl = null;
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert('Formato no permitido. Use JPEG, PNG o WebP.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Máximo 5MB');
      return;
    }

    this.selectedImage = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
  }

  protected subscribeToSaveResponse(result: Observable<IArtist | null>): void {
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

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(artist: IArtist): void {
    this.artist = artist;
    this.artistFormService.resetForm(this.editForm, artist);

    this.songsSharedCollection.update(songs => this.songService.addSongToCollectionIfMissing<ISong>(songs, ...(artist.songses ?? [])));
  }

  protected loadRelationshipsOptions(): void {
    this.songService
      .query()
      .pipe(map((res: HttpResponse<ISong[]>) => res.body ?? []))
      .pipe(map((songs: ISong[]) => this.songService.addSongToCollectionIfMissing<ISong>(songs, ...(this.artist?.songses ?? []))))
      .subscribe((songs: ISong[]) => this.songsSharedCollection.set(songs));
  }
}
