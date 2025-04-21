import { Contact } from '../../shared/types/contact';

export interface ContactsState {
  isLoading: boolean;
  value: null | Contact[];
  errorMessage: string | null;
}
