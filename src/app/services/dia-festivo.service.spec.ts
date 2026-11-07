import { TestBed } from '@angular/core/testing';

import { DiaFestivoService } from './dia-festivo.service';

describe('DiaFestivoService', () => {
  let service: DiaFestivoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiaFestivoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
