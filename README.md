# NgxGrpcInterceptor

Angular is a framework and offers an HTTP client service that we can use straight away.  
We use it instead of using `fetch` for example because it lets us not only test our code but also have super useful features with dependency injection like providing some interceptors to be able to watch and even modify HTTP requests. The possibilities are endless but here are some ideas:

- Authentication (adding token for each requests without having to do that individually)
- Logging
- Error handling

[gRPC](https://grpc.io) is another option for the communication layer and Angular doesn't offer any interface similar to `HTTPClient` for it. SO we decided to build our own to have the same set of capabilities as the HTTP integration.

## Installation

`ngx-grpc-interceptor` is available on [NPM](https://www.npmjs.com/package/ngx-grpc-interceptor):

```
npm i ngx-grpc-interceptor
```

To integrate gRPC in your app, checkout [improbable-eng/grpc-web](https://github.com/improbable-eng/grpc-web).

## How to use

Start by creating all the grpc interceptors you need. They're like [Angular interceptors](https://angular.io/guide/http-interceptor-use-cases) and offer an `intercept` method. So create a class that implements `GrpcInterceptor` and then provide it through DI with the following:

```typescript
import { GRPC_INTERCEPTORS } from 'ngx-grpc-interceptor';
```

And in your list of providers, provide the following:

```typescript
{ provide: GRPC_INTERCEPTORS, useClass: YourGrpcInterceptorClass, multi: true }
```

Of course, you can have as many as you'd like here because of the `multi: true`.

Then, from your service, when importing a `GrpcWebImpl` like this:

```typescript
import { GrpcWebImpl } from 'your-lib/your_service';
```

Instead of using directly the `GrpcWebImpl`, wrap it with the following:

```typescript
interceptable(GrpcWebImpl);
```

Here's a complete example. Instead of having:

```typescript
const rpc = new GrpcWebImpl('http://0.0.0.0', { debug: true });
const client = new YourAppClientImpl(this.rpc);
```

You'd have:

```typescript
const rpc = new (interceptable(GrpcWebImpl))('http://0.0.0.0', { debug: true });
const client = new YourAppClientImpl(this.rpc);
```

Note how `new GrpcWebImpl` became `new (interceptable(GrpcWebImpl))`.

That's it. Now all your interceptors will work as expected.
