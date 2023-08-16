import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const isLoggedInGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const routePath = route.routeConfig?.path ?? ''; // ?? 은 타입스크립트 문법으로 undefined || null 이면 ''로 주겠다.

    if (authService.isLoggedIn()) {
        // 로그인이 되어있으면
        // 회원가입, 로그인, 비밀번호 찾기, 소개페이지는 전부 
        // 메인페이지로 이동
        if (['sign-in', 'welcome', 'find-pw', 'sign-up'].includes(routePath)) {
            router.navigate(['main']);
        }
        return true;
    } else {
        // 로그인이 안되어있으면
        // 회원가입, 로그인, 비밀번호 찾기, 소개페이지는 전부 그대로 이동
        if (['welcome', 'sign-in', 'sign-up', 'find-pw'].includes(routePath)) {
            return true;
            // uri가 없거나 메인페이지는 소개페이지로
        } else if (routePath === '' && state.url === '/main') {
            router.navigate(['welcome']);
        } else {
            // 그외 나머지 페이지는 signin으로
            router.navigate(['sign-in'], { queryParams: { 'redirectURL': state.url } });
        }
        return true;
    }

};
