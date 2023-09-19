import { PayStub } from './../../interfaces/pay-stub.interface';
import { AuthService, UserInfo } from 'src/app/services/auth.service';
import {
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmployeeService } from 'src/app/services/employee.service';
import { Observable, map, startWith, tap, filter, lastValueFrom } from 'rxjs';
import { Employee } from 'src/app/interfaces/employee.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PayStubService } from 'src/app/services/pay-stub.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Statment } from 'src/app/interfaces/statement.interface';
import * as pdfjsLib from 'pdfjs-dist';
import { DialogService } from 'src/app/services/dialog.service';
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/lib/build/pdf.worker.js';
@Component({
  selector: 'app-pay-stub-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, ReactiveFormsModule],
  templateUrl: './pay-stub-dialog.component.html',
  styleUrls: ['./pay-stub-dialog.component.scss'],
})
export class PayStubDialogComponent implements OnInit {
  currentFile?: File; // 파일 업로드 시 여기에 관리
  progress = 0;
  message = '';
  fileName = 'Select File';
  fileInfos?: Observable<any>;
  key = ''; // 수정 기능으로 사용 시 s3에 저장된 key 값
  filteredEmployee = signal<Employee[]>([]);
  employees: WritableSignal<Employee[]>;

  userInfoStore: WritableSignal<UserInfo>;

  destroyRef = inject(DestroyRef);

  statementForm: FormGroup;

  @ViewChild('pdfViewer') pdfViewer!: ElementRef<HTMLCanvasElement>;

  isLoadingResults = true;

