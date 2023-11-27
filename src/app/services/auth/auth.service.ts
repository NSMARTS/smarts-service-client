import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  lastValueFrom,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

interface SignIn {
  email: string;
  password: string;
}
export interface AccessToken {
  accessToken: string;
}

interface SignUp {
  email: string;
  password: string;
  username: string;
  confirmedPassword: string;
}

export interface UserInfo {
  _id: string;
  location: string;
  email: string;
  username: string;
  profileImgPath: string;
  isAdmin: boolean;
  phoneNumber: string;
  address: string;
}

const initUserInfo: UserInfo = {
  _id: '',
  email: '',
  username: '',
  location: '',
  profileImgPath: '',
  phoneNumber: '',
  isAdmin: false,
  address: '',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  router = inject(Router)
  accessToken = signal<AccessToken>({ accessToken: '' });
  userInfoStore = signal<UserInfo>(initUserInfo);
  isLoggedIn = signal<boolean>(false);

  destroyRef = inject(DestroyRef);
  constructor(private http: HttpClient) {
    effect(() => {
      console.log(this.accessToken());
    });
    effect(() => {
      console.log(this.userInfoStore());
    });
  }

  signIn(signInForm: SignIn) {
    return this.http
      .post<AccessToken>(this.baseUrl + '/auth/signIn', signInForm)
      .pipe(
        tap(
          async (data) => await this.setAccessToken(data) // access token 등록
        ),

        takeUntilDestroyed(this.destroyRef), // 컴포넌트가 삭제될때 까지 구독. 삭제되면 메모리를 지운다.
        shareReplay(1), // 데이터 캐싱
        catchError(this.handleError)
      );
  }

  signUp(signUpForm: SignUp) {
    return this.http.post<AccessToken>(
      this.baseUrl + '/auth/signUp',
      signUpForm
    );
  }

  signOut(): void {
    this.http.get(this.baseUrl + '/auth/signOut').subscribe();
    window.localStorage.clear();
    this.isLoggedIn.set(false);
    this.userInfoStore.set(initUserInfo);
    this.accessToken.set({ accessToken: '' });
    this.router.navigate(['sign-in']);

  }

  /**
   * access token이나 refresh token이 만료될 때,
   * 새로고침 시 재발급용
   * @returns
   */
  refreshToken() {
    // console.log('refresh token api 시작')
    return this.http.get<AccessToken>(this.baseUrl + '/auth/refreshToken').pipe(
      tap(async (data) => await this.setAccessToken(data)),
      takeUntilDestroyed(this.destroyRef), // 컴포넌트가 삭제될때 까지 구독. 삭제되면 메모리를 지운다.
      shareReplay(1), // 데이터 캐싱
      catchError(this.handleError)
    );
  }

  /**
   * 시그널로 access Token 보관
   * @param data
   * @returns
   */
  async setAccessToken(data: AccessToken) {
    this.accessToken.set(data);
    return await this.decode_jwt(data);
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let errorMessage: any = {};
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage.status = err.status;
      errorMessage.message = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error();
    return throwError(() => errorMessage);
  }

  /**
   * 로그인 후 받은 jwt를 분해한 다음 상태관리
   * @param data {accessToken:"accessToken"}
   */
  async decode_jwt(data: AccessToken) {
    this.isLoggedIn.set(true);
    const userInfo: UserInfo = await jwt_decode(data.accessToken);
    this.userInfoStore.set(userInfo);
    window.localStorage.setItem('isLoggedIn', 'true');
  }
}
