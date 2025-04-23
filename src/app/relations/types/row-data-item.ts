import { Property } from '../../shared/types/property';
import { Contact } from '../../shared/types/contact';
import { RelationTypeId } from '../../shared/relation-type-id';
import { PropertyContactRelation } from '../../shared/types/propertyContactRelation';

export interface RowDataItem {
  id: PropertyContactRelation['id'];
  propertyId: Property['id'];
  contactId: Contact['id'];
  startDate: string;
  endDate: string;
  typeId: RelationTypeId;
  serviceIds?: string;
}
