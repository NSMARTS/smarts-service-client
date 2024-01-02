import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ApproutingModule, routes } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialsModule } from './materials/materials.module';
import { httpInterceptorProviders } from './interceptors/http-interceptor';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { catchError, lastValueFrom, of, tap } from 'rxjs';
import { AccessToken, AuthService } from './services/auth/auth.service';
import { provideRouter, withRouterConfig } from '@angular/router';
import { LeaveStatusDetailDialogComponent } from './dialog/leave-status-detail-dialog/leave-status-detail-dialog.component';

import { httpLoadingInterceptorProviders } from './interceptors/http-loading-interceptor';

/**
 * AppInitializer은 컴포넌트가 생상되기 전에 가장 먼저 실행된다.
 * 현재 스마트서비스는 access token을 signal 즉 메모리에 저장한다.
 * 새로고침 시 access token이 사라지는 데, 이 때 이 함수가 실행돼서
 * 다시 access token을 발급받는다.
 * 로컬 스토리지의 isLoggedIn은 로그인을 했는지 안했는지 확인하는데
 * refreshToken이 httpOnly 쿠키에 보관되어있어서
 * 자바스크립트 코드로 접근이 불가능해 로컬스토리지로 로그인 유무를 파악한다.
 * @param authService
 * @returns
 */
export function appInitializer(authService: AuthService) {
  return async () => {
    if (window.localStorage.getItem('isLoggedIn')) {
      console.log('app initial')
      authService.isLoggedIn.set(true);
      return await lastValueFrom(authService.refreshToken())
    }
    return;
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ApproutingModule,
    BrowserAnimationsModule,
    MaterialsModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    // QuillModule.forRoot({
    //   modules: {
    //     toolbar: [
    //       ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    //       ['blockquote', 'code-block'],

    //       [{ header: 1 }, { header: 2 }],               // custom button values
    //       [{ list: 'ordered' }, { list: 'bullet' }],
    //       [{ script: 'sub' }, { script: 'super' }],      // superscript/subscript
    //       [{ indent: '-1' }, { indent: '+1' }],          // outdent/indent
    //       [{ direction: 'rtl' }],                         // text direction

    //       [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
    //       [{ header: [1, 2, 3, 4, 5, 6, false] }],

    //       [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
    //       [{ align: [] }],

    //       ['clean'],                                         // remove formatting button

    //       ['link', 'image', 'video']                         // link and image, video
    //     ]
    //   }
    // })
  ],
  providers: [
    // APP_INITIALIZER 는 app.compnent가 실행 되기전에 제일 먼저 실행한다. 로그인을 했으면 Access Token 발급
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    // 모든 http 요청에 withCredential:true 오션을 주기위해 사용
    httpInterceptorProviders,
    // 부모 router의 param을 상속받아 가져올때 설정해야한다. 다시 제거.
    // provideRouter(routes,
    //   withRouterConfig({ paramsInheritanceStrategy: 'always' })
    // ),

    httpLoadingInterceptorProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
