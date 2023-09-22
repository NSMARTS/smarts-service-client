import { CommonService } from './../../../../services/common.service';
import { Notification } from './../../../../interfaces/notification.interface';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillViewComponent } from 'ngx-quill';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
})
export class NotificationDetailComponent implements AfterViewInit {
  companyId: string = '';
  notificationId: string = '';

  @ViewChild('quillViewer') quillViewer!: QuillViewComponent;
  contents: string = '';
  notification: any;

  convertedCreatedAt: string = '';
  convertedUpdatedAt: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private commonService: CommonService,

    private authService: AuthService
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.notificationId = this.route.snapshot.params['notificationId'];
  }

  ngAfterViewInit() {
    this.notificationService
      .getNotification(this.companyId, this.notificationId)
      .subscribe({
        next: (res) => {
          console.log(res);
          const { contents, createAt, updateAt, ...rest } = res.data;
          this.contents = contents;
          this.convertedCreatedAt = this.commonService.dateFormatting(createAt);
          this.convertedUpdatedAt = this.commonService.dateFormatting(updateAt);
          this.notification = rest;
        },
        error: (error) => console.log(error),
      });
  }
}
