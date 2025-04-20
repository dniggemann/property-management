import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import {
  MatListItem,
  MatListItemIcon,
  MatNavList,
} from '@angular/material/list';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MenuItem } from './shared/types/menu-item';
import { RoutePath } from './shared/route-path';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbar,
    MatToolbarRow,
    MatSidenavContainer,
    MatNavList,
    MatListItem,
    MatSidenav,
    MatSidenavContent,
    MatIconButton,
    MatIcon,
    MatListItemIcon,
    RouterLink,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'property-management';

  menuItems: MenuItem[] = [
    {
      iconName: 'dashboard',
      label: 'Dashboard',
      routePath: RoutePath.DASHBOARD,
    },
    {
      iconName: 'contacts',
      label: 'Kontakte',
      routePath: RoutePath.CONTACTS,
    },
    {
      iconName: 'home_work',
      label: 'Immobilien',
      routePath: RoutePath.PROPERTIES,
    },
    {
      iconName: 'account_tree',
      label: 'Beziehungen',
      routePath: RoutePath.RELATIONS,
    },
  ];
}
