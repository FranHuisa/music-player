import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { DataUtils } from 'app/core/util/data-util.service';
import { EventManager } from 'app/core/util/event-manager.service';
import { SongService } from 'app/entities/song/service/song.service';
import { ISong } from 'app/entities/song/song.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IArtist } from '../artist.model';
import { ArtistService } from '../service/artist.service';
import { ArtistFormGroup, ArtistFormService } from './artist-form.service';

interface IUser {
  id: number;
  login: string;
}

@Component({
  selector: 'jhi-artist-update',
  templateUrl: './artist-update.html',
  styleUrls: ['./artist-update.scss'],
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
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(ApplicationConfigService);
  selectedCover: File | null = null;
  coverPreviewUrl: string | null = null;
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
    const artist = this.artistFormService.getArtist(this.editForm);
    if (artist.id === null) {
      this.subscribeToSaveResponse(this.artistService.create(artist), true);
    } else {
      this.subscribeToSaveResponse(this.artistService.update(artist), false);
    }
  }

  openAssignUserDialog(): void {
    const artistId = this.editForm.controls.id.value;
    if (!artistId) return;

    const usersUrl = this.appConfig.getEndpointFor('api/admin/users');
    this.http.get<IUser[]>(usersUrl).subscribe({
      next: users => this.showAssignDialog(artistId, users),
      error: () =>
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los usuarios.', background: '#0f172a', color: '#ffffff' }),
    });
  }

  private showAssignDialog(artistId: number, users: IUser[]): void {
    const listHtml = users
      .map(
        u => `
        <button class="swal-user-item" data-id="${u.id}"
          onclick="document.querySelectorAll('.swal-user-item').forEach(b => b.classList.remove('selected'));
                   this.classList.add('selected');
                   document.getElementById('swal-selected-user-id').value='${u.id}'">
          <span class="swal-user-icon">👤</span>
          <span class="swal-user-login">${u.login}</span>
        </button>`,
      )
      .join('');

    Swal.fire({
      title: 'Asignar usuario al artista',
      background: '#1a1a2e',
      color: '#fff',
      html: `
        <style>
          .swal-user-list { display:flex; flex-direction:column; gap:8px; max-height:300px; overflow-y:auto; padding:4px 2px; }
          .swal-user-item { display:flex; align-items:center; gap:12px; width:100%; padding:10px 14px;
            background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
            border-radius:8px; color:#fff; font-size:14px; cursor:pointer; transition:all 0.2s ease; text-align:left; }
          .swal-user-item:hover { background:rgba(59,130,246,0.2); border-color:#3b82f6; }
          .swal-user-item.selected { background:rgba(59,130,246,0.3); border-color:#3b82f6; }
          .swal-user-icon { font-size:18px; }
          .swal-user-login { font-weight:500; }
        </style>
        <div class="swal-user-list">${listHtml}</div>
        <input type="hidden" id="swal-selected-user-id" value="" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Omitir',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',

      preConfirm: () => {
        const selectedId = (document.getElementById('swal-selected-user-id') as HTMLInputElement)?.value;
        if (!selectedId) {
          Swal.showValidationMessage('Selecciona un usuario primero');
          return false;
        }
        return Number(selectedId);
      },
    }).then(result => {
      if (result.isConfirmed && result.value) {
        this.assignUser(artistId, result.value as number);
      } else {
        this.previousState();
      }
    });
  }

  private assignUser(artistId: number, userId: number): void {
    const url = this.appConfig.getEndpointFor(`api/artists/${artistId}/assign-user/${userId}`);
    this.http.put<void>(url, {}).subscribe({
      next: () =>
        Swal.fire({
          icon: 'success',
          title: '¡Asignado!',
          text: 'Usuario vinculado al artista correctamente.',
          background: '#0f172a',
          color: '#ffffff',
          timer: 1800,
          showConfirmButton: false,
        }).then(() => this.previousState()),
      error: () =>
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo asignar el usuario.', background: '#0f172a', color: '#ffffff' }),
    });
  }

  protected subscribeToSaveResponse(result: Observable<IArtist | null>, isNew: boolean): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: saved => this.onSaveSuccess(saved, isNew),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(saved?: IArtist | null, isNew = false): void {
    if (!saved?.id) {
      this.previousState();
      return;
    }

    if (this.selectedCover) {
      this.artistService.uploadImage(saved.id, this.selectedCover).subscribe({
        next: () => {
          if (isNew) {
            this.artistFormService.resetForm(this.editForm, saved);
            this.openAssignUserDialog();
          } else {
            this.previousState();
          }
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo subir la imagen',
            color: '#ffffff',
            background: '#0f172a',
          });
        },
      });

      return;
    }

    if (isNew) {
      this.artistFormService.resetForm(this.editForm, saved);
      this.openAssignUserDialog();
    } else {
      this.previousState();
    }
  }

  protected onSaveError(): void {}

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
