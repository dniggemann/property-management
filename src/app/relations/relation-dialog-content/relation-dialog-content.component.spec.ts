import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationDialogContentComponent } from './relation-dialog-content.component';

describe('RelationDialogContentComponent', () => {
  let component: RelationDialogContentComponent;
  let fixture: ComponentFixture<RelationDialogContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationDialogContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RelationDialogContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
