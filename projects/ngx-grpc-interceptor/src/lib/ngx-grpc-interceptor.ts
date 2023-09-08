import { inject, InjectionToken } from '@angular/core';
import type { grpc } from '@improbable-eng/grpc-web';
import { BrowserHeaders } from 'browser-headers';
import type { Observable } from 'rxjs';

// this entire file is heavily inspired by
// https://github.com/angular/angular/blob/c09c1bb03316a8b7e8417b090138b2d5b4acff44/packages/common/http/src/interceptor.ts
// the goal being to have a pattern that is looking exactly like HTTP interceptors but here to have them working as GRPC interceptors

export interface UnaryMethodDefinitionish extends grpc.UnaryMethodDefinition<any, any> {
  requestStream: any;
  responseStream: any;
}

export type GrpcWebImplGeneric<Options> = new (
  host: string,
  options: Options,
) => {
  unary(
    methodDesc: UnaryMethodDefinitionish,
    _request: unknown,
    metadata: grpc.Metadata | undefined,
  ): Observable<unknown>;
};

export interface GrpcRequestData {
  readonly host: string;
  readonly method: UnaryMethodDefinitionish;
  readonly request: unknown;
  readonly metadata: BrowserHeaders;
}

export declare abstract class GrpcHandler {
  abstract handle(req: GrpcRequestData): Observable<unknown>;
}

export interface GrpcInterceptor {
  intercept(requestData: GrpcRequestData, next: GrpcHandler): Observable<unknown>;
}

export const GRPC_INTERCEPTORS = new InjectionToken<GrpcInterceptor[]>('GRPC_INTERCEPTORS');

/*
 * when we use a `GrpcWebImpl`, it's not generic
 * that grpc implementation has no built in capability to support the same pattern as Angular
 * to have interceptors to introduce auth, logging, error handling and many others in a generic
 * and reusable way
 * this factory helps with the above by generating a class for one `GrpcWebImpl`, hooks into the
 * `unary` call of the class and for each call will run all the registered grpc interceptors
 * Usage example:
 * start by creating all the grpc interceptors you need
 * they're like Angular's interceptors (but adapted for grpc), so create a class that implements `GrpcInterceptor`
 * and then provide it through DI with the following:
 * ```
 * { provide: GRPC_INTERCEPTORS, useClass: YourGrpcInterceptorClass, multi: true }
 * ```
 *
 * import a `GrpcWebImpl`
 * ```
 * import { GrpcWebImpl } from 'your-lib/your_service';
 * ```
 *
 * then call the factory function and pass the `GrpcWebImpl` as argument
 * ```
 * interceptable(GrpcWebImpl)
 * ```
 */
export function interceptable<Options>(grpcWebImpl: GrpcWebImplGeneric<Options>) {
  const interceptors = inject(GRPC_INTERCEPTORS, { optional: true });

  return class GrpcWebImplHooked extends grpcWebImpl {
    constructor(
      public host: string,
      options: Options,
    ) {
      super(host, options);
    }

    override unary<T extends UnaryMethodDefinitionish>(
      method: T,
      request: unknown,
      metadata: BrowserHeaders = new BrowserHeaders(),
    ): Observable<unknown> {
      const finalHandler = () => super.unary(method, request, metadata);

      if (!interceptors) {
        return finalHandler();
      }

      return interceptors
        .reduceRight(
          (previousHandler, interceptor) => ({
            handle: () =>
              interceptor.intercept(
                {
                  host: this.host,
                  method,
                  request,
                  metadata,
                },
                previousHandler,
              ),
          }),
          {
            handle: finalHandler,
          },
        )
        .handle();
    }
  };
}
