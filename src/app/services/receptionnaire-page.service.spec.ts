import { TestBed } from '@angular/core/testing';

import { ReceptionnairePageService } from './receptionnaire-page.service';

describe('ReceptionnairePageService', () => {
  let service: ReceptionnairePageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceptionnairePageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
