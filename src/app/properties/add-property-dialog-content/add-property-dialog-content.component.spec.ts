import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPropertyDialogContentComponent } from './add-property-dialog-content.component';

describe('AddPropertyDialogContentComponent', () => {
  let component: AddPropertyDialogContentComponent;
  let fixture: ComponentFixture<AddPropertyDialogContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPropertyDialogContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPropertyDialogContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
