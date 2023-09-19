import { Route } from '@angular/router';
import { ContractListComponent } from './contract-list/contract-list.component';



export const CONTRACT_ROUTES: Route[] = [

  {
    path: '',
    children: [
      {
        path: '',
        component: ContractListComponent,
      },
      // {
      //   path: 'add',
      //   component: ManagerAddComponent,
      // },
      // {
      //   path: 'edit/:managerId',
      //   component: ManagerEditComponent,
      // },

    ],
  },
];
