import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { ClickStopPropagationDirective } from '../../utils/directives/click-stop-propagation';
import { RelationsService } from '../relations.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RelationDialogContentComponent } from '../../relations/relation-dialog-content/relation-dialog-content.component';
import { CrudAction } from '../../shared/crud-action';
import { RowDataItem } from '../types/row-data-item';
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
import { PropertyContactRelation } from '../../shared/types/propertyContactRelation';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-relations-overview',
  imports: [
    ClickStopPropagationDirective,
    MatIcon,
    MatButton,
    MatButton,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatProgressSpinner,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatIconButton,
  ],
  templateUrl: './relations-overview.component.html',
  styleUrl: './relations-overview.component.scss',
})
export class RelationsOverviewComponent implements OnInit {
  constructor() {
    effect(() => {
      const addressErrorMessage = this.relationsService.errorMessage();
      if (addressErrorMessage) {
        this.matSnackbarService.open(addressErrorMessage);
      }
    });
  }
  private relationsService = inject(RelationsService);
  private matSnackbarService = inject(MatSnackBar);
  private matDialogService = inject(MatDialog);

  readonly isLoadingRelations = this.relationsService.isLoading;
  readonly relations = this.relationsService.value;

  tableData = computed(() => this.relationsToTableData(this.relations()));
  displayedTableColumns: string[] = [
    'id',
    'propertyId',
    'contactId',
    'startDate',
    'endDate',
    'typeId',
    'serviceIds',
    'actions',
  ];

  ngOnInit() {
    this.relationsService.loadRelations();
  }

  onReloadButtonClick() {
    this.relationsService.loadRelations();
  }

  onAddRelationButtonClick() {
    const dialogRef = this.matDialogService.open(
      RelationDialogContentComponent,
      { autoFocus: false },
    );

    dialogRef.afterClosed().subscribe((crudAction: CrudAction) => {
      if (crudAction === CrudAction.CREATE) {
        this.matSnackbarService.open('Beziehung hinzugefügt');
        this.relationsService.loadRelations();
      }
    });
  }

  /**
   * Open edit dialog on edit button click
   */
  onEditButtonClick(rowDataItem: RowDataItem) {
    if (rowDataItem.id) {
      const dialogRef = this.matDialogService.open(
        RelationDialogContentComponent,
        {
          data: {
            relation: this.relationsService
              .value()
              ?.find((item) => item.id === rowDataItem.id),
          },
        },
      );

      dialogRef.afterClosed().subscribe((crudAction: CrudAction) => {
        if (crudAction === CrudAction.UPDATE) {
          this.matSnackbarService.open('Beziehung bearbeitet');
        }
        if (crudAction === CrudAction.DELETE) {
          this.matSnackbarService.open('Beziehung gelöscht');
        }
        if (
          crudAction === CrudAction.UPDATE ||
          crudAction === CrudAction.DELETE
        ) {
          this.relationsService.loadRelations();
        }
      });
    } else {
      console.error('Relation ID is missing');
    }
  }

  /**
   * Transforms response data to table data format
   */
  private relationsToTableData(relations: PropertyContactRelation[] | null) {
    const tableData: RowDataItem[] = relations
      ? relations.map((relation) => {
          // TODO: Map to readable data
          return {
            id: relation.id,
            propertyId: relation.propertyId,
            contactId: relation.contactId,
            startDate: relation.startDate,
            endDate: relation.endDate,
            typeId: relation.typeId,
            serviceIds: relation.serviceIds?.join(', '),
          };
        })
      : [];

    return new MatTableDataSource(tableData);
  }
}
