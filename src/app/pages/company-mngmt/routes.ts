import { Route } from '@angular/router';
import { CompanyListComponent } from './company-list/company-list.component';
import { AddCompanyComponent } from './add-company/add-company.component';
import { EditCompanyComponent } from './edit-company/edit-company.component';

export const COMPANY_MNGMT_ROUTES: Route[] = [
  {
    path: 'company-list',
    component: CompanyListComponent,
  },
  {
    path: 'add-company',
    component: AddCompanyComponent,
  },
  {
    path: 'edit-company/:id',
    component: EditCompanyComponent,
  },
];