  constructor(
    public dialogRef: MatDialogRef<PayStubDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private payStubService: PayStubService,
    private dialogService: DialogService
  ) // public dialogRef: MatDialogRef<PayStubComapnyListComponent>
  {
    this.statementForm = this.formBuilder.group({
      title: new FormControl('', [Validators.required]),
      // 명세서를 받을 사람 email.
      employee: new FormControl<string>('', [
        Validators.required,
        Validators.email,
      ]),
      writer: new FormControl('', [Validators.required]),
    });

    // 상태저장된 로그인 정보 불러오기
    this.userInfoStore = this.authService.userInfoStore;
    // 상태저장된 employee 리스트 불러오기
    this.employees = this.employeeService.employees;

    // input controller 값 받아오기
    this.statementForm.controls['employee'].valueChanges
      .pipe(
        startWith(''),
        // 받아온 값 employee.name과 일치하는것 끼리 배열로 가져오기
        map((employee) =>
          employee ? this._filterStates(employee) : this.employees().slice()
        ),
        // 배열로 가져온거 시그널에 등록
        map((employees) => this.filteredEmployee.set(employees)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.getEmployees();
  }

  async getEmployees() {
    const employees = await lastValueFrom(
      this.employeeService.getEmployees(this.data.companyId)
    );
    await this.employeeService.setEmployees(employees.data);

    if (this.data.isEditMode) {
      this.payStubService
        .getPayStub(this.data.companyId, this.data.payStubId)
        .subscribe({
          next: (res) => {
            this.statementForm.controls['title'].patchValue(res.data.title);
            this.fileName = res.data.originalname;
            this.key = res.data.key;
            this.statementForm.controls['employee'].patchValue(
              res.data.employee.email
            );
            this.getPdf(this.key);
          },
          error: (error) => {
            console.log(error);
          },
        });
    }
  }

  /**
   * 이름으로 검색하거나 email로 검색 가능
   * @param value
   * @returns
   */
  private _filterStates(value: string): Employee[] {
    const filterValue = value?.toLowerCase();
    return this.employees().filter(
      (state) =>
        state.email.toLowerCase().includes(filterValue) ||
        state.username.toLowerCase().includes(filterValue)
    );
  }

  selectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.toLowerCase().endsWith('.pdf')) {
        // Image resize and update

        this.isLoadingResults = true;
        const file: File = event.target.files[0];
        this.currentFile = file;

        this.renderPdf(file);

        this.fileName = this.currentFile.name;
      } else {
        // this.dialogService.openDialogNegative('Profile photos are only available for PNG and JPG.');
        alert('PDF만 가능합니다.');
      }
    } else {
      this.fileName = 'Select File';
    }
  }

  onSubmit() {
    if (this.hasErrors() || this.fileName === 'Select File') {
      return;
    }

    this.progress = 0;
    this.message = '';

    const formData: PayStub = {
      ...this.statementForm.value,
      file: this.currentFile,
      key: this.key,
      company: this.data.companyId,
      writer: this.userInfoStore()._id,
    };

    if (this.data.isEditMode) {
      this.edit(formData);
    } else {
      this.upload(formData);
    }
  }

  upload(formData: any): void {
    this.payStubService.upload(formData).subscribe({
      next: (event: any) => {
        this.isLoadingResults = false;
        this.dialogService
          .openDialogPositive('Statement has successfully uploaded.')
          .subscribe(() => {
            this.dialogRef.close(true);
          });
      },
      error: (err: any) => {
        console.log(err);
        this.progress = 0;
        if (err.error && err.error.message) {
          this.message = err.error.message;
        } else {
          this.message = 'Could not upload the file!';
        }
        this.currentFile = undefined;
      },
    });
  }

  edit(formData: any): void {
    this.payStubService.edit(this.data.payStubId, formData).subscribe({
      next: (event: any) => {
        this.isLoadingResults = false;
        this.dialogService
          .openDialogPositive('Statement has successfully uploaded.')
          .subscribe(() => {
            this.dialogRef.close(true);
          });
      },
      error: (err: any) => {
        console.log(err);
        this.progress = 0;
        if (err.error && err.error.message) {
          this.message = err.error.message;
        } else {
          this.message = 'Could not upload the file!';
        }
        this.currentFile = undefined;
      },
    });
  }

  // 유효성 검사 함수
  private hasErrors() {
    const titleError = this.statementForm.get('title')?.hasError('required');
    const employeeError = this.statementForm
      .get('employee')
      ?.hasError('required');

    return titleError || employeeError;
  }

  renderPdf(file: File) {
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      const arrayBuffer: ArrayBuffer | null = fileReader.result as ArrayBuffer;

      if (arrayBuffer) {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        loadingTask.promise.then((pdfDocument) => {
          // Assuming you want to render the first page
          pdfDocument.getPage(1).then((page) => {
            const viewport = page.getViewport({ scale: 1 });
            const context = this.pdfViewer.nativeElement.getContext('2d');

            this.pdfViewer.nativeElement.width = viewport.width;
            this.pdfViewer.nativeElement.height = viewport.height;
            // pdf 를 그려주는 canvas태그 최대 크기 지정
            this.pdfViewer.nativeElement.style.maxWidth = 330 + 'px';
            this.pdfViewer.nativeElement.style.maxHeight = 450 + 'px';

            const renderContext = {
              canvasContext: context!,
              viewport: viewport,
            };
            page.render(renderContext);
            this.isLoadingResults = false;
          });
        });
      }
    };
    fileReader.readAsArrayBuffer(file);
  }

  getPdf(url: string) {
    this.payStubService.getPdf(url).subscribe({
      next: async (res: ArrayBuffer) => {
        const loadingTask = pdfjsLib.getDocument({ data: res });

        loadingTask.promise.then((pdfDocument) => {
          // Assuming you want to render the first page
          pdfDocument.getPage(1).then((page) => {
            const viewport = page.getViewport({ scale: 1 });
            const context = this.pdfViewer.nativeElement.getContext('2d');

            this.pdfViewer.nativeElement.width = viewport.width;
            this.pdfViewer.nativeElement.height = viewport.height;
            // pdf 를 그려주는 canvas태그 최대 크기 지정
            this.pdfViewer.nativeElement.style.maxWidth = 450 + 'px';
            this.pdfViewer.nativeElement.style.maxHeight = 700 + 'px';
            const renderContext = {
              canvasContext: context!,
              viewport: viewport,
            };
            page.render(renderContext);
            this.isLoadingResults = false;
          });
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
