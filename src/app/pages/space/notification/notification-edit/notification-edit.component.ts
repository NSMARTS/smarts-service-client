import {
  AfterViewInit,
  Component,
  DestroyRef,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillEditorComponent } from 'ngx-quill';
import { map, startWith } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-notification-edit',
  templateUrl: './notification-edit.component.html',
  styleUrls: ['./notification-edit.component.scss'],
})
export class NotificationEditComponent implements AfterViewInit {
  text: string = '';
  form = new UntypedFormControl(this.text);

  destroyRef = inject(DestroyRef);

  companyId!: string; //params id
  notificationId!: string; //params id

  maxBytes = 5 * 1024 * 1024; // 5MB
  // ['일반 공지', '회의 공지', '급여 공지', '정책 변경 공지', '기타...']
  categoryList = ['Notice', 'Meeting', 'Pay', 'Policy', 'Issue', 'Etc'];
  editNotificationForm: FormGroup;

  @ViewChild('quillEditor') quillEditor!: QuillEditorComponent;

  isLoadingResults = false;

  quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        // ['code-block'],
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }],
        // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        // [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        //[{ 'direction': 'rtl' }],                         // text direction

        // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        //[{ 'font': [] }],
        // [{ 'align': [] }],
        [{ color: [] }, { background: [] }],

        // ['clean'],                                         // remove formatting button
        ['link', 'image'],
        // ['link', 'image', 'video']
      ],
    },
  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.notificationId = this.route.snapshot.params['notificationId'];

    this.editNotificationForm = this.fb.group({
      title: new FormControl('', [Validators.required]),
      category: new FormControl('Notice', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        startWith(''),
        // 받아온 값 employee.name과 일치하는것 끼리 배열로 가져오기
        map((res) => {
          return (this.text = res);
        }),
        // 배열로 가져온거 시그널에 등록
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  ngAfterViewInit() {
    this.notificationService
      .getNotification(this.companyId, this.notificationId)
      .subscribe({
        next: (res) => {
          this.editNotificationForm.patchValue(res.data);
          this.form.patchValue(res.data.contents);
        },
        error: (error) => console.log(error),
      });
  }

  onSubmit() {
    if (this.editNotificationForm.valid) {
      this.isLoadingResults = true;

      // 텍스트를 UTF-8로 인코딩하여 바이트 수 계산
      // 문자마다 바이트수가 달라서 변환 후 계산
      const textBytes = new TextEncoder().encode(this.text);
      if (textBytes.length > this.maxBytes) {
        this.dialogService.openDialogNegative('Content has exceeded 5MB.');
      }

      if (this.text === null) {
        this.text = '';
      }

      const body = {
        ...this.editNotificationForm.value,
        updator: this.authService.userInfoStore()._id,
        contents: this.text,
      };

      this.notificationService
        .updateNotification(this.companyId, this.notificationId, body)
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.isLoadingResults = false;
              this.router.navigate([
                `/company/${this.companyId}/notification/`,
              ]);
              this.dialogService.openDialogPositive(
                'Successfully, the notification has been edit.'
              );
            }
          },
          error: (error: any) =>
            this.dialogService.openDialogNegative(
              'An error occurred while adding notification.'
            ),
        });
    }
  }

  toBack() {
    this.router.navigate([`/company/${this.companyId}/notification/`]);
  }
}
