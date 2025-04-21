import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, EMPTY, map, Subject, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactsState } from './types/contacts-state';
import { Contact } from '../shared/types/contact';
import { ErrorMessages } from '../shared/error-messages';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  private readonly http = inject(HttpClient);
  private readonly contactsSubject = new Subject<void>();
  private readonly contactsApiUrl = 'http://localhost:3000/contacts';
  constructor() {
    this.contactsSubject
      .pipe(
        tap(() => this.setLoadingState(true)),
        switchMap(() => this.getContacts()),
        delay(1000),
        takeUntilDestroyed(),
      )
      .subscribe((todos) => this.setContactsState(todos));
  }

  readonly isLoading = computed(() => this.contactsState().isLoading);
  readonly value = computed(() => this.contactsState().value);
  readonly errorMessage = computed(() => this.contactsState().errorMessage);
  private contactsState = signal<ContactsState>({
    isLoading: false,
    value: null,
    errorMessage: null,
  });

  loadContacts() {
    this.contactsSubject.next();
  }

  createContact(property: Contact) {
    return this.http.post<Contact>(this.contactsApiUrl, property);
  }

  readContact(propertyId: Contact['id']) {
    return this.http.get<Contact>(`${this.contactsApiUrl}/${propertyId}`);
  }

  updateContact(contact: Contact) {
    return this.http.put<Contact>(
      `${this.contactsApiUrl}/${contact.id}`,
      contact,
    );
  }

  deleteContact(propertyId: Contact['id']) {
    return this.http.delete<Contact>(`${this.contactsApiUrl}/${propertyId}`);
  }

  private getContacts() {
    return this.http.get<Contact[]>(this.contactsApiUrl).pipe(
      map((data) => data),
      catchError((error) => {
        console.error(error);
        this.setErrorState(ErrorMessages.GET_PROPERTIES_FAILED);
        return EMPTY;
      }),
    );
  }

  private setLoadingState(isLoading: boolean) {
    this.contactsState.update((state) => ({
      ...state,
      isLoading: isLoading,
      errorMessage: null,
    }));
  }

  private setErrorState(errorMessage: string) {
    this.contactsState.update((state) => ({
      ...state,
      errorMessage: errorMessage,
      isLoading: false,
    }));
  }

  private setContactsState(properties: Contact[]): void {
    this.contactsState.update((state) => ({
      ...state,
      value: properties,
      isLoading: false,
    }));
  }
}
