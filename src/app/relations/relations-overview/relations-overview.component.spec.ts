import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationsOverviewComponent } from './relations-overview.component';

describe('RelationsOverviewComponent', () => {
  let component: RelationsOverviewComponent;
  let fixture: ComponentFixture<RelationsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationsOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RelationsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
