import { Route } from '@angular/router';
import { CountryListComponent } from './country-list/country-list.component';
import { CountryHolidayAddComponent } from './country-holiday-add/country-holiday-add.component';



// In admin/routes.ts:
export const HOLIDAY_ROUTES: Route[] = [
  {
    // localhost:4200/users
    // UserListComponent를 보여줌
    path: '',
    component: CountryListComponent,
  },
  {
    path: ':id',
    component: CountryHolidayAddComponent,
  },
];
