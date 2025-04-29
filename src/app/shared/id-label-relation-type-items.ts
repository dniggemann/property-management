import { RelationTypeId } from './relation-type-id';
import { IdLabelItem } from './types/id-label-item';

export interface IdLabelRelationTypeItem extends IdLabelItem {
  id: RelationTypeId;
}

export const idLabelRelationTypeItems: IdLabelRelationTypeItem[] = [
  {
    id: RelationTypeId.TENANT,
    label: 'Mieter',
  },
  {
    id: RelationTypeId.OWNER,
    label: 'Eigentümer',
  },
  {
    id: RelationTypeId.SERVICE_PROVIDER,
    label: 'Dienstleister',
  },
] as const;
