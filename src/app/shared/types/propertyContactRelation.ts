import { Property } from './property';
import { Contact } from './contact';
import { RelationTypeId } from '../relation-type-id';
import { ServiceProviderServiceId } from '../service-provider-service-id';

export type PropertyContactRelation = {
  id?: string;
  propertyId: Property['id'];
  contactId: Contact['id'];
  startDate: string;
  endDate: string;
} & (
  | {
      typeId: RelationTypeId.TENANT | RelationTypeId.OWNER;
    }
  | {
      typeId: RelationTypeId.SERVICE_PROVIDER;
      serviceIds: ServiceProviderServiceId[];
    }
);
