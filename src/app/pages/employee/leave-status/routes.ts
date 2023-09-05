import { Route } from "@angular/router";
import { LeaveStatusComponent } from "./leave-status.component";


export const LEAVE_STATUS_ROUTES: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LeaveStatusComponent,
      },

    ],
  },

];
