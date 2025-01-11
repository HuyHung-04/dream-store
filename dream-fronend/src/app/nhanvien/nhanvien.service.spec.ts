import { TestBed } from '@angular/core/testing';

import { NhanvienService } from './nhanvien.service';

describe('NhanvienService', () => {
  let service: NhanvienService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NhanvienService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
