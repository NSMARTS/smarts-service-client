import { Route } from '@angular/router';
import { ManagerListComponent } from './manager-list/manager-list.component';
import { ManagerAddComponent } from './manager-add/manager-add.component';
import { ManagerEditComponent } from './manager-edit/manager-edit.component';
import { ManagerManagementComponent } from './manager-management/manager-management.component';

export const MANAGER_ROUTES: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ManagerListComponent,
      },
      {
        path: 'add',
        component: ManagerAddComponent,
      },
      {
        path: 'edit/:managerId',
        component: ManagerEditComponent,
      },
      {
        path: 'management/:managerId',
        component: ManagerManagementComponent,
      },
    ],
  },
];
