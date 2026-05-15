import dayjs from 'dayjs/esm';

import { ISong } from 'app/entities/song/song.model';
import { IAlbum } from '../album/album.model';

export interface IArtist {
  id: number;
  name?: string | null;
  bio?: string | null;
  image?: string | null;
  country?: string | null;
  verified?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  songses?: (Pick<ISong, 'id' | 'title' | 'duration' | 'coverImage'>[] & { album?: Pick<IAlbum, 'id' | 'title'> | null }[]) | null;
}

export type NewArtist = Omit<IArtist, 'id'> & { id: null };
