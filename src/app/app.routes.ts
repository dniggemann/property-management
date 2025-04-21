import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContactsOverviewComponent } from './contacts/contacts-overview/contacts-overview.component';
import { PropertiesOverviewComponent } from './properties/properties-overview/properties-overview.component';
import { RelationsOverviewComponent } from './relations/relations-overview/relations-overview.component';
import { RoutePath } from './shared/route-path';
import { ContactsDetailComponent } from './contacts/contacts-detail/contacts-detail.component';

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
    path: `${RoutePath.CONTACTS}/${RoutePath.ID}`,
    component: ContactsDetailComponent,
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
