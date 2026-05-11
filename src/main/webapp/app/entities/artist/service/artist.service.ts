import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IArtist, NewArtist } from '../artist.model';

export type PartialUpdateArtist = Partial<IArtist> & Pick<IArtist, 'id'>;

type RestOf<T extends IArtist | NewArtist> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

export type RestArtist = RestOf<IArtist>;

export type NewRestArtist = RestOf<NewArtist>;

export type PartialUpdateRestArtist = RestOf<PartialUpdateArtist>;

@Injectable()
export class ArtistsService {
  readonly artistsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly artistsResource = httpResource<RestArtist[]>(() => {
    const params = this.artistsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of artist that have been fetched. It is updated when the artistsResource emits a new value.
   * In case of error while fetching the artists, the signal is set to an empty array.
   */
  readonly artists = computed(() =>
    (this.artistsResource.hasValue() ? this.artistsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/artists');

  protected convertValueFromServer(restArtist: RestArtist): IArtist {
    return {
      ...restArtist,
      createdAt: restArtist.createdAt ? dayjs(restArtist.createdAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class ArtistService extends ArtistsService {
  protected readonly http = inject(HttpClient);

  create(artist: NewArtist): Observable<IArtist> {
    const copy = this.convertValueFromClient(artist);
    return this.http.post<RestArtist>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(artist: IArtist): Observable<IArtist> {
    const copy = this.convertValueFromClient(artist);
    return this.http
      .put<RestArtist>(`${this.resourceUrl}/${encodeURIComponent(this.getArtistIdentifier(artist))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(artist: PartialUpdateArtist): Observable<IArtist> {
    const copy = this.convertValueFromClient(artist);
    return this.http
      .patch<RestArtist>(`${this.resourceUrl}/${encodeURIComponent(this.getArtistIdentifier(artist))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IArtist> {
    return this.http.get<RestArtist>(`${this.resourceUrl}/${encodeURIComponent(id)}`).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IArtist[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestArtist[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getArtistIdentifier(artist: Pick<IArtist, 'id'>): number {
    return artist.id;
  }

  compareArtist(o1: Pick<IArtist, 'id'> | null, o2: Pick<IArtist, 'id'> | null): boolean {
    return o1 && o2 ? this.getArtistIdentifier(o1) === this.getArtistIdentifier(o2) : o1 === o2;
  }

  addArtistToCollectionIfMissing<Type extends Pick<IArtist, 'id'>>(
    artistCollection: Type[],
    ...artistsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const artists: Type[] = artistsToCheck.filter(isPresent);
    if (artists.length > 0) {
      const artistCollectionIdentifiers = artistCollection.map(artistItem => this.getArtistIdentifier(artistItem));
      const artistsToAdd = artists.filter(artistItem => {
        const artistIdentifier = this.getArtistIdentifier(artistItem);
        if (artistCollectionIdentifiers.includes(artistIdentifier)) {
          return false;
        }
        artistCollectionIdentifiers.push(artistIdentifier);
        return true;
      });
      return [...artistsToAdd, ...artistCollection];
    }
    return artistCollection;
  }

  protected convertValueFromClient<T extends IArtist | NewArtist | PartialUpdateArtist>(artist: T): RestOf<T> {
    return {
      ...artist,
      createdAt: artist.createdAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestArtist): IArtist {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestArtist[]): IArtist[] {
    return res.map(item => this.convertValueFromServer(item));
  }
  uploadImage(id: number, file: File): Observable<IArtist> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<IArtist>(`${this.resourceUrl}/${id}/upload-image`, formData);
  }
}
