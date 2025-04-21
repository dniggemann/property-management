import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDialogContentComponent } from './contact-dialog-content.component';

describe('AddPropertyDialogContentComponent', () => {
  let component: ContactDialogContentComponent;
  let fixture: ComponentFixture<ContactDialogContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDialogContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDialogContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
