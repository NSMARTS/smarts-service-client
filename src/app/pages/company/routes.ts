import { Route } from '@angular/router';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyAddComponent } from './company-add/company-add.component';
import { CompanyEditComponent } from './company-edit/company-edit.component';

import { CompanyService } from 'src/app/services/company.service';

export const COMPANY_ROUTES: Route[] = [
  {
    path: '',
    providers: [CompanyService],
    children: [
      {
        path: '',
        component: CompanyListComponent,
      },

      {
        path: 'add',
        component: CompanyAddComponent,
      },
      {
        path: 'edit/:id',
        component: CompanyEditComponent,
      },
      {
        path: ':id',
        loadChildren: () =>
          import('../corporation/routes').then((m) => m.CORPORATION_ROUTES),
      },
      {
        path: ':id/employee',
        loadChildren: () =>
          import('../employee/employee/routes').then((m) => m.EMPLOYEE_ROUTES),
      },
      {
        path: ':id/manager',
        loadChildren: () =>
          import('../employee/manager/routes').then((m) => m.MANAGER_ROUTES),
      },
      {
        path: ':id/meeting',
        loadChildren: () =>
          import('../space/meeting/routes').then((m) => m.MEETING_ROUTES),
      },
      {
        path: ':id/retire-employee',
        loadChildren: () =>
          import('../employee/retire-employee/routes').then(
            (m) => m.RETIRED_EMPLOYEE_ROUTES
          ),
      },
      {
        path: ':id/pay-stub',
        loadChildren: () =>
          import('../employee/pay-stub/routes').then((m) => m.PAY_STUB_ROUTES),
      },
      {
        path: ':id/leave-status',
        loadChildren: () =>
          import('../employee/leave-status/routes').then((m) => m.LEAVE_STATUS_ROUTES),
      },
    ],
  },
  {
    path: '**',
    // url이 틀리면 회사 리스트 컴포넌트로
    redirectTo: '',
    pathMatch: 'full',
  },
];
