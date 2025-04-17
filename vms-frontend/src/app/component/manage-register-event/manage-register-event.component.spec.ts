import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRegisterEventComponent } from './manage-register-event.component';

describe('ManageRegisterEventComponent', () => {
  let component: ManageRegisterEventComponent;
  let fixture: ComponentFixture<ManageRegisterEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageRegisterEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRegisterEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
