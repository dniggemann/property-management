import { PropertyContactRelation } from '../../shared/types/propertyContactRelation';

export interface RelationsState {
  isLoading: boolean;
  value: null | PropertyContactRelation[];
  errorMessage: string | null;
}
