import dayjs from 'dayjs/esm';

import { ISong } from 'app/entities/song/song.model';
import { IUser } from 'app/entities/user/user.model';

export interface ILike {
  id: number;
  createdAt?: dayjs.Dayjs | null;
  user?: Pick<IUser, 'id'> | null;
  song?: Pick<ISong, 'id' | 'title' | 'fileUrl' | 'coverImage' | 'duration'> | null;
}

export type NewLike = Omit<ILike, 'id'> & { id: null };
