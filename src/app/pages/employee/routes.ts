/**
 * Version: 1.0
 * 파일명: pages/employee/routes.ts
 * 작성일자: 2023-08-17
 * 작성자: 이정운
 * @See File routes.ts
 * 설명: route 파일 
 * 수정일자: 2023-08-17
 * 수정자: 이정운
 * 수정내역: routes.ts 생성
 */

import { Route } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeAddComponent } from './employee-add/employee-add.component';
import { EmployeeEditComponent } from './employee-edit/employee-edit.component';
import { EmployeeViewComponent } from './employee-view/employee-view.component';

export const EMPLOYEE_ROUTES: Route[] = [
    {
        path: '',
        component: EmployeeListComponent,
        children: [
            {
                path: 'edit/:id',
                component: EmployeeEditComponent
            },
            {
                path: 'view/:id',
                component: EmployeeViewComponent
            }
        ]
    },
    {
        path: 'add',
        component: EmployeeAddComponent,
    },
];
