import {
  Component,
  computed,
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
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  catchError,
  delay,
  EMPTY,
  map,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { Contact } from '../../shared/types/contact';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorMessages } from '../../shared/error-messages';
import { CrudAction } from '../../shared/crud-action';
import { PropertyContactRelation } from '../../shared/types/propertyContactRelation';
import { RelationsService } from '../relations.service';
import { RelationTypeId } from '../../shared/relation-type-id';
import { ContactsService } from '../../contacts/contacts.service';
import { PropertiesService } from '../../properties/properties.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ServiceId } from '../../shared/service-id';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import {
  MatFormField,
  MatInput,
  MatInputModule,
  MatLabel,
} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { idLabelServiceItems } from '../../shared/id-label-service-items';
import { idLabelRelationTypeItems } from '../../shared/id-label-relation-type-items';
import { MatSelect } from '@angular/material/select';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { IdLabelItem } from '../../shared/types/id-label-item';

@Component({
  selector: 'app-relation-dialog-content',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatProgressSpinner,
    MatAutocomplete,
    FormsModule,
    MatAutocompleteTrigger,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatOption,
    MatDialogTitle,
    MatDialogContent,
    MatButton,
    MatDialogActions,
    MatIcon,
    MatDialogClose,
    MatProgressBar,
    MatSelect,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './relation-dialog-content.component.html',
  styleUrl: './relation-dialog-content.component.scss',
})

/**
 * Content for a Material Dialog to perform create-, update- and delete-actions for a `relation`.
 */
export class RelationDialogContentComponent implements OnInit, OnDestroy {
  constructor() {
    effect(() => {
      // Disable form if submitting.
      if (this.isPending()) {
        this.form.disable();
      } else {
        this.form.enable();
      }

      // Prefill form fields for edit dialog after option data has been loaded
      const contactOptions = this.contactOptions();
      const propertyOptions = this.propertyOptions();

      if (contactOptions && propertyOptions) {
        const dialogDataRelation = this.matDialogData?.relation;
        if (dialogDataRelation && dialogDataRelation.id) {
          this.form.controls.contact.setValue(
            contactOptions.find(
              (option) => option.id === dialogDataRelation.contactId,
            ),
          );
          this.form.controls.property.setValue(
            propertyOptions.find(
              (option) => option.id === dialogDataRelation.propertyId,
            ),
          );
          this.form.controls.type.setValue(
            idLabelRelationTypeItems.find(
              (item) => item.id === dialogDataRelation.typeId,
            ),
          );
          if (dialogDataRelation.serviceIds && this.form.controls.services) {
            this.form.controls.services.setValue(dialogDataRelation.serviceIds);
          }
          this.form.controls.startDate.setValue(dialogDataRelation.startDate);
          this.form.controls.endDate.setValue(dialogDataRelation.endDate);
        }
      }
    });
  }

  private dialogRef = inject(MatDialogRef<RelationDialogContentComponent>);
  private matSnackbarService = inject(MatSnackBar);
  private relationsService = inject(RelationsService);
  private contactsService = inject(ContactsService);
  private propertiesService = inject(PropertiesService);
  private destroy$ = new Subject();

  readonly isLoadingContacts = this.contactsService.isLoading;
  readonly contactsErrorMessage = this.contactsService.errorMessage;
  readonly contacts = this.contactsService.value;
  readonly isLoadingProperties = this.propertiesService.isLoading;
  readonly propertiesErrorMessage = this.propertiesService.errorMessage;
  readonly properties = this.propertiesService.value;

  // Load contact options for autocomplete fields
  contactOptions = computed(() =>
    this.contacts()?.map((contact) => {
      return {
        id: contact.id,
        label: `${contact.name}, ${contact.address.streetAddress}, ${contact.address.postalCode} ${contact.address.locality}, ${contact.address.countryName}`,
      };
    }),
  );
  // Load property options for autocomplete fields
  propertyOptions = computed(() =>
    this.properties()?.map((property) => {
      return {
        id: property.id,
        label: `${property.address.streetAddress}, ${property.address.postalCode} ${property.address.locality}, ${property.address.countryName}`,
      };
    }),
  );

  relationTypeOptions = idLabelRelationTypeItems;
  servicesOptions = idLabelServiceItems;

