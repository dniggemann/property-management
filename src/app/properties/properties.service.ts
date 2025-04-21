import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, EMPTY, map, Subject, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PropertiesState } from './types/properties-state';
import { Property } from '../shared/types/property';
import { ErrorMessages } from '../shared/error-messages';

@Injectable({
  providedIn: 'root',
})
export class PropertiesService {
  private readonly http = inject(HttpClient);
  private readonly propertiesSubject = new Subject<void>();
  private readonly propertiesApiUrl = 'http://localhost:3000/properties';
  constructor() {
    this.propertiesSubject
      .pipe(
        tap(() => this.setLoadingState(true)),
        switchMap(() => this.getProperties()),
        delay(1000),
        takeUntilDestroyed(),
      )
      .subscribe((todos) => this.setPropertiesState(todos));
  }

  readonly isLoading = computed(() => this.propertiesState().isLoading);
  readonly value = computed(() => this.propertiesState().value);
  readonly errorMessage = computed(() => this.propertiesState().errorMessage);
  private propertiesState = signal<PropertiesState>({
    isLoading: false,
    value: null,
    errorMessage: null,
  });

  loadProperties() {
    this.propertiesSubject.next();
  }

  createProperty(property: Property) {
    return this.http.post<Property>(this.propertiesApiUrl, property);
  }

  readProperty(propertyId: Property['id']) {
    return this.http.get<Property>(`${this.propertiesApiUrl}/${propertyId}`);
  }

  updateProperty(property: Property) {
    return this.http.put<Property>(
      `${this.propertiesApiUrl}/${property.id}`,
      property,
    );
  }

  deleteProperty(propertyId: Property['id']) {
    return this.http.delete<Property>(`${this.propertiesApiUrl}/${propertyId}`);
  }

  private getProperties() {
    return this.http.get<Property[]>(this.propertiesApiUrl).pipe(
      map((data) => data),
      catchError((error) => {
        console.error(error);
        this.setErrorState(ErrorMessages.GET_PROPERTIES_FAILED);
        return EMPTY;
      }),
    );
  }

  private setLoadingState(isLoading: boolean) {
    this.propertiesState.update((state) => ({
      ...state,
      isLoading: isLoading,
      errorMessage: null,
    }));
  }

  private setErrorState(errorMessage: string) {
    this.propertiesState.update((state) => ({
      ...state,
      errorMessage: errorMessage,
      isLoading: false,
    }));
  }

  private setPropertiesState(properties: Property[]): void {
    this.propertiesState.update((state) => ({
      ...state,
      value: properties,
      isLoading: false,
    }));
  }
}
