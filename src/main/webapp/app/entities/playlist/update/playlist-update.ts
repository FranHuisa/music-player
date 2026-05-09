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
import { UserService } from 'app/entities/user/service/user.service';
import { IUser } from 'app/entities/user/user.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { TranslateDirective } from 'app/shared/language';
import { IPlaylist } from '../playlist.model';
import { PlaylistService } from '../service/playlist.service';

import { PlaylistFormGroup, PlaylistFormService } from './playlist-form.service';

@Component({
  selector: 'jhi-playlist-update',
  templateUrl: './playlist-update.html',
  styleUrl: './playlist-update.scss',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class PlaylistUpdate implements OnInit {
  readonly isSaving = signal(false);
  playlist: IPlaylist | null = null;

  usersSharedCollection = signal<IUser[]>([]);
  protected http = inject(HttpClient);
  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected playlistService = inject(PlaylistService);
  protected playlistFormService = inject(PlaylistFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);
  selectedCover: File | null = null;
  coverPreviewUrl: string | null = null;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PlaylistFormGroup = this.playlistFormService.createPlaylistFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ playlist }) => {
      this.playlist = playlist;
      if (playlist) {
        this.updateForm(playlist);
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

    if (this.selectedCover) {
      const formData = new FormData();
      formData.append('file', this.selectedCover);

      this.http.post<{ url: string }>('/api/upload/image', formData).subscribe({
        next: res => {
          this.editForm.patchValue({ coverImage: res.url });
          this.savePlaylist();
        },
        error: () => {
          alert('Error al subir la imagen');
          this.isSaving.set(false);
        },
      });
    } else {
      this.savePlaylist();
    }
  }
  private savePlaylist(): void {
    const playlist = this.playlistFormService.getPlaylist(this.editForm);

    if (playlist.id === null) {
      this.subscribeToSaveResponse(this.playlistService.create(playlist));
    } else {
      this.subscribeToSaveResponse(this.playlistService.update(playlist));
    }
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

    this.selectedCover = file;
    this.coverPreviewUrl = URL.createObjectURL(file);
  }
  protected subscribeToSaveResponse(result: Observable<IPlaylist | null>): void {
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

  protected updateForm(playlist: IPlaylist): void {
    this.playlist = playlist;
    this.playlistFormService.resetForm(this.editForm, playlist);

    this.usersSharedCollection.update(users => this.userService.addUserToCollectionIfMissing<IUser>(users, playlist.user));
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.playlist?.user)))
      .subscribe((users: IUser[]) => this.usersSharedCollection.set(users));
  }
}
