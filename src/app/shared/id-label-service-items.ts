import { ServiceId } from './service-id';

export const idLabelServiceItems = [
  {
    id: ServiceId.CONSTRUCTION,
    label: 'Bau',
  },
  {
    id: ServiceId.FINANCING,
    label: 'Finanzierung',
  },
  {
    id: ServiceId.MANAGEMENT,
    label: 'Verwaltung',
  },
  {
    id: ServiceId.MARKETING,
    label: 'Marketing',
  },
] as const;
