import { Route } from '@angular/router';
import { HolidayListComponent } from './holiday-list/holiday-list.component';


// In admin/routes.ts:
export const HOLIDAY_ROUTES: Route[] = [{
    // localhost:4200/users
    // UserListComponent를 보여줌
    path: '',
    component: HolidayListComponent,
    // loadComponent: () =>
    //     import(`./user-list/user-list.component`).then(m => m.UserListComponent),
    // canActivate는 현재 컴포넌트에 적용
    // 로그인 시 접속 가능
    // canActivate: [authGuard],
    // canActivateChild는 자식 컴포넌트만 가능
    // usersGuard를 사용해 userList는 누구나 보는게 가능한데
    // 상세보기나 수정은 admin Role만 가능
}];