  /**
   * Optional data that was passed into a dialog from parent component.
   * Includes `relation` for edit and delete actions or no data to create a new relation.
   */
  matDialogData?: { relation?: PropertyContactRelation } =
    inject(MAT_DIALOG_DATA);
  /**
   * isPending state to disable buttons and form fields.
   */
  isPending = signal(false);
  /**
   * Error state for date ranges. Is set to `true` if selected contact has existing relation as tenant with overlapping date range.
   */
  hasDateRangeError = false;
  /**
   * Single form group for create and update actions
   */
  form = new FormGroup<{
    property: FormControl;
    contact: FormControl;
    type: FormControl;
    services?: FormControl;
    startDate: FormControl;
    endDate: FormControl;
  }>({
    property: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    contact: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    type: new FormControl(null, {
      nonNullable: true,
      validators: Validators.required,
    }),
    startDate: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    endDate: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  /**
   * Load data and handle displaying service field
   */
  ngOnInit() {
    // load contacts and properties to prepare select options
    this.contactsService.loadContacts();
    this.propertiesService.loadProperties();

    // Add and remove service field
    this.form.controls.type.valueChanges
      .pipe(
        // emit value immediately and not only on value changes to disable unchanged controls correctly.
        startWith(this.form.controls.type.value),
        map((type) => type),
        takeUntil(this.destroy$),
      )
      .subscribe((relationType) => {
        if (relationType?.id === RelationTypeId.SERVICE_PROVIDER) {
          this.form.addControl(
            'services',
            new FormControl<ServiceId[]>(
              this.matDialogData?.relation?.serviceIds || [],
              {
                nonNullable: true,
                validators: Validators.required,
              },
            ),
          );
        } else {
          this.form.removeControl('services');
        }
      });
  }

  /**
   * Triggers unsubscribe and finalizes & cleans up the subject stream.
   */
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /**
   * Performs update or create action on submit.
   */
  onSubmit(): void {
    if (this.form.valid) {
      this.getDateRangeValidity(
        this.form.controls.contact.value,
        this.form.controls.startDate.value,
        this.form.controls.endDate.value,
      ).subscribe((isDateRangeValid) => {
        // TODO: Needs to be cleaned up. See `getDateRangeValidity()`
        if (isDateRangeValid) {
          this.hasDateRangeError = false;
          const relationId = this.matDialogData?.relation?.id;
          if (relationId) {
            this.updateRelation(relationId);
          } else {
            this.createRelation();
          }
        } else {
          this.hasDateRangeError = true;
        }
      });
    }
  }

  /**
   * Performs delete action and closes dialog.
   */
  onDeleteButtonClick(id: PropertyContactRelation['id']) {
    this.relationsService
      .deletePropertyContactRelation(id)
      .pipe(
        tap(() => this.isPending.set(true)),
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
        this.isPending.set(false);
        this.dialogRef.close(CrudAction.DELETE);
      });
  }

  /**
   * Creates new relation and closes dialog.
   */
  private createRelation() {
    // TODO: Create helper function to transform formRawValue to Payload
    const formValue = this.form.getRawValue();
    const payload: PropertyContactRelation = {
      propertyId: formValue.property.id,
      contactId: formValue.contact.id,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      typeId: formValue.type.id,
      serviceIds: formValue.services,
    };

    this.relationsService
      .createPropertyContactRelation(payload)
      .pipe(
        tap(() => this.isPending.set(true)),
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
        this.isPending.set(false);
        this.dialogRef.close(CrudAction.CREATE);
      });
  }

  /**
   * Updates relation and closes dialog.
   */
  private updateRelation(id: PropertyContactRelation['id']) {
    // TODO: Create helper function to transform formRawValue to Payload
    const formValue = this.form.getRawValue();
    const payload: PropertyContactRelation = {
      id: id,
      propertyId: formValue.property.id,
      contactId: formValue.contact.id,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      typeId: formValue.type.id,
      serviceIds: formValue.services,
    };

    this.relationsService
      .updatePropertyContactRelation(payload)
      .pipe(
        tap(() => this.isPending.set(true)),
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
        this.isPending.set(false);
        this.dialogRef.close(CrudAction.UPDATE);
      });
  }

  /**
   * Validates if date range overlaps with existing relation of contact if relation is of type "tenant"
   * NOTE: Should be a `AsyncValidatorFn`, but `distinctUntilChanged` or `debounce` have no effect because a new
   * Observable is created each time the validator is called, which leads to multiple HTTP calls!!!
   * Quick workaround solution.
   */
  private getDateRangeValidity(
    contact: Contact,
    startDate: string,
    endDate: string,
  ): Observable<boolean> {
    if (!contact.id) {
      throw new Error('No contactId was provided.');
    }
    return this.relationsService.getRelationByContactId(contact.id).pipe(
      tap(() => this.isPending.set(true)),
      map((result) => {
        this.isPending.set(false);
        // check for overlap conditions or return true if no relations are found
        // TODO: Create util function
        return result.relations.length > 0
          ? !!result.relations.find(
              (relation) =>
                Date.parse(endDate) <= Date.parse(relation.startDate) ||
                Date.parse(startDate) >= Date.parse(relation.endDate),
            )
          : true;
      }),
      catchError((error) => {
        this.isPending.set(false);
        console.error(error);
        this.matSnackbarService.open(ErrorMessages.FORM_VALIDATION_FAILED);
        return of(false);
      }),
      takeUntil(this.destroy$),
    );
  }

  /**
   * Shows readable label for selected option in form controls
   */
  selectedOptionIdToLabel(option: IdLabelItem | null) {
    return option?.label || '';
  }
}
