import dayjs from 'dayjs/esm';

import { IPlaylist } from 'app/entities/playlist/playlist.model';
import { ISong } from 'app/entities/song/song.model';

export interface IPlaylistSong {
  id: number;
  position?: number | null;
  addedAt?: dayjs.Dayjs | null;
  playlist?: Pick<IPlaylist, 'id'> | null;
  song?: ISong;
}

export type NewPlaylistSong = Omit<IPlaylistSong, 'id'> & { id: null };
