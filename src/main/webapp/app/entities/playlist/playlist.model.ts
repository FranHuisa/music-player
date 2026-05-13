import dayjs from 'dayjs/esm';

import { IUser } from 'app/entities/user/user.model';
import { IPlaylistSong } from 'app/entities/playlist-song/playlist-song.model';

export interface IPlaylist {
  id: number;
  name?: string | null;
  description?: string | null;
  isPublic?: boolean | null;
  coverImage?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;

  user?: Pick<IUser, 'id'> | null;

  playlistSongs?: IPlaylistSong[] | null;
}

export type NewPlaylist = Omit<IPlaylist, 'id'> & { id: null };
