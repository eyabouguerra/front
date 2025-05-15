import { TestBed } from '@angular/core/testing';

import { CiterneService } from './citerne.service';

describe('CiterneService', () => {
  let service: CiterneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CiterneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
