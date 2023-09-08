import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxGrpcInterceptorComponent } from './ngx-grpc-interceptor.component';

describe('NgxGrpcInterceptorComponent', () => {
  let component: NgxGrpcInterceptorComponent;
  let fixture: ComponentFixture<NgxGrpcInterceptorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NgxGrpcInterceptorComponent],
    });
    fixture = TestBed.createComponent(NgxGrpcInterceptorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
