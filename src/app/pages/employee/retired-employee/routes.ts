import { Route } from '@angular/router';
import { RetiredEmployeeListComponent } from './retired-employee.component';

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
