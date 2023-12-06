import { DialogService } from 'src/app/services/dialog/dialog.service';
import { effect, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const isLoggedInGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const dialogService = inject(DialogService);
  const router = inject(Router);
  const routePath = route.routeConfig?.path ?? ''; // ?? 은 타입스크립트 문법으로 undefined || null 이면 ''로 주겠다.
  const isLoggedIn = window.localStorage.getItem('isLoggedIn')
  // if (authService.isLoggedIn()) {
  //   // 로그인이 되어있으면
  //   // 회원가입, 로그인, 비밀번호 찾기, 소개페이지는 전부
  //   // 메인페이지로 이동
  //   if (['sign-in', 'find-pw', 'sign-up'].includes(routePath)) {
  //     router.navigate(['main']);
  //   }
  //   return true;
  // } else {
  //   // 로그인이 안되어있으면
  //   // 회원가입, 로그인, 비밀번호 찾기, 소개페이지는 전부 그대로 이동
  //   // dialogService.openDialogNegative('Please login first');
  //   if (['sign-in', 'sign-up', 'find-pw'].includes(routePath)) {
  //     return true;
  //     // uri가 없거나 메인페이지는 소개페이지로
  //   } else {
  //     // 그외 나머지 페이지는 signin으로
  //     router.navigate(['sign-in'], { queryParams: { redirectURL: state.url } });
  //   }
  //   return true;
  // }

  if (isLoggedIn) {
    if (['sign-in', 'find-pw', 'sign-up'].includes(routePath)) {
      router.navigate(['main']);
    }
    return true;
  }

  if (['sign-in', 'sign-up', 'find-pw'].includes(routePath)) {
    return true;
  }

  if (routePath === '' && state.url === '/main') {
    router.navigate(['sign-in']);
    return true;
  }

  dialogService.openDialogNegative('Please login first');
  router.navigate(['sign-in'], { queryParams: { redirectURL: state.url } });
  return false;
};
