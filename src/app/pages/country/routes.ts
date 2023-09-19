import { Route } from '@angular/router';
import { CountryListComponent } from './country-list/country-list.component';
import { CountryHolidayListComponent } from './country-holiday-list/country-holiday-list.component';



// In admin/routes.ts:
export const COUNTRY_ROUTES: Route[] = [
  {
    // localhost:4200/users
    // UserListComponent를 보여줌
    path: '',
    component: CountryListComponent,
  },
  {
    path: ':id',
    component: CountryHolidayListComponent,
  },
];
