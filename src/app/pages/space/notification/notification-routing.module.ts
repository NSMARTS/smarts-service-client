import { Route, RouterModule } from "@angular/router";
import { NotificationListComponent } from "./notification-list/notification-list.component";
import { NgModule } from "@angular/core";
import { NotificationAddComponent } from "./notification-add/notification-add.component";


export const NOTIFICATION_ROUTES: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        component: NotificationListComponent,
      },
      {
        path: 'add',
        component: NotificationAddComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(NOTIFICATION_ROUTES)],
  exports: [RouterModule]
})
export class NotificationRoutingModule { }