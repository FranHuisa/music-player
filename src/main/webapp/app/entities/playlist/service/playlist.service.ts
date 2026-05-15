import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IPlaylist, NewPlaylist } from '../playlist.model';

export type PartialUpdatePlaylist = Partial<IPlaylist> & Pick<IPlaylist, 'id'>;

type RestOf<T extends IPlaylist | NewPlaylist> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestPlaylist = RestOf<IPlaylist>;

export type NewRestPlaylist = RestOf<NewPlaylist>;

export type PartialUpdateRestPlaylist = RestOf<PartialUpdatePlaylist>;

@Injectable()
export class PlaylistsService {
  readonly playlistsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly playlistsResource = httpResource<RestPlaylist[]>(() => {
    const params = this.playlistsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of playlist that have been fetched. It is updated when the playlistsResource emits a new value.
   * In case of error while fetching the playlists, the signal is set to an empty array.
   */
  readonly playlists = computed(() =>
    (this.playlistsResource.hasValue() ? this.playlistsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/playlists');

  protected convertValueFromServer(restPlaylist: RestPlaylist): IPlaylist {
    return {
      ...restPlaylist,
      createdAt: restPlaylist.createdAt ? dayjs(restPlaylist.createdAt) : undefined,
      updatedAt: restPlaylist.updatedAt ? dayjs(restPlaylist.updatedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PlaylistService extends PlaylistsService {
  protected readonly http = inject(HttpClient);

  create(playlist: NewPlaylist): Observable<IPlaylist> {
    const copy = this.convertValueFromClient(playlist);
    return this.http.post<RestPlaylist>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(playlist: IPlaylist): Observable<IPlaylist> {
    const copy = this.convertValueFromClient(playlist);
    return this.http
      .put<RestPlaylist>(`${this.resourceUrl}/${encodeURIComponent(this.getPlaylistIdentifier(playlist))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(playlist: PartialUpdatePlaylist): Observable<IPlaylist> {
    const copy = this.convertValueFromClient(playlist);
    return this.http
      .patch<RestPlaylist>(`${this.resourceUrl}/${encodeURIComponent(this.getPlaylistIdentifier(playlist))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IPlaylist> {
    return this.http
      .get<RestPlaylist>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IPlaylist[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPlaylist[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getPlaylistIdentifier(playlist: Pick<IPlaylist, 'id'>): number {
    return playlist.id;
  }

  comparePlaylist(o1: Pick<IPlaylist, 'id'> | null, o2: Pick<IPlaylist, 'id'> | null): boolean {
    return o1 && o2 ? this.getPlaylistIdentifier(o1) === this.getPlaylistIdentifier(o2) : o1 === o2;
  }
  findMy(): Observable<IPlaylist[]> {
    return this.http.get<IPlaylist[]>(`${this.resourceUrl}/my`);
  }
  addPlaylistToCollectionIfMissing<Type extends Pick<IPlaylist, 'id'>>(
    playlistCollection: Type[],
    ...playlistsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const playlists: Type[] = playlistsToCheck.filter(isPresent);
    if (playlists.length > 0) {
      const playlistCollectionIdentifiers = playlistCollection.map(playlistItem => this.getPlaylistIdentifier(playlistItem));
      const playlistsToAdd = playlists.filter(playlistItem => {
        const playlistIdentifier = this.getPlaylistIdentifier(playlistItem);
        if (playlistCollectionIdentifiers.includes(playlistIdentifier)) {
          return false;
        }
        playlistCollectionIdentifiers.push(playlistIdentifier);
        return true;
      });
      return [...playlistsToAdd, ...playlistCollection];
    }
    return playlistCollection;
  }

  protected convertValueFromClient<T extends IPlaylist | NewPlaylist | PartialUpdatePlaylist>(playlist: T): RestOf<T> {
    return {
      ...playlist,
      createdAt: playlist.createdAt?.toJSON() ?? null,
      updatedAt: playlist.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestPlaylist): IPlaylist {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestPlaylist[]): IPlaylist[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
