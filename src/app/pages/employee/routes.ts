import { Route } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';

import { EmployeeCompanyListComponent } from './company-list/employee-company-list.component';

export const EMPLOYEE_ROUTES: Route[] = [
    {
        path: '',
        component: EmployeeListComponent,
        // children: [
        //   {
        //     path: 'edit/:id',
        //     component: EmployeeEditComponent,
        //   },
        //   {
        //     path: 'view/:id',
        //     component: EmployeeViewComponent,
        //   },
        // ],
    },
    {
        path: 'company-list',
        component: EmployeeCompanyListComponent,
    },
    // {
    // path: 'add',
    // component: EmployeeAddComponent,
    // },
];
