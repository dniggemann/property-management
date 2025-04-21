import { Property } from '../../shared/types/property';

export interface RowDataItem {
  id: Property['id'];
  description: Property['description'];
  address: string;
}
