import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPlaylist, NewPlaylist } from '../playlist.model';

type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

type PlaylistFormGroupInput = IPlaylist | PartialWithRequiredKeyOf<NewPlaylist>;

type FormValueOf<T extends IPlaylist | NewPlaylist> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type PlaylistFormRawValue = FormValueOf<IPlaylist>;
type NewPlaylistFormRawValue = FormValueOf<NewPlaylist>;

type PlaylistFormDefaults = Pick<NewPlaylist, 'id' | 'isPublic' | 'createdAt' | 'updatedAt'>;

type PlaylistFormGroupContent = {
  id: FormControl<PlaylistFormRawValue['id'] | NewPlaylist['id']>;
  name: FormControl<PlaylistFormRawValue['name']>;
  description: FormControl<PlaylistFormRawValue['description']>;
  isPublic: FormControl<PlaylistFormRawValue['isPublic']>;
  coverImage: FormControl<PlaylistFormRawValue['coverImage']>;
  createdAt: FormControl<PlaylistFormRawValue['createdAt']>;
  updatedAt: FormControl<PlaylistFormRawValue['updatedAt']>;
  user: FormControl<PlaylistFormRawValue['user']>;
};

export type PlaylistFormGroup = FormGroup<PlaylistFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PlaylistFormService {
  createPlaylistFormGroup(playlist?: PlaylistFormGroupInput): PlaylistFormGroup {
    const playlistRawValue = this.convertPlaylistToRaw({
      ...this.getDefaults(),
      ...(playlist ?? { id: null }),
    });

    return new FormGroup<PlaylistFormGroupContent>({
      id: new FormControl({ value: playlistRawValue.id, disabled: true }),

      name: new FormControl(playlistRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),

      description: new FormControl(playlistRawValue.description),

      isPublic: new FormControl(playlistRawValue.isPublic),

      coverImage: new FormControl(playlistRawValue.coverImage),

      createdAt: new FormControl(playlistRawValue.createdAt),

      updatedAt: new FormControl(playlistRawValue.updatedAt),

      user: new FormControl(playlistRawValue.user),
    });
  }

  getPlaylist(form: PlaylistFormGroup): IPlaylist | NewPlaylist {
    return this.convertRawToPlaylist(form.getRawValue());
  }

  resetForm(form: PlaylistFormGroup, playlist: PlaylistFormGroupInput): void {
    const raw = this.convertPlaylistToRaw({ ...this.getDefaults(), ...playlist });

    form.reset({
      ...raw,
      id: { value: raw.id, disabled: true },
    });
  }

  private getDefaults(): PlaylistFormDefaults {
    const now = dayjs();

    return {
      id: null,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  private convertRawToPlaylist(raw: PlaylistFormRawValue | NewPlaylistFormRawValue): IPlaylist | NewPlaylist {
    return {
      ...raw,
      createdAt: raw.createdAt ? dayjs(raw.createdAt, DATE_TIME_FORMAT) : undefined,
      updatedAt: raw.updatedAt ? dayjs(raw.updatedAt, DATE_TIME_FORMAT) : undefined,
    };
  }

  private convertPlaylistToRaw(
    playlist: IPlaylist | (Partial<NewPlaylist> & PlaylistFormDefaults),
  ): PlaylistFormRawValue | PartialWithRequiredKeyOf<NewPlaylistFormRawValue> {
    return {
      ...playlist,
      createdAt: playlist.createdAt ? playlist.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: playlist.updatedAt ? playlist.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
