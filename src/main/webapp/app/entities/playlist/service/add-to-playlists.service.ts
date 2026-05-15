import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IPlaylist } from 'app/entities/playlist/playlist.model';

@Injectable({ providedIn: 'root' })
export class AddToPlaylistService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(ApplicationConfigService);
  private readonly router = inject(Router);

  private get playlistUrl(): string {
    return this.appConfig.getEndpointFor('api/playlists');
  }

  openDialog(songId: number): void {
    this.http.get<IPlaylist[]>(`${this.playlistUrl}/my`).subscribe({
      next: playlists => this.showDialog(songId, playlists),
      error: () =>
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar tus playlists.',
          background: '#1a1a2e',
          color: '#fff',
        }),
    });
  }

  private showDialog(songId: number, playlists: IPlaylist[]): void {
    if (playlists.length === 0) {
      Swal.fire({
        title: 'Sin playlists',
        text: 'No tienes playlists creadas todavía.',
        icon: 'info',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonText: '➕ Crear playlist',
        confirmButtonColor: '#3b82f6',
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigate(['/playlist/new']);
        }
      });
      return;
    }

    const listHtml = playlists
      .map(
        p => `
        <button
          class="swal-playlist-item"
          data-id="${p.id}"
          onclick="
            document.querySelectorAll('.swal-playlist-item').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('swal-selected-id').value='${p.id}'
          ">
          <span class="swal-playlist-icon">🎵</span>
          <span class="swal-playlist-name">${p.name ?? 'Sin nombre'}</span>
        </button>`,
      )
      .join('');

    Swal.fire({
      title: 'Añadir a playlist',
      background: '#1a1a2e',
      color: '#fff',
      html: `
        <style>
          .swal-playlist-list {
            display: flex; flex-direction: column; gap: 8px;
            max-height: 280px; overflow-y: auto; padding: 4px 2px;
          }
          .swal-playlist-item {
            display: flex; align-items: center; gap: 12px;
            width: 100%; padding: 10px 14px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px; color: #fff; font-size: 14px;
            cursor: pointer; transition: all 0.2s ease; text-align: left;
          }
          .swal-playlist-item:hover { background: rgba(59,130,246,0.2); border-color: #3b82f6; }
          .swal-playlist-item.selected { background: rgba(59,130,246,0.3); border-color: #3b82f6; }
          .swal-playlist-icon { font-size: 18px; }
          .swal-playlist-name { font-weight: 500; }
          .swal-create-btn {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%; padding: 10px 14px; margin-top: 4px;
            background: transparent;
            border: 1px dashed rgba(255,255,255,0.3);
            border-radius: 8px; color: rgba(255,255,255,0.6); font-size: 14px;
            cursor: pointer; transition: all 0.2s ease;
          }
          .swal-create-btn:hover { border-color: #22c55e; color: #22c55e; }
        </style>
        <div class="swal-playlist-list">
          ${listHtml}
          <button class="swal-create-btn" id="swal-create-btn">
            <span>➕</span><span>Crear nueva playlist</span>
          </button>
        </div>
        <input type="hidden" id="swal-selected-id" value="" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Añadir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      didOpen: () => {
        document.getElementById('swal-create-btn')?.addEventListener('click', () => {
          Swal.close();
          this.router.navigate(['/playlist/new']);
        });
      },
      preConfirm: () => {
        const selectedId = (document.getElementById('swal-selected-id') as HTMLInputElement)?.value;
        if (!selectedId) {
          Swal.showValidationMessage('Selecciona una playlist primero');
          return false;
        }
        return Number(selectedId);
      },
    }).then(result => {
      if (result.isConfirmed && result.value) {
        this.addSong(result.value as number, songId);
      }
    });
  }

  private addSong(playlistId: number, songId: number): void {
    this.http.post<void>(`${this.playlistUrl}/${playlistId}/songs/${songId}`, {}).subscribe({
      next: () =>
        Swal.fire({
          icon: 'success',
          title: '¡Añadida!',
          text: 'Canción añadida a la playlist.',
          background: '#0f172a',
          color: '#ffffff',
          timer: 1800,
          showConfirmButton: false,
        }),
      error: () =>
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo añadir la canción.',
          background: '#0f172a',
          color: '#ffffff',
        }),
    });
  }
}
