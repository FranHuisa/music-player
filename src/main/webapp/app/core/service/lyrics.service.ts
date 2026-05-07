import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

interface LyricsResponse {
  lyrics?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class LyricsService {
  private readonly http = inject(HttpClient);

  getLyrics(artista: string, titulo: string): Observable<string> {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artista)}/${encodeURIComponent(titulo)}`;
    return this.http.get<LyricsResponse>(url).pipe(
      map(res => res.lyrics?.trim() ?? 'No se encontraron letras para esta canción.'),
      catchError(() => of('No se encontraron letras para esta canción.')),
    );
  }
}
