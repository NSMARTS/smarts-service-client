import { QuillModule } from 'ngx-quill';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationAddComponent } from './notification-add/notification-add.component';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationEditComponent } from './notification-edit/notification-edit.component';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';

@NgModule({
  declarations: [
    NotificationListComponent,
    NotificationAddComponent,
    NotificationEditComponent,
    NotificationDetailComponent,
  ],
  imports: [
    CommonModule,
    MaterialsModule,
    ReactiveFormsModule,
    NotificationRoutingModule,
    QuillModule,
  ],
})
export class NotificationModule {}
