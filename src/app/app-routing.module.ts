import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { isLoggedInGuard } from './guards/is-logged-in.guard';
import { IndexComponent } from './pages/index/index.component';

const routes: Routes = [
  {
    path: 'welcome',
    component: IndexComponent,
    canActivate: [isLoggedInGuard],
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./pages/auth/sign-in/sign-in.component').then(
        (m) => m.SignInComponent
      ),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/auth/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent
      ),
  },
  {
    path: 'find-pw',
    loadChildren: () =>
      import(`./pages/auth/find-pw/find-pw.component`).then(
        (m) => m.FindPwComponent
      ),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [isLoggedInGuard],
    children: [
      {
        path: 'main',
        loadChildren: () =>
          import('./pages/main/routes').then((m) => m.MAIN_ROUTES),
      },
      {
        path: 'company-mngmt',
        loadChildren: () =>
          import('./pages/company-mngmt/routes').then(
            (m) => m.COMPANY_MNGMT_ROUTES
          ),
      },
      // {
      //     path: 'profile',
      //     loadChildren: () => import(`./pages/profile-edit/profile-edit.module`).then(m => m.ProfileEditModule),
      // },
      // {
      //     path: 'collab',
      //     loadChildren: () => import(`./pages/space/space.module`).then(m => m.SpaceModule),
      // },
      // {
      //     path: 'leave',
      //     loadChildren: () => import('./pages/leave-mngmt/leave-mngmt.module').then(m => m.LeaveMngmtModule),
      // },
      // {
      //     path: 'employee-mngmt', canActivate: [MngGuard],
      //     loadChildren: () => import('./pages/employee-management/employee-management.module').then(m => m.EmployeeManagementModule)
      // },
      // {
      //     path: 'approval-mngmt', canActivate: [MngGuard],
      //     loadChildren: () => import('./pages/approval-management/approval-management.module').then(m => m.ApprovalManagementModule)
      // },
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full',
      },
    ],
  },
  // 잘못된 URL을 사용했을때 메인으로 보냄
  {
    path: '**',
    // redirectTo: 'welcome',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
];

@NgModule({
  // imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload'})],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class ApproutingModule {}
