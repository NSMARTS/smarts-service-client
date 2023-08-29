import { Route } from '@angular/router';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyAddComponent } from './company-add/company-add.component';
import { CompanyEditComponent } from './company-edit/company-edit.component';
import { InfoComponent } from '../company-management/info/info.component';
import { HolidayComponent } from '../company-management/holiday/holiday.component';
import { ManagerListComponent } from '../company-management/manager/manager-list/manager-list.component';
import { ManagerAddComponent } from '../company-management/manager/manager-add/manager-add.component';
import { ManagerEditComponent } from '../company-management/manager/manager-edit/manager-edit.component';

export const COMPANY_ROUTES: Route[] = [
  {
    path: '',
    component: CompanyListComponent,
  },
  {
    path: 'company-add',
    component: CompanyAddComponent,
  },
  {
    path: 'company-edit/:id',
    component: CompanyEditComponent,
  },
  {
    path: ':id',
    children: [
      {
        path: '',
        component: InfoComponent,
      },
      {
        path: 'holiday',
        component: HolidayComponent,
      },
      {
        path: 'manager',
        component: ManagerListComponent,
      },
      {
        path: 'manager-add',
        component: ManagerAddComponent,
      },
      {
        path: 'manager-edit/:id',
        component: ManagerEditComponent,
      },
    ],
  },
];
