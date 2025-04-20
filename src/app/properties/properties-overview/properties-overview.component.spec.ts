import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesOverviewComponent } from './properties-overview.component';

describe('PropertiesOverviewComponent', () => {
  let component: PropertiesOverviewComponent;
  let fixture: ComponentFixture<PropertiesOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertiesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
