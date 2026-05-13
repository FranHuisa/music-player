import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ISong, NewSong } from '../song.model';
import { IArtist } from 'app/entities/artist/artist.model';
import { IAlbum } from 'app/entities/album/album.model';
import { IGenre } from 'app/entities/genre/genre.model';

type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

type SongFormGroupInput = ISong | PartialWithRequiredKeyOf<NewSong>;

type FormValueOf<T extends ISong | NewSong> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

type SongFormRawValue = FormValueOf<ISong>;
type NewSongFormRawValue = FormValueOf<NewSong>;

type SongFormDefaults = Pick<NewSong, 'id' | 'createdAt' | 'artistses'>;

type SongFormGroupContent = {
  id: FormControl<SongFormRawValue['id'] | NewSong['id']>;
  title: FormControl<SongFormRawValue['title']>;
  duration: FormControl<SongFormRawValue['duration']>;
  fileUrl: FormControl<SongFormRawValue['fileUrl']>;
  coverImage: FormControl<SongFormRawValue['coverImage']>;
  lyrics: FormControl<SongFormRawValue['lyrics']>;
  releaseDate: FormControl<SongFormRawValue['releaseDate']>;
  createdAt: FormControl<SongFormRawValue['createdAt']>;
  album: FormControl<IAlbum | null>;
  genre: FormControl<IGenre | null>;
  artistses: FormControl<IArtist[]>;
  artistsText: FormControl<string | null>;
};

export type SongFormGroup = FormGroup<SongFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SongFormService {
  createSongFormGroup(song?: SongFormGroupInput): SongFormGroup {
    const songRawValue = this.convertSongToRaw({
      ...this.getFormDefaults(),
      ...(song ?? { id: null }),
    });

    return new FormGroup<SongFormGroupContent>({
      id: new FormControl({ value: songRawValue.id, disabled: true }, { nonNullable: true }),

      title: new FormControl(songRawValue.title, {
        validators: [Validators.required, Validators.maxLength(150)],
      }),

      duration: new FormControl(songRawValue.duration),

      fileUrl: new FormControl(songRawValue.fileUrl),

      coverImage: new FormControl(songRawValue.coverImage),

      lyrics: new FormControl(songRawValue.lyrics),

      releaseDate: new FormControl(songRawValue.releaseDate),

      createdAt: new FormControl(songRawValue.createdAt),

      album: new FormControl(songRawValue.album ?? null),

      genre: new FormControl(songRawValue.genre ?? null),

      artistses: new FormControl(songRawValue.artistses ?? []),

      artistsText: new FormControl(songRawValue.artistses?.map((a: any) => a.name).join(', ') ?? ''),
    });
  }

  getSong(form: SongFormGroup): ISong | NewSong {
    const raw = form.getRawValue();

    return {
      ...raw,
      createdAt: raw.createdAt ? dayjs(raw.createdAt, DATE_TIME_FORMAT) : null,
    };
  }

  resetForm(form: SongFormGroup, song: SongFormGroupInput): void {
    const songRawValue = this.convertSongToRaw(song);

    form.reset({
      ...songRawValue,
      id: { value: songRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): SongFormDefaults {
    return {
      id: null,
      createdAt: dayjs(),
      artistses: [],
    };
  }

  private convertSongToRaw(song: any): any {
    return {
      ...song,
      createdAt: song.createdAt ? song.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
