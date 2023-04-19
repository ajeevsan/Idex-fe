import { TestBed } from '@angular/core/testing';

import { OnlyOnceLocationService } from './only-once-location.service';

describe('OnlyOnceLocationService', () => {
  let service: OnlyOnceLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnlyOnceLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
