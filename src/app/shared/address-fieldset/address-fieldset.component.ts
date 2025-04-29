import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {
  ControlContainer,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-address-fieldset',
  imports: [MatFormField, MatLabel, MatInput, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  templateUrl: './address-fieldset.component.html',
  styleUrl: './address-fieldset.component.scss',
})
// TODO: Implement as Custom Form Inputs with ControlValueAccessor
export class AddressFieldsetComponent implements OnInit, OnDestroy {
  /**
   * Tracks the name of the `FormGroup` bound to the parent `FormGroup` directive.
   */
  controlName = input.required<string>();
  /**
   * Corresponding [formGroup] directive instance.
   */
  parentContainer = inject(ControlContainer);
  /**
   * Instance of the parent form group model.
   */
  get parentFormGroup() {
    if (this.parentContainer.control instanceof FormGroup) {
      return this.parentContainer.control;
    } else {
      throw new Error('Control is not a FormGroup');
    }
  }
  /**
   * Adds control with address `FormGroup` to `parentFormGroup`.
   */
  ngOnInit(): void {
    this.parentFormGroup.addControl(
      this.controlName(),
      new FormGroup({
        streetAddress: new FormControl('', {
          nonNullable: true,
          validators: Validators.required,
        }),
        postalCode: new FormControl('', {
          nonNullable: true,
          validators: Validators.required,
        }),
        locality: new FormControl('', {
          nonNullable: true,
          validators: Validators.required,
        }),
        countryName: new FormControl('', {
          nonNullable: true,
          validators: Validators.required,
        }),
      }),
    );
  }
  /**
   * Removes control if component gets destroyed.
   */
  ngOnDestroy() {
    this.parentFormGroup.get(this.controlName())?.reset();
    this.parentFormGroup.removeControl(this.controlName());
  }
}
