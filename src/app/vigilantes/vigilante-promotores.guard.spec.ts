import { TestBed } from '@angular/core/testing';

import { VigilantePromotoresGuard } from './vigilante-promotores.guard';

describe('VigilantePromotoresGuard', () => {
  let guard: VigilantePromotoresGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VigilantePromotoresGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
