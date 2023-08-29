import { PayStubComapnyListComponent } from './comapny-list/comapny-list.component';
import { Route } from '@angular/router';
import { PayStubListComponent } from './pay-stub-list/pay-stub-list.component';


export const PAY_STUB_ROUTES: Route[] = [
  {
    path: '',
    component: PayStubComapnyListComponent,
  },
  {
    path: ':companyName',
    children: [
      {
        path: '',
        component: PayStubListComponent,
      },

    ],
  },

];
