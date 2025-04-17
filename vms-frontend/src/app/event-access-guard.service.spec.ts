import { TestBed } from '@angular/core/testing';

import { EventAccessGuardService } from './event-access-guard.service';

describe('EventAccessGuardService', () => {
  let service: EventAccessGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventAccessGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
