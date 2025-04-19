import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GooglePlacesAutocompleteSuggestionsResponse } from './types/google-places-autocomplete-suggestions-response';
import { PlaceAddressState } from './types/place-address-state';
import { ErrorMessages } from '../error-messages';
import { AddressNullable } from '../types/address-nullable';
import PlacePrediction = google.maps.places.PlacePrediction;
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
/**
 * Service to load autocomplete suggestions and place details via Google Places API
 */
export class AddressAutocompleteService {
  private readonly http = inject(HttpClient);
  private readonly googlePlacesAutocompleteApiUrl =
    'https://places.googleapis.com/v1/places:autocomplete';
  /**
   * The Places service is a self-contained library. To use the functionality contained within this library, it is
   * required to load it using a <script> tag.
   * https://developers.google.com/maps/documentation/javascript/places
   *
   * `google.maps.places.PlacesService` is used instead of `google.maps.places.Place` because of missing types.
   */
  private readonly googlePlacesService = new google.maps.places.PlacesService(
    new google.maps.Map(document.createElement('div')),
  );

  readonly addressIsLoading = computed(() => this.addressState().isLoading);
  readonly address = computed(() => this.addressState().value);
  readonly addressErrorMessage = computed(
    () => this.addressState().errorMessage,
  );

  private addressState = signal<PlaceAddressState>({
    isLoading: false,
    value: null,
    errorMessage: null,
  });

  /**
   * POST request to load autocomplete suggestions
   */
  getAutocompleteSuggestions(input: string) {
    return this.http.post<GooglePlacesAutocompleteSuggestionsResponse>(
      this.googlePlacesAutocompleteApiUrl,
      {
        input,
        languageCode: 'de',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': environment.googlePlacesApiKey,
          'X-Goog-FieldMask': '*',
        },
      },
    );
  }

  /**
   * Retrieves details about the `place` identified by the given `placeId` and updates state signal.
   * Workaround using Google Maps JavaScript API. Places API is missing CORS with client side GET requests!
   */
  getAddressByPlaceId(placeId: PlacePrediction['placeId']) {
    this.setLoadingState(true);
    return this.googlePlacesService.getDetails(
      { placeId, language: 'de', region: 'de' },
      (response) => {
        if (response?.adr_address) {
          this.setAddressState(this.parseAdrMicroformat(response.adr_address));
        } else {
          console.error('Retrieving place address failed.');
          this.setAddressState(null);
          this.setErrorMessageState(
            ErrorMessages.GET_ADDRESS_BY_PLACE_ID_FAILED,
          );
        }
      },
    );
  }

  /**
   * Update `state` signal's `isLoading` and `errorMessage` property and notify any dependents.
   */
  private setLoadingState(isLoading: boolean) {
    this.addressState.update((state) => ({
      ...state,
      isLoading: isLoading,
      errorMessage: null,
    }));
  }

  /**
   * Update `state` signal's `errorMessage` property and notify any dependents.
   */
  private setErrorMessageState(errorMessage: string) {
    this.addressState.update((state) => ({
      ...state,
      errorMessage: errorMessage,
    }));
  }

  /**
   * Update `state` signal's `address` and `isLoading` property and notify any dependents.
   */
  private setAddressState(address: AddressNullable | null): void {
    this.addressState.update((state) => ({
      ...state,
      value: address,
      isLoading: false,
    }));
  }

  /**
   * Parse a representation of a place's address in the adr microformat.
   * https://microformats.org/wiki/adr#Property_List
   * https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult.adr_address
   */
  private parseAdrMicroformat(htmlString: string): AddressNullable {
    const adrDocument = new DOMParser().parseFromString(
      htmlString,
      'text/html',
    );
    const getValueByQuerySelector = (selectors: string) =>
      adrDocument.querySelector(selectors)?.textContent || null;
    return {
      streetAddress: getValueByQuerySelector('.street-address'),
      locality: getValueByQuerySelector('.locality'),
      postalCode: getValueByQuerySelector('.postal-code'),
      countryName: getValueByQuerySelector('.country-name'),
    };
  }
}
