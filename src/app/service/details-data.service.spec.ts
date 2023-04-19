import { TestBed } from '@angular/core/testing';

import { DetailsDataService } from './details-data.service';

describe('DetailsDataService', () => {
  let service: DetailsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
