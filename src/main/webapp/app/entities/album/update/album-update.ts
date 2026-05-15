import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IArtist } from 'app/entities/artist/artist.model';
import { ArtistService } from 'app/entities/artist/service/artist.service';
import { AlbumType } from 'app/entities/enumerations/album-type.model';
import { IGenre } from 'app/entities/genre/genre.model';
import { GenreService } from 'app/entities/genre/service/genre.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { IAlbum } from '../album.model';
import { AlbumService } from '../service/album.service';

import { AlbumFormGroup, AlbumFormService } from './album-form.service';

@Component({
  selector: 'jhi-album-update',
  templateUrl: './album-update.html',
  styleUrl: './album-update.scss',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class AlbumUpdate implements OnInit {
  readonly isSaving = signal(false);
  album: IAlbum | null = null;
  albumTypeValues = Object.keys(AlbumType);

  artistsSharedCollection = signal<IArtist[]>([]);
  genresSharedCollection = signal<IGenre[]>([]);

  protected albumService = inject(AlbumService);
  protected albumFormService = inject(AlbumFormService);
  protected artistService = inject(ArtistService);
  protected genreService = inject(GenreService);
  protected activatedRoute = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  selectedCover: File | null = null;
  coverPreviewUrl: string | null = null;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AlbumFormGroup = this.albumFormService.createAlbumFormGroup();

  compareArtist = (o1: IArtist | null, o2: IArtist | null): boolean => this.artistService.compareArtist(o1, o2);

  compareGenre = (o1: IGenre | null, o2: IGenre | null): boolean => this.genreService.compareGenre(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ album }) => {
      this.album = album;
      if (album) {
        this.updateForm(album);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
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
  save(): void {
    this.isSaving.set(true);
    const album = this.albumFormService.getAlbum(this.editForm);

    const saveAlbum = album.id === null ? this.albumService.create(album) : this.albumService.update(album);

    saveAlbum.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: saved => {
        if (this.selectedCover && saved?.id) {
          const formData = new FormData();
          formData.append('file', this.selectedCover);
          this.http.post(`/api/albums/${saved.id}/upload-image`, formData).subscribe({
            next: () => this.onSaveSuccess(),
            error: () => this.onSaveSuccess(),
          });
        } else {
          this.onSaveSuccess();
        }
      },
      error: () => this.onSaveError(),
    });
  }

  protected subscribeToSaveResponse(result: Observable<IAlbum | null>): void {
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

  protected updateForm(album: IAlbum): void {
    this.album = album;
    this.albumFormService.resetForm(this.editForm, album);

    this.artistsSharedCollection.update(artists => this.artistService.addArtistToCollectionIfMissing<IArtist>(artists, album.artist));
    this.genresSharedCollection.update(genres => this.genreService.addGenreToCollectionIfMissing<IGenre>(genres, album.genre));
  }

  protected loadRelationshipsOptions(): void {
    this.artistService
      .query()
      .pipe(map((res: HttpResponse<IArtist[]>) => res.body ?? []))
      .pipe(map((artists: IArtist[]) => this.artistService.addArtistToCollectionIfMissing<IArtist>(artists, this.album?.artist)))
      .subscribe((artists: IArtist[]) => this.artistsSharedCollection.set(artists));

    this.genreService
      .query()
      .pipe(map((res: HttpResponse<IGenre[]>) => res.body ?? []))
      .pipe(map((genres: IGenre[]) => this.genreService.addGenreToCollectionIfMissing<IGenre>(genres, this.album?.genre)))
      .subscribe((genres: IGenre[]) => this.genresSharedCollection.set(genres));
  }
}
