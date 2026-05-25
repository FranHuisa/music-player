import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ILike, NewLike } from '../like.model';

export type PartialUpdateLike = Partial<ILike> & Pick<ILike, 'id'>;

type RestOf<T extends ILike | NewLike> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

export type RestLike = RestOf<ILike>;

export type NewRestLike = RestOf<NewLike>;

export type PartialUpdateRestLike = RestOf<PartialUpdateLike>;

@Injectable()
export class LikesService {
  readonly likesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(undefined);
  readonly likesResource = httpResource<RestLike[]>(() => {
    const params = this.likesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.applicationConfigService.getEndpointFor('api/likes/my'), params };
  });
  /**
   * This signal holds the list of like that have been fetched. It is updated when the likesResource emits a new value.
   * In case of error while fetching the likes, the signal is set to an empty array.
   */
  readonly likes = computed(() =>
    (this.likesResource.hasValue() ? this.likesResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/likes');

  protected convertValueFromServer(restLike: RestLike): ILike {
    return {
      ...restLike,
      createdAt: restLike.createdAt ? dayjs(restLike.createdAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class LikeService extends LikesService {
  protected readonly http = inject(HttpClient);

  create(like: NewLike): Observable<ILike> {
    const copy = this.convertValueFromClient(like);
    return this.http.post<RestLike>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(like: ILike): Observable<ILike> {
    const copy = this.convertValueFromClient(like);
    return this.http
      .put<RestLike>(`${this.resourceUrl}/${encodeURIComponent(this.getLikeIdentifier(like))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(like: PartialUpdateLike): Observable<ILike> {
    const copy = this.convertValueFromClient(like);
    return this.http
      .patch<RestLike>(`${this.resourceUrl}/${encodeURIComponent(this.getLikeIdentifier(like))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<ILike> {
    return this.http.get<RestLike>(`${this.resourceUrl}/${encodeURIComponent(id)}`).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<ILike[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestLike[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getLikeIdentifier(like: Pick<ILike, 'id'>): number {
    return like.id;
  }

  compareLike(o1: Pick<ILike, 'id'> | null, o2: Pick<ILike, 'id'> | null): boolean {
    return o1 && o2 ? this.getLikeIdentifier(o1) === this.getLikeIdentifier(o2) : o1 === o2;
  }

  addLikeToCollectionIfMissing<Type extends Pick<ILike, 'id'>>(
    likeCollection: Type[],
    ...likesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const likes: Type[] = likesToCheck.filter(isPresent);
    if (likes.length > 0) {
      const likeCollectionIdentifiers = likeCollection.map(likeItem => this.getLikeIdentifier(likeItem));
      const likesToAdd = likes.filter(likeItem => {
        const likeIdentifier = this.getLikeIdentifier(likeItem);
        if (likeCollectionIdentifiers.includes(likeIdentifier)) {
          return false;
        }
        likeCollectionIdentifiers.push(likeIdentifier);
        return true;
      });
      return [...likesToAdd, ...likeCollection];
    }
    return likeCollection;
  }

  protected convertValueFromClient<T extends ILike | NewLike | PartialUpdateLike>(like: T): RestOf<T> {
    return {
      ...like,
      createdAt: like.createdAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestLike): ILike {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestLike[]): ILike[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
