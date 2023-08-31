import { Route } from '@angular/router';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyAddComponent } from './company-add/company-add.component';
import { CompanyEditComponent } from './company-edit/company-edit.component';
import { InfoComponent } from '../corporation/info/info.component';
import { HolidayComponent } from '../corporation/holiday/holiday.component';
import { ManagerListComponent } from '../employee/manager/manager-list/manager-list.component';
import { ManagerAddComponent } from '../employee/manager/manager-add/manager-add.component';
import { ManagerEditComponent } from '../employee/manager/manager-edit/manager-edit.component';
import { LayoutComponent } from 'src/app/components/layout/layout.component';
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
    ],
  },
  {
    path: ':id',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../corporation/routes').then((m) => m.CORPORATION_ROUTES),
      },
      {
        path: 'employee',
        loadChildren: () =>
          import('../employee/employee/routes').then((m) => m.EMPLOYEE_ROUTES),
      },
      {
        path: 'manager',
        loadChildren: () =>
          import('../employee/manager/routes').then((m) => m.MANAGER_ROUTES),
      },
      {
        path: 'meeting',
        loadChildren: () =>
          import('../space/meeting/routes').then((m) => m.MEETING_ROUTES),
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
