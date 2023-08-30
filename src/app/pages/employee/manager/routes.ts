import { Route } from '@angular/router';
import { ManagerListComponent } from './manager-list/manager-list.component';
import { ManagerAddComponent } from './manager-add/manager-add.component';
import { ManagerEditComponent } from './manager-edit/manager-edit.component';


export const MANAGER_ROUTES: Route[] = [
  {
    path: '',
    component: ManagerListComponent
  },
  {
    path: '',
    children: [
      {
        path: 'add',
        component: ManagerAddComponent,
      },
      {
        path: 'edit/:managerId',
        component: ManagerEditComponent,
      },

    ],
  },
];
