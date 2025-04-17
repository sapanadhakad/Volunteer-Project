import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerDetailComponent } from './volunteer-detail.component';

describe('VolunteerDetailComponent', () => {
  let component: VolunteerDetailComponent;
  let fixture: ComponentFixture<VolunteerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VolunteerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolunteerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
