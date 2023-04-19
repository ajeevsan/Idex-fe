import { TestBed } from '@angular/core/testing';

import { CitylistService } from './citylist.service';

describe('CitylistService', () => {
  let service: CitylistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitylistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
