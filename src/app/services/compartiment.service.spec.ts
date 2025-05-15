import { TestBed } from '@angular/core/testing';

import { CompartimentService } from './compartiment.service';

describe('CompartimentService', () => {
  let service: CompartimentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompartimentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
