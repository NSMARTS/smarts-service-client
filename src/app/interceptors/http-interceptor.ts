import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, switchMap, tap, throwError } from 'rxjs';
import { AccessToken, AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * 모든 Http 요청을 가져가
 * withCredentials: true 을 추가해줌.
 * access token이 만료되거나 수정이 가해졌을 경우 재발급
 */
@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  constructor(private authService: AuthService, private router: Router) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    req = req.clone({
      withCredentials: true
    })
    if (this.authService.accessToken()) {
      req = this.addAuthorizationHeader(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error instanceof HttpErrorResponse &&
          !req.url.includes('auth/signin') &&
          error.status === 401
        ) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }


  /**
   * 로그인 성공 후 accessToken이 있으면
   * header에 accessToken을 같이 보낸다.
   * @param req 
   * @returns 
   */
  private addAuthorizationHeader(req: HttpRequest<any>): HttpRequest<any> {
    const accessToken = this.authService.accessToken()?.accessToken;
    return req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
    });
  }

  /**
   * access token이 만료되면 재발행 함수
   * @param request
   * @param next
   * @returns
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      if (this.authService.isLoggedIn()) {
        console.log(request)
        console.log('refresh token 재발급');
        // access token이 만료되면 재발행 요청
        return this.authService.refreshToken().pipe(
          switchMap((data) => {
            console.log('access token : ', data.accessToken)
            this.isRefreshing = false;
            request = request.clone({
              withCredentials: true,
              headers: request.headers.set(
                'Authorization',
                'Bearer ' + data.accessToken
              ),
            });
            console.log('api 재요청');
            // refresh token 발급 받은 후 다시 요청
            return next.handle(request);
          }),
          catchError((error: HttpErrorResponse) => {
            console.error(error);
            if (
              // refresh token을 재발급할때
              // refresh token이 만료돼서 없거나,
              // refresh token을 수정됐거나,
              // db에 보관하는 refresh token과 일치하지 않을 경우
              error.status === 401
            ) {
              // 로그아웃 하고 signin 페이지로 이동
              this.authService.signOut();
              this.router.navigate(['sign-in']);
            }

            return throwError(() => error);
          })
        );
      }
    }

    return next.handle(request);
  }
}


export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, deps: [AuthService, Router], multi: true },
];
