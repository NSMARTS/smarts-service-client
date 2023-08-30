import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { isLoggedInGuard } from './guards/is-logged-in.guard';
import { IndexComponent } from './pages/index/index.component';
import { ToolbarComponent } from './components/layout/toolbar/toolbar.component';

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
    loadComponent: () =>
      import(`./pages/auth/find-pw/find-pw.component`).then(
        (m) => m.FindPwComponent
      ),
  },
  {
    path: '',
    component: ToolbarComponent,
    canActivate: [isLoggedInGuard],
    children: [
      {
        path: 'main',
        loadChildren: () =>
          import('./pages/main/routes').then((m) => m.MAIN_ROUTES),
      },

      // {
      //     path: 'profile',
      //     loadChildren: () => import(`./pages/profile-edit/profile-edit.module`).then(m => m.ProfileEditModule),
      // },
      {
        path: 'company',
        loadChildren: () =>
          import('./pages/company/routes').then((m) => m.COMPANY_ROUTES),
      },
      {
        path: 'country',
        loadChildren: () =>
          import('./pages/country/routes').then((m) => m.COUNTRY_ROUTES),
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
export class ApproutingModule { }
