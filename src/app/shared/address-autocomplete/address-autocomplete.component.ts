import { Component, effect, inject, output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, filter, map, of, switchMap } from 'rxjs';
import { isNonEmptyString } from '../../utils/typeguards/isNonEmptyString';
import { AddressAutocompleteService } from './address-autocomplete.service';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatSuffix,
} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import PlacePrediction = google.maps.places.PlacePrediction;
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorMessages } from '../error-messages';
import { AddressNullable } from '../types/address-nullable';

@Component({
  selector: 'app-address-autocomplete',
  imports: [
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSuffix,
    MatFormField,
    ReactiveFormsModule,
  ],
  templateUrl: './address-autocomplete.component.html',
  styleUrl: './address-autocomplete.component.scss',
})
/**
 * Address autocomplete component
 * Uses `AddressAutocompleteService` to handle data state
 */
export class AddressAutocompleteComponent {
  constructor() {
    effect(() => {
      const addressErrorMessage =
        this.addressAutocompleteService.addressErrorMessage();
      if (addressErrorMessage) {
        this.matSnackbarService.open(addressErrorMessage);
      }
      this.optionSelected.emit(this.addressAutocompleteService.address());
    });
  }
  private addressAutocompleteService = inject(AddressAutocompleteService);
  private matSnackbarService = inject(MatSnackBar);

  optionSelected = output<AddressNullable | null>();
  /**
   * Address autocomplete form control
   */
  protected addressAutocompleteControl = new FormControl<string>('');
  /**
   * PlaceId of selected autocomplete option value
   */
  private selectedPlaceId = signal<PlacePrediction['placeId'] | undefined>(
    undefined,
  );
  /**
   * Autocomplete suggestions signal
   */
  protected autocompleteSuggestions = toSignal(
    this.addressAutocompleteControl.valueChanges.pipe(
      debounceTime(500),
      // Google Autocomplete API throws error if value is empty
      filter((controlValue) => isNonEmptyString(controlValue)),
      switchMap((controlValue) =>
        this.addressAutocompleteService
          .getAutocompleteSuggestions(controlValue)
          .pipe(
            map((response) => response.suggestions),
            catchError((err) => {
              console.error(err);
              this.matSnackbarService.open(
                ErrorMessages.GET_ADDRESS_AUTOCOMPLETE_SUGGESTIONS_FAILED,
              );
              return of(undefined);
            }),
          ),
      ),
    ),
  );

  /**
   * Handles selected autocomplete option
   */
  protected onSelectedAutocompleteOption(value: PlacePrediction) {
    this.selectedPlaceId.set(value.placeId);
    this.addressAutocompleteService.getAddressByPlaceId(value.placeId);
  }

  /**
   * Maps option's control value to a human-readable name for the returned place prediction.
   */
  protected mapSelectedOptionToDisplayValue(
    optionControlValue: PlacePrediction | undefined,
  ) {
    return optionControlValue ? optionControlValue.text.text : '';
  }
}
