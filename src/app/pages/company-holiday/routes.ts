import { Route } from '@angular/router';
import { CompanyListComponent } from './company-list/company-list.component';
import { HolidayListComponent } from './holiday-list/holiday-list.component';
import { HolidayAddComponent } from './holiday-add/holiday-add.component';

export const COMPANY_HOLIDAY__ROUTES: Route[] = [
  {
    path: '',
    component: CompanyListComponent,
  },
  {
    path: ':id',
    children: [
      {
        path: '',
        component: HolidayListComponent,
      },
      {
        path: 'add',
        component: HolidayAddComponent,
      },
    ],
  },
];
