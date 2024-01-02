import { Route } from "@angular/router";
import { LogHistoryComponent } from "./log-history.component";


export const LOG_HISTORY_ROUTES: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LogHistoryComponent,
      },

    ],
  },

];
