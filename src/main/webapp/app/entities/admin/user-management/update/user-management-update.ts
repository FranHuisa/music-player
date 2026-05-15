import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

import { LANGUAGES } from 'app/config/language.constants';
import { AlertError } from 'app/shared/alert/alert-error';
import { FindLanguageFromKeyPipe, TranslateDirective } from 'app/shared/language';
import { AuthorityService } from '../../authority/service/authority.service';
import { UserManagementService } from '../service/user-management.service';
import { IUserManagement } from '../user-management.model';

const userTemplate = {} as IUserManagement;

const newUser: IUserManagement = {
  langKey: 'es',
  activated: true,
} as IUserManagement;

@Component({
  selector: 'jhi-user-management-update',
  templateUrl: './user-management-update.html',
  imports: [FindLanguageFromKeyPipe, TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class UserManagementUpdate implements OnInit {
  languages = LANGUAGES;
  readonly isSaving = signal(false);

  editForm = new FormGroup({
    id: new FormControl(userTemplate.id),
    login: new FormControl(userTemplate.login, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
      ],
    }),
    firstName: new FormControl(userTemplate.firstName, { validators: [Validators.maxLength(50)] }),
    lastName: new FormControl(userTemplate.lastName, { validators: [Validators.maxLength(50)] }),
    email: new FormControl(userTemplate.email, {
      nonNullable: true,
      validators: [Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    activated: new FormControl(userTemplate.activated, { nonNullable: true }),
    langKey: new FormControl(userTemplate.langKey, { nonNullable: true }),
    authorities: new FormControl(userTemplate.authorities, { nonNullable: true }),
  });

  protected readonly authorityService = inject(AuthorityService);
  readonly authorities = computed(() => this.authorityService.authorities().map(authority => authority.name));
  private readonly userService = inject(UserManagementService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.authorityService.authoritiesParams.set({});
  }

  ngOnInit(): void {
    this.route.data.subscribe(({ userManagement }) => {
      if (userManagement) {
        this.editForm.reset(userManagement);
      } else {
        this.editForm.reset(newUser);
      }
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    const user = this.editForm.getRawValue();
    const isNew = user.id === null;

    Swal.fire({
      title: isNew ? '¿Crear usuario?' : '¿Guardar cambios?',
      text: isNew ? `Se creará el usuario "${user.login}".` : `Se actualizarán los datos de "${user.login}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: isNew ? 'Sí, crear' : 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      background: '#0f172a',
      color: '#ffffff',
    }).then(result => {
      if (result.isConfirmed) {
        this.isSaving.set(true);
        if (isNew) {
          this.userService.create(user).subscribe({
            next: () => this.onSaveSuccess(isNew),
            error: () => this.onSaveError(),
          });
        } else {
          this.userService.update(user).subscribe({
            next: () => this.onSaveSuccess(isNew),
            error: () => this.onSaveError(),
          });
        }
      }
    });
  }

  private onSaveSuccess(isNew: boolean): void {
    this.isSaving.set(false);
    Swal.fire({
      title: isNew ? '¡Usuario creado!' : '¡Cambios guardados!',
      text: isNew ? 'El usuario ha sido creado correctamente.' : 'Los datos han sido actualizados correctamente.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      color: '#ffffff',
      background: '#0f172a',
    }).then(() => this.previousState());
  }

  private onSaveError(): void {
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
}
