import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, catchError, map, of } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IPlay, NewPlay } from '../play.model';

export type PartialUpdatePlay = Partial<IPlay> & Pick<IPlay, 'id'>;

type RestOf<T extends IPlay | NewPlay> = Omit<T, 'playedAt'> & {
  playedAt?: string | null;
};

export type RestPlay = RestOf<IPlay>;

export type NewRestPlay = RestOf<NewPlay>;

export type PartialUpdateRestPlay = RestOf<PartialUpdatePlay>;

@Injectable()
export class PlaysService {
  readonly playsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(undefined);
  readonly playsResource = httpResource<RestPlay[]>(() => {
    const params = this.playsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of play that have been fetched. It is updated when the playsResource emits a new value.
   * In case of error while fetching the plays, the signal is set to an empty array.
   */
  readonly plays = computed(() =>
    (this.playsResource.hasValue() ? this.playsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/plays');

  protected convertValueFromServer(restPlay: RestPlay): IPlay {
    return {
      ...restPlay,
      playedAt: restPlay.playedAt ? dayjs(restPlay.playedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PlayService extends PlaysService {
  protected readonly http = inject(HttpClient);

  create(play: NewPlay): Observable<IPlay> {
    const copy = this.convertValueFromClient(play);
    return this.http.post<RestPlay>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(play: IPlay): Observable<IPlay> {
    const copy = this.convertValueFromClient(play);
    return this.http
      .put<RestPlay>(`${this.resourceUrl}/${encodeURIComponent(this.getPlayIdentifier(play))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(play: PartialUpdatePlay): Observable<IPlay> {
    const copy = this.convertValueFromClient(play);
    return this.http
      .patch<RestPlay>(`${this.resourceUrl}/${encodeURIComponent(this.getPlayIdentifier(play))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IPlay> {
    return this.http.get<RestPlay>(`${this.resourceUrl}/${encodeURIComponent(id)}`).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IPlay[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPlay[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getPlayIdentifier(play: Pick<IPlay, 'id'>): number {
    return play.id;
  }

  comparePlay(o1: Pick<IPlay, 'id'> | null, o2: Pick<IPlay, 'id'> | null): boolean {
    return o1 && o2 ? this.getPlayIdentifier(o1) === this.getPlayIdentifier(o2) : o1 === o2;
  }

  addPlayToCollectionIfMissing<Type extends Pick<IPlay, 'id'>>(
    playCollection: Type[],
    ...playsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const plays: Type[] = playsToCheck.filter(isPresent);
    if (plays.length > 0) {
      const playCollectionIdentifiers = playCollection.map(playItem => this.getPlayIdentifier(playItem));
      const playsToAdd = plays.filter(playItem => {
        const playIdentifier = this.getPlayIdentifier(playItem);
        if (playCollectionIdentifiers.includes(playIdentifier)) {
          return false;
        }
        playCollectionIdentifiers.push(playIdentifier);
        return true;
      });
      return [...playsToAdd, ...playCollection];
    }
    return playCollection;
  }

  protected convertValueFromClient<T extends IPlay | NewPlay | PartialUpdatePlay>(play: T): RestOf<T> {
    return {
      ...play,
      playedAt: play.playedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestPlay): IPlay {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestPlay[]): IPlay[] {
    return res.map(item => this.convertValueFromServer(item));
  }
  findLast(): Observable<IPlay | null> {
    return this.http.get<RestPlay | null>(`${this.resourceUrl}/last`).pipe(
      map(res => (res ? this.convertResponseFromServer(res) : null)),
      catchError(() => of(null)),
    );
  }
}
