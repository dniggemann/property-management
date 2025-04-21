import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
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
import { Property } from '../../shared/types/property';
import { CrudAction } from '../../shared/crud-action';

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
  templateUrl: './property-dialog-content.component.html',
  styleUrl: './property-dialog-content.component.scss',
})

/**
 * Content for a Material Dialog to perform create-, update- and delete-actions for a `property`.
 */
export class propertyDialogContentComponent implements OnInit, OnDestroy {
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
  private dialogRef = inject(MatDialogRef<propertyDialogContentComponent>);
  private matSnackbarService = inject(MatSnackBar);
  private propertiesService = inject(PropertiesService);
  private addressAutocompleteService = inject(AddressAutocompleteService);
  private destroy$ = new Subject();
  /**
   * Optional data that was passed into a dialog from parent component.
   * Includes `property` for edit and delete actions or no data to create a new property.
   */
  matDialogData?: { property?: Property } = inject(MAT_DIALOG_DATA);
  /**
   * isSubmitting state to disable buttons and form fields.
   */
  isSubmitting = signal(false);

  /**
   * Single form group for create and update actions
   */
  form = new FormGroup({
    description: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    address: new FormGroup(ADDRESS_FIELDSET_CHILD_CONTROLS),
  });

  /**
   * Prefills form field values if `property` data is available
   */
  ngOnInit() {
    const dialogDataProperty = this.matDialogData?.property;
    if (dialogDataProperty) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...formFields } = dialogDataProperty;
      this.form.setValue(formFields);
    }
  }

  /**
   * Triggers unsubscribe and finalizes & cleans up the subject stream.
   */
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /**
   * Sets form field values from selected autocomplete option.
   */
  onAddressAutocompleteSelected(addressNullable: AddressNullable | null) {
    if (addressNullable) {
      this.form.controls['address'].setValue({
        streetAddress: addressNullable?.streetAddress || '',
        postalCode: addressNullable?.postalCode || '',
        locality: addressNullable?.locality || '',
        countryName: addressNullable?.countryName || '',
      });
    }
  }

  /**
   * Performs update or create action on submit.
   */
  onSubmit(): void {
    if (this.form.valid) {
      const propertyId = this.matDialogData?.property?.id;
      if (propertyId) {
        this.updateProperty(propertyId);
      } else {
        this.createProperty();
      }
    }
  }

  /**
   * Performs delete action and closes dialog.
   */
  onDeleteButtonClick(id: Property['id']) {
    this.propertiesService
      .deleteProperty(id)
      .pipe(
        tap(() => this.isSubmitting.set(true)),
        delay(1000),
        map((data) => data),
        catchError((error) => {
          console.error(error);
          this.matSnackbarService.open(ErrorMessages.DELETE_PROPERTY_FAILED);
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.isSubmitting.set(false);
        this.dialogRef.close(CrudAction.DELETE);
      });
  }

  /**
   * Creates new property and closes dialog.
   */
  private createProperty() {
    this.propertiesService
      .createProperty(this.form.getRawValue())
      .pipe(
        tap(() => this.isSubmitting.set(true)),
        delay(1000),
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
        this.dialogRef.close(CrudAction.CREATE);
      });
  }

  /**
   * Updates new property and closes dialog.
   */
  private updateProperty(id: Property['id']) {
    this.propertiesService
      .updateProperty({ ...this.form.getRawValue(), id })
      .pipe(
        tap(() => this.isSubmitting.set(true)),
        delay(1000),
        map((data) => data),
        catchError((error) => {
          console.error(error);
          this.matSnackbarService.open(ErrorMessages.UPDATE_PROPERTY_FAILED);
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.isSubmitting.set(false);
        this.dialogRef.close(CrudAction.UPDATE);
      });
  }
}
