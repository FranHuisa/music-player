import dayjs from 'dayjs/esm';

import { IAlbum } from 'app/entities/album/album.model';
import { IArtist } from 'app/entities/artist/artist.model';
import { IGenre } from 'app/entities/genre/genre.model';

export interface ISong {
  id: number;
  title?: string | null;
  duration?: number | null;
  fileUrl?: string | null;
  coverImage?: string | null;
  lyrics?: string | null;
  releaseDate?: dayjs.Dayjs | null;
  createdAt?: dayjs.Dayjs | null;
  active?: boolean | null;
  album?: Pick<IAlbum, 'id' | 'title'> | null;
  genre?: Pick<IGenre, 'id'> | null;
  artistses?: Pick<IArtist, 'id' | 'name'>[] | null;
  artist?: Pick<IArtist, 'id' | 'name'> | null;
}

export type NewSong = Omit<ISong, 'id'> & { id: null };
