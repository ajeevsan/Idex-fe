import { TestBed } from '@angular/core/testing';

import { LogininfoService } from './logininfo.service';

describe('LogininfoService', () => {
  let service: LogininfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogininfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
