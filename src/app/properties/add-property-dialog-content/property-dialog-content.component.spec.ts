import { ComponentFixture, TestBed } from '@angular/core/testing';

import { propertyDialogContentComponent } from './property-dialog-content.component';

describe('AddPropertyDialogContentComponent', () => {
  let component: propertyDialogContentComponent;
  let fixture: ComponentFixture<propertyDialogContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [propertyDialogContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(propertyDialogContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
