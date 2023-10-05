import { Route } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeProfileEditComponent } from './employee-profile-edit/employee-profile-edit.component';

import { EmployeeAddComponent } from './employee-add/employee-add.component';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeLeaveEditComponent } from './employee-leave-edit/employee-leave-edit.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';

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
        path: 'detail/:employeeId',
        component: EmployeeDetailComponent,
      },
      {
        path: 'editEmployeeProfile/:employeeId',
        component: EmployeeProfileEditComponent,
      },
      {
        path: 'editEmployeeLeave/:employeeId',
        component: EmployeeLeaveEditComponent,
      },
    ],
  },
];
