import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class RegisterValidators {
  static match(controlName: string, matchingControlName: string): ValidatorFn {

    // factory function
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) {
        console.error('Form control can not be found in the form group');

        return { controlNotFound: false };
      }

      const errors =
        control.value === matchingControl.value ? null : { noMatch: true };

      matchingControl.setErrors(errors);
      return errors;
    };
  }
}
