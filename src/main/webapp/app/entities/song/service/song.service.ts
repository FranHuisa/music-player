import { HttpClient, HttpHeaders, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ISong, NewSong } from '../song.model';

export type PartialUpdateSong = Partial<ISong> & Pick<ISong, 'id'>;

type RestOf<T extends ISong | NewSong> = Omit<T, 'releaseDate' | 'createdAt'> & {
  releaseDate?: string | null;
  createdAt?: string | null;
};

export type RestSong = RestOf<ISong>;
export type NewRestSong = RestOf<NewSong>;
export type PartialUpdateRestSong = RestOf<PartialUpdateSong>;

// ── Mantener SongsService vacío para no romper otros componentes que lo usen ──
@Injectable()
export class SongsService {
  readonly songsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(undefined);
  readonly isAdmin = signal(false);
  readonly roleReady = signal(false);

  // Signals para que el componente pueda leer canciones y estado de carga
  readonly songs = signal<ISong[]>([]);
  readonly isLoading = signal(false);
  readonly lastHeaders = signal<HttpHeaders | null>(null);

  // Mantener songsResource como stub para no romper referencias en el componente
  readonly songsResource = {
    isLoading: this.isLoading,
    headers: this.lastHeaders,
  };

  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly publicResourceUrl = this.applicationConfigService.getEndpointFor('api/songs');
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/songs/my-songs');
  protected readonly adminResourceUrl = this.applicationConfigService.getEndpointFor('api/songs/admin');

  protected convertValueFromServer(restSong: RestSong): ISong {
    return {
      ...restSong,
      releaseDate: restSong.releaseDate ? dayjs(restSong.releaseDate) : undefined,
      createdAt: restSong.createdAt ? dayjs(restSong.createdAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class SongService extends SongsService {
  protected readonly http = inject(HttpClient);

  loadSongs(params: Record<string, any>, isAdmin: boolean, isEditor = false): void {
    this.isLoading.set(true);
    const url = isAdmin ? this.adminResourceUrl : this.resourceUrl;

    const options = createRequestOption(params);
    this.http.get<RestSong[]>(url, { params: options, observe: 'response' }).subscribe({
      next: res => {
        this.lastHeaders.set(res.headers);
        this.songs.set((res.body ?? []).map(item => this.convertValueFromServer(item)));
        this.isLoading.set(false);
      },
      error: () => {
        this.songs.set([]);
        this.isLoading.set(false);
      },
    });
  }
  uploadImage(formData: FormData): Observable<{ url: string }> {
    return this.http.post<{ url: string }>('/api/upload/image', formData);
  }
  create(song: NewSong): Observable<ISong> {
    const copy = this.convertValueFromClient(song);
    return this.http.post<RestSong>(this.resourceUrl.replace('/my-songs', ''), copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(song: ISong): Observable<ISong> {
    const copy = this.convertValueFromClient(song);
    return this.http
      .put<RestSong>(`${this.resourceUrl.replace('/my-songs', '')}/${encodeURIComponent(this.getSongIdentifier(song))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(song: PartialUpdateSong): Observable<ISong> {
    const copy = this.convertValueFromClient(song);
    return this.http
      .patch<RestSong>(`${this.resourceUrl.replace('/my-songs', '')}/${encodeURIComponent(this.getSongIdentifier(song))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<ISong> {
    return this.http
      .get<RestSong>(`${this.resourceUrl.replace('/my-songs', '')}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<ISong[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSong[]>(this.publicResourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  queryMySongs(req?: any): Observable<HttpResponse<ISong[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSong[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body ?? []) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl.replace('/my-songs', '')}/${encodeURIComponent(id)}`);
  }

  getSongIdentifier(song: Pick<ISong, 'id'>): number {
    return song.id;
  }

  compareSong(o1: Pick<ISong, 'id'> | null, o2: Pick<ISong, 'id'> | null): boolean {
    return o1 && o2 ? this.getSongIdentifier(o1) === this.getSongIdentifier(o2) : o1 === o2;
  }

  addSongToCollectionIfMissing<Type extends Pick<ISong, 'id'>>(
    songCollection: Type[],
    ...songsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const songs: Type[] = songsToCheck.filter(isPresent);
    if (songs.length > 0) {
      const songCollectionIdentifiers = songCollection.map(songItem => this.getSongIdentifier(songItem));
      const songsToAdd = songs.filter(songItem => {
        const songIdentifier = this.getSongIdentifier(songItem);
        if (songCollectionIdentifiers.includes(songIdentifier)) return false;
        songCollectionIdentifiers.push(songIdentifier);
        return true;
      });
      return [...songsToAdd, ...songCollection];
    }
    return songCollection;
  }

  toggleActive(id: number): Observable<ISong> {
    return this.http
      .patch<RestSong>(`${this.resourceUrl.replace('/my-songs', '')}/${encodeURIComponent(id)}/toggle-active`, {})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  protected convertValueFromClient<T extends ISong | NewSong | PartialUpdateSong>(song: T): RestOf<T> {
    return {
      ...song,
      releaseDate: song.releaseDate?.format(DATE_FORMAT) ?? null,
      createdAt: song.createdAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestSong): ISong {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestSong[]): ISong[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
