import { TestBed } from '@angular/core/testing';

import { NgxGrpcInterceptorService } from './ngx-grpc-interceptor.service';

describe('NgxGrpcInterceptorService', () => {
  let service: NgxGrpcInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxGrpcInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
