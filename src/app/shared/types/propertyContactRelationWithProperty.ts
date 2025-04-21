import { Property } from './property';
import { PropertyContactRelation } from './propertyContactRelation';

export type PropertyContactRelationWithProperty = PropertyContactRelation & {
  property: Property;
};
