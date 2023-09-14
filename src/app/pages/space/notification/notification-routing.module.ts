import { Route, RouterModule } from "@angular/router";
import { NotificationListComponent } from "./notification-list/notification-list.component";
import { NgModule } from "@angular/core";
import { NotificationAddComponent } from "./notification-add/notification-add.component";
import { NotificationEditComponent } from "./notification-edit/notification-edit.component";
import { NotificationDetailComponent } from "./notification-detail/notification-detail.component";


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
      {
        path: 'edit/:notificationId',
        component: NotificationEditComponent,
      },
      {
        path: 'detail/:notificationId',
        component: NotificationDetailComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(NOTIFICATION_ROUTES)],
  exports: [RouterModule]
})
export class NotificationRoutingModule { }