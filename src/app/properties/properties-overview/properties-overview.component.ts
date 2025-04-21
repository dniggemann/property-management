import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { PropertiesService } from '../properties.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Property } from '../../shared/types/property';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { propertyDialogContentComponent } from '../add-property-dialog-content/property-dialog-content.component';
import { RowDataItem } from '../types/row-data-item';
import { Router } from '@angular/router';
import { AddPropertyDialogContentComponent } from '../add-property-dialog-content/add-property-dialog-content.component';

@Component({
  selector: 'app-properties-overview',
  imports: [
    MatProgressSpinner,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatButton,
  ],
  templateUrl: './properties-overview.component.html',
  styleUrl: './properties-overview.component.scss',
})
export class PropertiesOverviewComponent implements OnInit {
  constructor() {
    effect(() => {
      const addressErrorMessage = this.propertiesService.errorMessage();
      if (addressErrorMessage) {
        this.matSnackbarService.open(addressErrorMessage);
      }
    });
  }
  private propertiesService = inject(PropertiesService);
  private matSnackbarService = inject(MatSnackBar);
  private matDialogService = inject(MatDialog);
  private router = inject(Router);

  readonly isLoadingProperties = this.propertiesService.isLoading;
  readonly properties = this.propertiesService.value;

  tableData = computed(() => this.propertiesToTableData(this.properties()));
  displayedTableColumns: string[] = ['id', 'address', 'description'];

  ngOnInit() {
    this.propertiesService.loadProperties();
  }

  onReloadButtonClick() {
    this.propertiesService.loadProperties();
  }

  onAddPropertyButtonClick() {
    const dialogRef = this.matDialogService.open(
      propertyDialogContentComponent,
    );

    dialogRef.afterClosed().subscribe((isPropertyAdded: boolean) => {
      if (isPropertyAdded) {
        this.matSnackbarService.open('Immobilie hinzugefügt');
        this.propertiesService.loadProperties();
      }
    });
  }

  /**
   * Open edit dialog on row click
   */
  onRowClick(rowDataItem: RowDataItem) {
    if (rowDataItem.id) {
      const dialogRef = this.matDialogService.open(
        propertyDialogContentComponent,
        {
          data: {
            property: this.propertiesService
              .value()
              ?.find((item) => item.id === rowDataItem.id),
          },
        },
      );

      dialogRef.afterClosed().subscribe((isPropertyAdded: boolean) => {
        if (isPropertyAdded) {
          this.matSnackbarService.open('Immobilie bearbeitet');
          this.propertiesService.loadProperties();
        }
      });
    } else {
      console.error('Property ID is missing');
    }
  }

  private propertiesToTableData(properties: Property[] | null) {
    const tableData: RowDataItem[] = properties
      ? properties.map((property) => {
          return {
            id: property.id,
            description: property.description,
            address: `${property.address.streetAddress}, ${property.address.postalCode} ${property.address.locality}, ${property.address.countryName}`,
          };
        })
      : [];

    return new MatTableDataSource(tableData);
  }
}
