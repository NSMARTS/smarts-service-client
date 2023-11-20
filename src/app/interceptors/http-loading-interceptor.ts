import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { AccessToken, AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { LoadingService } from '../services/loading/loading.service';

/**
 * https://medium.com/swlh/angular-loading-spinner-using-http-interceptor-63c1bb76517b
 * 모든 http 요청에 인터셉터에 로딩 컴포넌트 넣기
 */
@Injectable()
export class HttpRequestLoadingInterceptor implements HttpInterceptor {

  constructor(private _loading: LoadingService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._loading.setLoading(true, request.url);
    return next.handle(request)
      .pipe(
        catchError((err) => {
          this._loading.setLoading(false, request.url);
          return throwError(() => err);
        })
        , map((evt: HttpEvent<any>) => {
          if (evt instanceof HttpResponse) {
            this._loading.setLoading(false, request.url);
          }
          return evt;
        })
      );
  }
}

export const httpLoadingInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestLoadingInterceptor, deps: [LoadingService], multi: true },
];
