import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { ContactsService } from '../contacts.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Contact } from '../../shared/types/contact';
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
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ContactDialogContentComponent } from '../contact-dialog-content/contact-dialog-content.component';
import { RowDataItem } from '../types/row-data-item';
import { Router } from '@angular/router';
import { ClickStopPropagationDirective } from '../../utils/directives/click-stop-propagation';
import { MatIcon } from '@angular/material/icon';
import { RoutePath } from '../../shared/route-path';

@Component({
  selector: 'app-contacts-overview',
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
    MatIconButton,
    MatIcon,
    ClickStopPropagationDirective,
  ],
  templateUrl: './contacts-overview.component.html',
  styleUrl: './contacts-overview.component.scss',
})
export class ContactsOverviewComponent implements OnInit {
  constructor() {
    effect(() => {
      const addressErrorMessage = this.contactsService.errorMessage();
      if (addressErrorMessage) {
        this.matSnackbarService.open(addressErrorMessage);
      }
    });
  }
  private contactsService = inject(ContactsService);
  private matSnackbarService = inject(MatSnackBar);
  private matDialogService = inject(MatDialog);
  private router = inject(Router);

  readonly isLoadingContacts = this.contactsService.isLoading;
  readonly contacts = this.contactsService.value;

  tableData = computed(() => this.contactsToTableData(this.contacts()));
  displayedTableColumns: string[] = ['id', 'name', 'address', 'edit'];

  ngOnInit() {
    this.contactsService.loadContacts();
  }

  onReloadButtonClick() {
    this.contactsService.loadContacts();
  }

  onAddContactButtonClick() {
    const dialogRef = this.matDialogService.open(ContactDialogContentComponent);

    dialogRef.afterClosed().subscribe((isPropertyAdded: boolean) => {
      if (isPropertyAdded) {
        this.matSnackbarService.open('Kontakt hinzugefügt');
        this.contactsService.loadContacts();
      }
    });
  }

  /**
   * Redirects to detail page on row click
   */
  onRowClick(rowDataItem: RowDataItem) {
    this.router.navigate([RoutePath.CONTACTS, rowDataItem.id]);
  }

  /**
   * Open edit dialog on edit button click
   */
  onEditClick(rowDataItem: RowDataItem) {
    if (rowDataItem.id) {
      const dialogRef = this.matDialogService.open(
        ContactDialogContentComponent,
        {
          data: {
            contact: this.contactsService
              .value()
              ?.find((item) => item.id === rowDataItem.id),
          },
        },
      );

      dialogRef.afterClosed().subscribe((isContactEdited: boolean) => {
        if (isContactEdited) {
          this.matSnackbarService.open('Kontakt bearbeitet');
          this.contactsService.loadContacts();
        }
      });
    } else {
      console.error('Contact ID is missing');
    }
  }

  private contactsToTableData(contacts: Contact[] | null) {
    const tableData: RowDataItem[] = contacts
      ? contacts.map((contact) => {
          return {
            id: contact.id,
            name: contact.name,
            address: `${contact.address.streetAddress}, ${contact.address.postalCode} ${contact.address.locality}, ${contact.address.countryName}`,
          };
        })
      : [];

    return new MatTableDataSource(tableData);
  }
}
