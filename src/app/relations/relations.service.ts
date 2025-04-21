import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  delay,
  EMPTY,
  forkJoin,
  map,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RelationsState } from './types/relations-state';
import { PropertyContactRelation } from '../shared/types/propertyContactRelation';
import { ErrorMessages } from '../shared/error-messages';
import { Contact } from '../shared/types/contact';
import { PropertyContactRelationWithProperty } from '../shared/types/propertyContactRelationWithProperty';

@Injectable({
  providedIn: 'root',
})
export class RelationsService {
  private readonly http = inject(HttpClient);
  private readonly relationsSubject = new Subject<void>();
  private readonly relationsApiUrl = 'http://localhost:3000/relations';
  private readonly contactsApiUrl = 'http://localhost:3000/contacts';

  constructor() {
    this.relationsSubject
      .pipe(
        tap(() => this.setLoadingState(true)),
        switchMap(() => this.getRelations()),
        delay(1000),
        takeUntilDestroyed(),
      )
      .subscribe((todos) => this.setRelationsState(todos));
  }

  readonly isLoading = computed(() => this.relationsState().isLoading);
  readonly value = computed(() => this.relationsState().value);
  readonly errorMessage = computed(() => this.relationsState().errorMessage);
  private relationsState = signal<RelationsState>({
    isLoading: false,
    value: null,
    errorMessage: null,
  });

  loadRelations() {
    this.relationsSubject.next();
  }

  createPropertyContactRelation(relation: PropertyContactRelation) {
    return this.http.post<PropertyContactRelation>(
      this.relationsApiUrl,
      relation,
    );
  }

  readPropertyContactRelation(relationId: PropertyContactRelation['id']) {
    return this.http.get<PropertyContactRelation>(
      `${this.relationsApiUrl}/${relationId}`,
    );
  }

  updatePropertyContactRelation(relation: PropertyContactRelation) {
    return this.http.put<PropertyContactRelation>(
      `${this.relationsApiUrl}/${relation.id}`,
      relation,
    );
  }

  deletePropertyContactRelation(relationId: PropertyContactRelation['id']) {
    return this.http.delete<PropertyContactRelation>(
      `${this.relationsApiUrl}/${relationId}`,
    );
  }

  /**
   * Gets all relations for a contact including property- and contact-details by id.
   */
  getRelationByContactId(contactId: string) {
    return forkJoin({
      contact: this.http.get<Contact>(`${this.contactsApiUrl}/${contactId}`),
      relations: this.http.get<PropertyContactRelationWithProperty[]>(
        `${this.relationsApiUrl}?_embed=property&contactId=${contactId}`,
      ),
    });
  }

  private getRelations() {
    return this.http.get<PropertyContactRelation[]>(this.relationsApiUrl).pipe(
      map((data) => data),
      catchError((error) => {
        console.error(error);
        this.setErrorState(ErrorMessages.GET_PROPERTIES_FAILED);
        return EMPTY;
      }),
    );
  }

  private setLoadingState(isLoading: boolean) {
    this.relationsState.update((state) => ({
      ...state,
      isLoading: isLoading,
      errorMessage: null,
    }));
  }

  private setErrorState(errorMessage: string) {
    this.relationsState.update((state) => ({
      ...state,
      errorMessage: errorMessage,
      isLoading: false,
    }));
  }

  private setRelationsState(relations: PropertyContactRelation[]): void {
    this.relationsState.update((state) => ({
      ...state,
      value: relations,
      isLoading: false,
    }));
  }
}
