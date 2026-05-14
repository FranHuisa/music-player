import dayjs from 'dayjs/esm';

import { ISong } from 'app/entities/song/song.model';
import { IUser } from 'app/entities/user/user.model';

export interface IPlay {
  id: number;
  playedAt?: dayjs.Dayjs | null;
  durationListened?: number | null;
  user?: Pick<IUser, 'id'> | null;
  song?: Pick<ISong, 'id' | 'title' | 'coverImage'> | null;
}

export type NewPlay = Omit<IPlay, 'id'> & { id: null };
