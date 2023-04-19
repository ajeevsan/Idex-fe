import { TestBed } from '@angular/core/testing';

import { ForecasthoursService } from './forecasthours.service';

describe('ForecasthoursService', () => {
  let service: ForecasthoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForecasthoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
