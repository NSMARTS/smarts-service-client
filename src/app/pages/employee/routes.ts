import { Route } from '@angular/router';
import { EmployeeCompanyListComponent } from './company-list/employee-company-list.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeEditComponent } from './employee-edit/employee-edit.component';
import { EmployeeViewComponent } from './employee-view/employee-view.component';
import { EmployeeAddComponent } from './employee-add/employee-add.component';
import { RetiredEmployeeListComponent } from './retired-employee-list/retired-employee-list.component';

export const EMPLOYEE_ROUTES: Route[] = [
  {
    path: 'company-list',
    component: EmployeeCompanyListComponent,
  },
  {
    path: 'retire',
    component: EmployeeCompanyListComponent,
  },
  {
    path: ':companyName',
    children: [
      {
        path: '',
        component: EmployeeListComponent,
      },
      {
        path: 'add',
        component: EmployeeAddComponent,
      },
      {
        path: 'edit/:id',
        component: EmployeeEditComponent,
      },
      {
        path: 'view/:id',
        component: EmployeeViewComponent,
      },
      {
        path: 'retire',
        component: RetiredEmployeeListComponent,
      },
    ],
  },
];
