import { TestBed } from '@angular/core/testing';

import { GetCurrentLocationService } from './get-current-location.service';

describe('GetCurrentLocationService', () => {
  let service: GetCurrentLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetCurrentLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
