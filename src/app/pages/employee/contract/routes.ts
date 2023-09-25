import { Route } from '@angular/router';
import { ContractListComponent } from './contract-list/contract-list.component';
import { ContractAddComponent } from './contract-add/contract-add.component';



export const CONTRACT_ROUTES: Route[] = [

  {
    path: '',
    children: [
      {
        path: '',
        component: ContractListComponent,
      },
      {
        path: 'add',
        component: ContractAddComponent,
      },
      // {
      //   path: 'edit/:managerId',
      //   component: ManagerEditComponent,
      // },

    ],
  },
];
