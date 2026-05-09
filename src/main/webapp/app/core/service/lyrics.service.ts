import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

export interface LyricsResult {
  found: boolean;
  lyrics: string;
  error?: string;
}

interface LyricsResponse {
  lyrics?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class LyricsService {
  private readonly http = inject(HttpClient);

  getLyrics(artista: string, titulo: string): Observable<LyricsResult> {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artista)}/${encodeURIComponent(titulo)}`;
    return this.http.get<LyricsResponse>(url).pipe(
      map(res => {
        if (res.lyrics && res.lyrics.trim().length > 0) {
          return { found: true, lyrics: res.lyrics.trim() };
        }
        return { found: false, lyrics: '', error: 'No se encontraron letras para esta canción.' };
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of({ found: false, lyrics: '', error: 'No se encontraron letras para esta canción.' });
        }
        return of({ found: false, lyrics: '', error: 'Error al conectar con el servicio de letras. Inténtalo de nuevo.' });
      }),
    );
  }
}
