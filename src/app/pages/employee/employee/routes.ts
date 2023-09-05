import { Route } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeEditComponent } from './employee-edit/employee-edit.component';

import { EmployeeAddComponent } from './employee-add/employee-add.component';
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
