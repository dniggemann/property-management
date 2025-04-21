import { Property } from '../../shared/types/property';

export interface PropertiesState {
  isLoading: boolean;
  value: null | Property[];
  errorMessage: string | null;
}
