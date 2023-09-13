import { QuillModule } from 'ngx-quill';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationAddComponent } from './notification-add/notification-add.component';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationRoutingModule } from './notification-routing.module';


@NgModule({
  declarations: [
    NotificationListComponent,
    NotificationAddComponent
  ],
  imports: [
    CommonModule,
    MaterialsModule,
    ReactiveFormsModule,
    NotificationRoutingModule,
    QuillModule.forRoot(
      {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],               // custom button values
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],      // superscript/subscript
            [{ indent: '-1' }, { indent: '+1' }],          // outdent/indent
            [{ direction: 'rtl' }],                         // text direction
            [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
            [{ align: [] }],
            ['clean'],                                         // remove formatting button
            ['link', 'image', 'video']                         // link and image, video
          ]
        }
      }
    )
  ]
})
export class NotificationModule { }
