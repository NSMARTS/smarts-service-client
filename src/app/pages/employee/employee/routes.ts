import { Route } from '@angular/router';
import { EmployeeCompanyListComponent } from '../company-list(안씀 참조용)/employee-company-list.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeEditComponent } from './employee-edit/employee-edit.component';

import { EmployeeAddComponent } from './employee-add/employee-add.component';
import { RetiredEmployeeListComponent } from '../retired-employee-list/retired-employee-list.component';
import { EmployeeService } from 'src/app/services/employee.service';

export const EMPLOYEE_ROUTES: Route[] = [
  {
    path: '',
    providers: [EmployeeService],
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
        path: 'edit/:employeeId',
        component: EmployeeEditComponent,
      },
    ],
  },
];
