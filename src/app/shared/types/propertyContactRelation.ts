import { Property } from './property';
import { Contact } from './contact';
import { RelationTypeId } from '../relation-type-id';
import { ServiceId } from '../service-id';

export interface PropertyContactRelation {
  id?: string;
  propertyId: Property['id'];
  contactId: Contact['id'];
  startDate: string;
  endDate: string;
  typeId: RelationTypeId;
  serviceIds?: ServiceId[];
}
