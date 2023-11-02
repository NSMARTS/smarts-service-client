import { Route } from '@angular/router';
import { RetiredManagerListComponent } from './retire-manager.component';

export const RETIRED_MANAGER_ROUTES: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        component: RetiredManagerListComponent,
      },
    ],
  },
];
