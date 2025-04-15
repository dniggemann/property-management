import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressFieldsetComponent } from './address-fieldset.component';

describe('AddressFieldsetComponent', () => {
  let component: AddressFieldsetComponent;
  let fixture: ComponentFixture<AddressFieldsetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressFieldsetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressFieldsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
