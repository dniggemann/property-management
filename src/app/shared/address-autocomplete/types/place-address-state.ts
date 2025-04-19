import { AddressNullable } from '../../types/address-nullable';

export interface PlaceAddressState {
  isLoading: boolean;
  value: null | AddressNullable;
  errorMessage: string | null;
}
