import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RelationsService } from '../../relations/relations.service';
import { DatePipe } from '@angular/common';
import { MatAnchor } from '@angular/material/button';
import { RoutePath } from '../../shared/route-path';

@Component({
  selector: 'app-contacts-detail',
  imports: [MatProgressSpinner, DatePipe, MatAnchor, RouterLink],
  templateUrl: './contacts-detail.component.html',
  styleUrl: './contacts-detail.component.scss',
})
/**
 * Lists relations for the selected contract by its (route param) id
 */
export class ContactsDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private relationsService = inject(RelationsService);
  routePath = RoutePath;

  private readonly routeParams = toSignal(this.route.params);
  private readonly contactId = computed(() => this.routeParams()?.['id']);
  protected readonly relationsResourceRef = rxResource({
    request: this.contactId,
    loader: ({ request: contactId }) =>
      this.relationsService.getRelationByContactId(contactId),
  });
}
