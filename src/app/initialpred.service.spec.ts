import { TestBed } from '@angular/core/testing';

import { InitialpredService } from './initialpred.service';

describe('InitialpredService', () => {
  let service: InitialpredService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitialpredService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
