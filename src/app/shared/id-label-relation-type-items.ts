import { RelationTypeId } from './relation-type-id';

export const idLabelRelationTypeItems = [
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
