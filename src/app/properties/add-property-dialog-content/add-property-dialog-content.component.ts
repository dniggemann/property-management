import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { PropertiesService } from '../properties.service';
import { catchError, delay, EMPTY, map, Subject, takeUntil, tap } from 'rxjs';
import { ErrorMessages } from '../../shared/error-messages';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { AddressAutocompleteComponent } from '../../shared/address-autocomplete/address-autocomplete.component';
import {
  AddressFieldsetComponent,
  ADDRESS_FIELDSET_CHILD_CONTROLS,
} from '../../shared/address-fieldset/address-fieldset.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AddressNullable } from '../../shared/types/address-nullable';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { AddressAutocompleteService } from '../../shared/address-autocomplete/address-autocomplete.service';

@Component({
  selector: 'app-add-property-dialog-content',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatIcon,
    MatDialogClose,
    MatProgressSpinner,
    AddressAutocompleteComponent,
    AddressFieldsetComponent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
  ],
  templateUrl: './add-property-dialog-content.component.html',
  styleUrl: './add-property-dialog-content.component.scss',
})
export class AddPropertyDialogContentComponent implements OnDestroy {
  constructor() {
    effect(() => {
      // Disable form if address autocompletion is loading or form is submitting.
      const shouldDisableForm =
        this.addressAutocompleteService.addressIsLoading() ||
        this.isSubmitting();
      if (shouldDisableForm) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }
  private dialogRef = inject(MatDialogRef<AddPropertyDialogContentComponent>);
  private matSnackbarService = inject(MatSnackBar);
  private propertiesService = inject(PropertiesService);
  private addressAutocompleteService = inject(AddressAutocompleteService);
  private destroy$ = new Subject();

  isSubmitting = signal(false);

  form = new FormGroup({
    description: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    address: new FormGroup(ADDRESS_FIELDSET_CHILD_CONTROLS),
  });

  onAddressAutocompleteSelected(addressNullable: AddressNullable | null) {
    this.form.controls['address'].setValue({
      streetAddress: addressNullable?.streetAddress || '',
      postalCode: addressNullable?.postalCode || '',
      locality: addressNullable?.locality || '',
      countryName: addressNullable?.countryName || '',
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.propertiesService
        .createProperty(this.form.getRawValue())
        .pipe(
          tap(() => this.isSubmitting.set(true)),
          delay(10000),
          map((data) => data),
          catchError((error) => {
            console.error(error);
            this.matSnackbarService.open(ErrorMessages.CREATE_PROPERTY_FAILED);
            return EMPTY;
          }),
          takeUntil(this.destroy$),
        )
        .subscribe(() => {
          this.isSubmitting.set(false);
          this.dialogRef.close(true);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true); // trigger the unsubscribe
    this.destroy$.complete(); // finalize & clean up the subject stream
  }
}
