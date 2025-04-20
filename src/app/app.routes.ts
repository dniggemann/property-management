import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContactsOverviewComponent } from './contacts/contacts-overview/contacts-overview.component';
import { PropertiesOverviewComponent } from './properties/properties-overview/properties-overview.component';
import { RelationsOverviewComponent } from './relations/relations-overview/relations-overview.component';
import { RoutePath } from './shared/route-path';

export const routes: Routes = [
  {
    path: RoutePath.DASHBOARD,
    component: DashboardComponent,
  },
  {
    path: RoutePath.CONTACTS,
    component: ContactsOverviewComponent,
  },
  {
    path: RoutePath.PROPERTIES,
    component: PropertiesOverviewComponent,
  },
  {
    path: RoutePath.RELATIONS,
    component: RelationsOverviewComponent,
  },
];
