import { Route } from '@angular/router';
import { InfoComponent } from './info/info.component';
import { HolidayComponent } from './holiday/holiday.component';


// In admin/routes.ts:
export const CORPORATION_ROUTES: Route[] = [
  {
    // localhost:4200/users
    // UserListComponent를 보여줌
    path: '',
    loadComponent: () => InfoComponent,
  },
  {
    // localhost:4200/users
    // UserListComponent를 보여줌
    path: 'holiday',
    loadComponent: () => HolidayComponent,
  },
];
