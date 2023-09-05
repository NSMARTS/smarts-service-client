import { Route } from '@angular/router';
import { RetiredEmployeeListComponent } from './retire-employee.component';

export const RETIRED_EMPLOYEE_ROUTES: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        component: RetiredEmployeeListComponent,
      },
    ],
  },
];
