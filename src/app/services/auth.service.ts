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

interface SignIn {
  email: string;
  password: string;
}
interface AccessToken {
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
  email: string;
  username: string;
  profileImgPath: string;
  isAdmin: boolean;
}

const initUserInfo: UserInfo = {
  _id: '',
  email: '',
  username: '',
  profileImgPath: '',
  isAdmin: false,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;
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
          (data) => this.accessToken.set(data) // access token 등록
        ),
        tap((data) => {
          // jwt를 디코딩 한 후 상태관리
          this.decode_jwt(data);
        }),
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
  }

  /**
   * refresh token이 만료될때, 새로고침 시 재발급용
   * @returns
   */
  refreshToken() {
    return this.http.get<AccessToken>(this.baseUrl + '/auth/refreshToken').pipe(
      tap((data) => this.accessToken.set(data)),
      tap((data) => this.decode_jwt(data)),
      takeUntilDestroyed(this.destroyRef), // 컴포넌트가 삭제될때 까지 구독. 삭제되면 메모리를 지운다.
      shareReplay(1), // 데이터 캐싱
      catchError(this.handleError)
    );
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
  decode_jwt(data: AccessToken) {
    const userInfo: UserInfo = jwt_decode(data.accessToken);
    this.userInfoStore.set(userInfo);
    this.isLoggedIn.set(true);
    window.localStorage.setItem('isLoggedIn', 'true');
  }

  /**
   * 메모리에 토큰을 보관하면 새로고침 시 토큰 정보가 휘발된다.
   * 로컬 스토리지에 로그인 유뮤만 확인하고
   * 로그인을 했을 경우 refresh 함수 실행
   * 토큰을 다시 받아온다.
   */
  async persistLogin() {
    if (window.localStorage.getItem('isLoggedIn')) {
      console.log('--------app-component--마운트-시작----');
      this.isLoggedIn.set(true);

      const refreshToken$ = this.refreshToken();
      // lastValueFrom Promise를 해결하기 전에
      // Observable이 완료될 때까지 기다린다.
      const result = await lastValueFrom(refreshToken$);
      console.log('result : ', result);
      console.log('--------app-component--마운트-끝-----');
    }
  }
}
