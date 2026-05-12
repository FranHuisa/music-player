import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { AccountService } from 'app/core/auth/account.service';
import { IAlbum, NewAlbum } from '../album.model';

export type PartialUpdateAlbum = Partial<IAlbum> & Pick<IAlbum, 'id'>;

type RestOf<T extends IAlbum | NewAlbum> = Omit<T, 'releaseDate'> & {
  releaseDate?: string | null;
};

export type RestAlbum = RestOf<IAlbum>;
export type NewRestAlbum = RestOf<NewAlbum>;
export type PartialUpdateRestAlbum = RestOf<PartialUpdateAlbum>;

@Injectable()
export class AlbumsService {
  readonly albumsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(undefined);

  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly accountService = inject(AccountService);

  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/albums');
  protected readonly myResourceUrl = this.applicationConfigService.getEndpointFor('api/albums/my');
  protected readonly adminResourceUrl = this.applicationConfigService.getEndpointFor('api/albums/admin');

  readonly isAdminOrEditor = computed(() => this.accountService.hasAnyAuthority(['ROLE_ADMIN']));

  readonly albumsResource = httpResource<RestAlbum[]>(() => {
    const params = this.albumsParams();
    const isAdminOrEditor = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_EDITOR']);

    if (!params || !isAdminOrEditor) return undefined;

    return {
      url: this.adminResourceUrl,
      params,
    };
  });

  readonly albums = computed(() =>
    (this.albumsResource.hasValue() ? this.albumsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  readonly myAlbums = computed(() =>
    (this.myAlbumsResource.hasValue() ? (this.myAlbumsResource.value() ?? []) : []).map(item => this.convertValueFromServer(item)),
  );
  readonly myAlbumsResource = httpResource<RestAlbum[]>(() => {
    return { url: this.myResourceUrl };
  });

  getMyAlbums(): IAlbum[] {
    const data = this.myAlbumsResource.value();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => this.convertValueFromServer(item));
  }

  protected convertValueFromClient<T extends IAlbum | NewAlbum | PartialUpdateAlbum>(album: T): RestOf<T> {
    return {
      ...album,
      releaseDate: album.releaseDate ? dayjs(album.releaseDate).format('YYYY-MM-DDTHH:mm:ss') : null,
    };
  }

  protected convertValueFromServer(restAlbum: RestAlbum): IAlbum {
    return {
      ...restAlbum,
      releaseDate: restAlbum.releaseDate ?? null,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class AlbumService extends AlbumsService {
  protected readonly http = inject(HttpClient);

  create(album: NewAlbum): Observable<IAlbum> {
    const copy = this.convertValueFromClient(album);
    return this.http.post<RestAlbum>(this.resourceUrl, copy).pipe(map(res => this.convertValueFromServer(res)));
  }

  update(album: IAlbum): Observable<IAlbum> {
    const copy = this.convertValueFromClient(album);
    return this.http
      .put<RestAlbum>(`${this.resourceUrl}/${encodeURIComponent(this.getAlbumIdentifier(album))}`, copy)
      .pipe(map(res => this.convertValueFromServer(res)));
  }

  partialUpdate(album: PartialUpdateAlbum): Observable<IAlbum> {
    const copy = this.convertValueFromClient(album);
    return this.http
      .patch<RestAlbum>(`${this.resourceUrl}/${encodeURIComponent(this.getAlbumIdentifier(album))}`, copy)
      .pipe(map(res => this.convertValueFromServer(res)));
  }

  find(id: number): Observable<IAlbum> {
    return this.http.get<RestAlbum>(`${this.resourceUrl}/${encodeURIComponent(id)}`).pipe(map(res => this.convertValueFromServer(res)));
  }

  uploadImage(formData: FormData): Observable<{ url: string }> {
    return this.http.post<{ url: string }>('/api/upload/image', formData);
  }
  queryMySongs(req?: any): Observable<HttpResponse<IAlbum[]>> {
    const options = createRequestOption(req);

    return this.http
      .get<RestAlbum[]>(this.myResourceUrl, {
        params: options,
        observe: 'response',
      })
      .pipe(
        map(res =>
          res.clone({
            body: res.body?.map(item => this.convertValueFromServer(item)) ?? [],
          }),
        ),
      );
  }
  query(req?: any): Observable<HttpResponse<IAlbum[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAlbum[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: res.body?.map(item => this.convertValueFromServer(item)) ?? [] })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getAlbumIdentifier(album: Pick<IAlbum, 'id'>): number {
    return album.id;
  }

  compareAlbum(o1: Pick<IAlbum, 'id'> | null, o2: Pick<IAlbum, 'id'> | null): boolean {
    return o1 && o2 ? this.getAlbumIdentifier(o1) === this.getAlbumIdentifier(o2) : o1 === o2;
  }

  addAlbumToCollectionIfMissing<Type extends Pick<IAlbum, 'id'>>(
    albumCollection: Type[],
    ...albumsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const albums: Type[] = albumsToCheck.filter(isPresent);

    if (albums.length > 0) {
      const albumCollectionIdentifiers = albumCollection.map(albumItem => this.getAlbumIdentifier(albumItem));
      const albumsToAdd = albums.filter(albumItem => {
        const albumIdentifier = this.getAlbumIdentifier(albumItem);
        if (albumCollectionIdentifiers.includes(albumIdentifier)) {
          return false;
        }
        albumCollectionIdentifiers.push(albumIdentifier);
        return true;
      });
      return [...albumsToAdd, ...albumCollection];
    }

    return albumCollection;
  }

  getUpcoming(): Observable<IAlbum[]> {
    return this.http.get<IAlbum[]>(this.resourceUrl + '/upcoming');
  }

  queryUpcoming(): Observable<HttpResponse<IAlbum[]>> {
    return this.http.get<IAlbum[]>(this.applicationConfigService.getEndpointFor('api/albums/upcoming'), {
      observe: 'response',
    });
  }

  toggleActive(id: number): Observable<IAlbum> {
    return this.http.patch<IAlbum>(`${this.resourceUrl}/${encodeURIComponent(id)}/toggle-active`, {});
  }
}
