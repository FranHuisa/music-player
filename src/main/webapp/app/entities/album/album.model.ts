import dayjs from 'dayjs/esm';

import { IArtist } from 'app/entities/artist/artist.model';
import { AlbumType } from 'app/entities/enumerations/album-type.model';
import { IGenre } from 'app/entities/genre/genre.model';

export interface IAlbum {
  id: number;
  title?: string | null;
  coverImage?: string | null;
  releaseDate?: string | null;
  albumType?: keyof typeof AlbumType | null;
  artist?: Pick<IArtist, 'id'> | null;
  genre?: Pick<IGenre, 'id'> | null;
  active?: boolean;
}

export type NewAlbum = Omit<IAlbum, 'id'> & { id: null };
