import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AngularFireAuth) {}

  // we converted into arrow function because context of "this" been changed when use in another components
  validate = (
    control: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return this.auth
      .fetchSignInMethodsForEmail(control.value)
      .then((res) => (res.length ? { emailTaken: true } : null));
  };
}
