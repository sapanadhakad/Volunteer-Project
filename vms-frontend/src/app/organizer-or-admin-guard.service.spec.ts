import { TestBed } from '@angular/core/testing';

import { OrganizerOrAdminGuardService } from './organizer-or-admin-guard.service';

describe('OrganizerOrAdminGuardService', () => {
  let service: OrganizerOrAdminGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizerOrAdminGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
