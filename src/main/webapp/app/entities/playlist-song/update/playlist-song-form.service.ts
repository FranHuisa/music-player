import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPlaylistSong, NewPlaylistSong } from '../playlist-song.model';
import { ISong } from 'app/entities/song/song.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPlaylistSong for edit and NewPlaylistSongFormGroupInput for create.
 */
type PlaylistSongFormGroupInput = IPlaylistSong | PartialWithRequiredKeyOf<NewPlaylistSong>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPlaylistSong | NewPlaylistSong> = Omit<T, 'addedAt'> & {
  addedAt?: string | null;
};

type PlaylistSongFormRawValue = FormValueOf<IPlaylistSong>;

type NewPlaylistSongFormRawValue = FormValueOf<NewPlaylistSong>;

type PlaylistSongFormDefaults = Pick<NewPlaylistSong, 'id' | 'addedAt'>;

type PlaylistSongFormGroupContent = {
  id: FormControl<PlaylistSongFormRawValue['id'] | NewPlaylistSong['id']>;
  position: FormControl<PlaylistSongFormRawValue['position']>;
  addedAt: FormControl<PlaylistSongFormRawValue['addedAt']>;
  playlist: FormControl<PlaylistSongFormRawValue['playlist']>;
  song: FormControl<ISong | null>;
};

export type PlaylistSongFormGroup = FormGroup<PlaylistSongFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PlaylistSongFormService {
  createPlaylistSongFormGroup(playlistSong?: PlaylistSongFormGroupInput): PlaylistSongFormGroup {
    const playlistSongRawValue = this.convertPlaylistSongToPlaylistSongRawValue({
      ...this.getFormDefaults(),
      ...(playlistSong ?? { id: null }),
    });
    return new FormGroup<PlaylistSongFormGroupContent>({
      id: new FormControl(
        { value: playlistSongRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      position: new FormControl(playlistSongRawValue.position),
      addedAt: new FormControl(playlistSongRawValue.addedAt),
      playlist: new FormControl(playlistSongRawValue.playlist, {
        validators: [Validators.required],
      }),
      song: new FormControl<ISong | null>(playlistSongRawValue.song ?? null, {
        validators: [Validators.required],
      }),
    });
  }

  getPlaylistSong(form: PlaylistSongFormGroup): IPlaylistSong | NewPlaylistSong {
    return this.convertPlaylistSongRawValueToPlaylistSong(form.getRawValue() as PlaylistSongFormRawValue | NewPlaylistSongFormRawValue);
  }

  resetForm(form: PlaylistSongFormGroup, playlistSong: PlaylistSongFormGroupInput): void {
    const playlistSongRawValue = this.convertPlaylistSongToPlaylistSongRawValue({ ...this.getFormDefaults(), ...playlistSong });
    form.reset({
      ...playlistSongRawValue,
      id: { value: playlistSongRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): PlaylistSongFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      addedAt: currentTime,
    };
  }

  private convertPlaylistSongRawValueToPlaylistSong(
    rawPlaylistSong: PlaylistSongFormRawValue | NewPlaylistSongFormRawValue,
  ): IPlaylistSong | NewPlaylistSong {
    return {
      ...rawPlaylistSong,
      addedAt: dayjs(rawPlaylistSong.addedAt, DATE_TIME_FORMAT),
    };
  }

  private convertPlaylistSongToPlaylistSongRawValue(
    playlistSong: IPlaylistSong | (Partial<NewPlaylistSong> & PlaylistSongFormDefaults),
  ): PlaylistSongFormRawValue | PartialWithRequiredKeyOf<NewPlaylistSongFormRawValue> {
    return {
      ...playlistSong,
      addedAt: playlistSong.addedAt ? playlistSong.addedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
