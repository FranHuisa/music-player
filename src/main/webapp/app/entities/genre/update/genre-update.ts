import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IGenre } from '../genre.model';
import { GenreService } from '../service/genre.service';

import { GenreFormGroup, GenreFormService } from './genre-form.service';

@Component({
  selector: 'jhi-genre-update',
  templateUrl: './genre-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class GenreUpdate implements OnInit {
  readonly isSaving = signal(false);
  genre: IGenre | null = null;

  protected genreService = inject(GenreService);
  protected genreFormService = inject(GenreFormService);
  protected activatedRoute = inject(ActivatedRoute);

  editForm: GenreFormGroup = this.genreFormService.createGenreFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ genre }) => {
      this.genre = genre;
      if (genre) {
        this.updateForm(genre);
      }
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    const genre = this.genreFormService.getGenre(this.editForm);
    const isNew = genre.id === null;

    Swal.fire({
      title: isNew ? '¿Crear género?' : '¿Guardar cambios?',
      text: isNew ? `Se creará el género "${genre.name}".` : `Se actualizará el género "${genre.name}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: isNew ? 'Sí, crear' : 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      color: '#ffffff',
      background: '#0f172a',
    }).then(result => {
      if (result.isConfirmed) {
        this.isSaving.set(true);
        if (isNew) {
          this.subscribeToSaveResponse(this.genreService.create(genre));
        } else {
          this.subscribeToSaveResponse(this.genreService.update(genre));
        }
      }
    });
  }

  protected subscribeToSaveResponse(result: Observable<IGenre | null>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.isSaving.set(false);
    Swal.fire({
      title: '¡Guardado!',
      text: 'El género ha sido guardado correctamente.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      color: '#ffffff',
      background: '#0f172a',
    }).then(() => this.previousState());
  }

  protected onSaveError(): void {
    this.isSaving.set(false);
    Swal.fire({
      title: 'Error',
      text: 'Ha ocurrido un error al guardar. Por favor, inténtalo de nuevo.',
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      color: '#ffffff',
      background: '#0f172a',
    });
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(genre: IGenre): void {
    this.genre = genre;
    this.genreFormService.resetForm(this.editForm, genre);
  }
}
