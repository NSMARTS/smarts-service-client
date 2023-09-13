import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, startWith } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { NotificationService } from 'src/app/services/notification.service';
import { QuillEditorComponent } from 'ngx-quill';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-notification-add',
  templateUrl: './notification-add.component.html',
  styleUrls: ['./notification-add.component.scss']
})
export class NotificationAddComponent implements OnInit {
  text: string = '';
  form = new UntypedFormControl(this.text);
  destroyRef = inject(DestroyRef);
  companyId!: string; //params id
  maxBytes = 5 * 1024 * 1024; // 5MB
  // ['일반 공지', '회의 공지', '급여 공지', '정책 변경 공지', '기타...']
  categoryList = ['Notice', 'Meeting', 'Pay', 'Policy', 'Issue', 'Etc']
  addNotificationForm: FormGroup;

  @ViewChild('quillEditor') quillEditor!: QuillEditorComponent;

  isLoadingResults = false;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private authService: AuthService,
  ) {

    this.companyId = this.route.snapshot.params['id'];

    this.addNotificationForm = this.fb.group({
      title: new FormControl('', [Validators.required]),
      category: new FormControl('Notice', [Validators.required]),
    });

  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(
      startWith(''),
      // 받아온 값 employee.name과 일치하는것 끼리 배열로 가져오기
      map((res) => {
        return this.text = res
      }),
      map((res) =>
        console.log(res)
      ),
      // 배열로 가져온거 시그널에 등록
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe();
  }

  onSubmit() {
    this.isLoadingResults = true;

    // 텍스트를 UTF-8로 인코딩하여 바이트 수 계산
    // 문자마다 바이트수가 달라서 변환 후 계산
    const textBytes = new TextEncoder().encode(this.text);
    if (textBytes.length > this.maxBytes) {
      this.dialogService.openDialogNegative("Content has exceeded 5MB.")
    }

    const body = {
      ...this.addNotificationForm.value,
      company: this.companyId,
      writer: this.authService.userInfoStore()._id,
      contents: this.text
    }

    this.notificationService.createNotification(body).subscribe({
      next: (res) => {
        if (res) {
          this.isLoadingResults = false;
          this.router.navigate([`/company/${this.companyId}/notification/`]);
        }
      },
      error: (error: any) =>
        this.dialogService.openDialogNegative("Server Occur Error!")
    })

  }

  toBack() {
    this.router.navigate([`/company/${this.companyId}/notification/`]);
  }
}
