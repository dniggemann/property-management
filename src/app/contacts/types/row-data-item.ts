import { Contact } from '../../shared/types/contact';

export interface RowDataItem {
  id: Contact['id'];
  name: Contact['name'];
  address: string;
}
