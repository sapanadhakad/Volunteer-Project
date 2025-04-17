import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageeventComponent } from './manageevent.component';

describe('ManageeventComponent', () => {
  let component: ManageeventComponent;
  let fixture: ComponentFixture<ManageeventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageeventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageeventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
