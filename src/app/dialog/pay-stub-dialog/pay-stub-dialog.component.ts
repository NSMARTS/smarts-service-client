import { PayStub } from './../../interfaces/pay-stub.interface';
import { AuthService, UserInfo } from 'src/app/services/auth/auth.service';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  WritableSignal,
  effect,
  inject,
  signal,
  untracked,
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
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { Observable, map, startWith, tap, filter, lastValueFrom } from 'rxjs';
import { Employee } from 'src/app/interfaces/employee.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PayStubService } from 'src/app/services/pay-stubs/pay-stub.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Statment } from 'src/app/interfaces/statement.interface';
import * as pdfjsLib from 'pdfjs-dist';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { PdfInfo, PdfService } from 'src/app/services/pdf/pdf.service';
import { PDFPageProxy } from 'pdfjs-dist/types/web/interfaces';
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/lib/build/pdf.worker.js';
@Component({
  selector: 'app-pay-stub-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, ReactiveFormsModule],
  templateUrl: './pay-stub-dialog.component.html',
  styleUrls: ['./pay-stub-dialog.component.scss'],
})
export class PayStubDialogComponent implements AfterViewInit {
  currentFile?: File; // 파일 업로드 시 여기에 관리
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
  pdfInfo: WritableSignal<PdfInfo> = this.pdfService.pdfInfo;
  currentPage: WritableSignal<number> = this.pdfService.currentPage;
  pdfLength: WritableSignal<number> = this.pdfService.pdfLength;

  isCanvas = false; // 캔버스를 렌더링 했는지, 안했는지. 했으면 페이지 이동 버튼 보여줌
  isDialog = true; // 다이얼로그를 켰는지 안켰는지

  isLoadingResults = true;

  constructor(
    public dialogRef: MatDialogRef<PayStubDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private payStubService: PayStubService,
    private dialogService: DialogService,
    private pdfService: PdfService // public dialogRef: MatDialogRef<PayStubComapnyListComponent>
  ) {
    this.statementForm = this.formBuilder.group({
      title: new FormControl('', [Validators.required]),
      // 명세서를 받을 사람 email.
      employee: new FormControl<string>('', [
        Validators.required,
        Validators.email,
      ]),
      writer: new FormControl(''),
    });
    if (!this.data.isEditMode) {
      this.isLoadingResults = false;
    }

    effect(() => {
      // 다이얼로그가 켜지고, PDF 페이지 이동 시
      untracked(() => this.pdfInfo());
      if (
        this.pdfInfo().pdfPages.length > 0 &&
        this.currentPage() &&
        this.isDialog
      ) {
        this.pdfService.pdfRender(this.pdfViewer, this.isDialog);
      }
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

  ngAfterViewInit() {
    this.getEmployees();
  }

  getEmployees() {
    // 편집 모드 시 pdf 불러오기
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

  selectFile(event: Event) {
    if (this.pdfInfo().pdfPages.length > 0) {
      this.pdfService.memoryRelease();
    }

    const inputElement = event.target as HTMLInputElement;
    const files: FileList | null = inputElement.files;

    if (!files || !files[0]) {
      this.fileName = 'Select File';
      return;
    }

    if (!files[0].name.toLowerCase().endsWith('.pdf')) {
      this.dialogService.openDialogNegative('Only Pdf file');
      return;
    }

    this.isLoadingResults = true;
    const file: File = files[0];
    this.currentFile = file;
    this.renderPdf(file);
    this.fileName = this.currentFile.name;
  }

  onSubmit() {
    if (this.statementForm.valid) {
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
        if (!this.currentFile) {
          this.dialogService.openDialogNegative(
            'The PDF file was not uploaded.'
          );
          return;
        }
        this.upload(formData);
      }
    }
  }

  upload(formData: any): void {
    this.payStubService.upload(formData).subscribe({
      next: (event: any) => {
        this.isLoadingResults = false;
        this.dialogService
          .openDialogPositive('Statement has successfully uploaded.')
          .subscribe(() => {
            const canvas = this.pdfViewer.nativeElement;
            this.pdfService.clearCanvas(canvas);
            this.dialogRef.close(true);
          });
      },
      error: (err: any) => {
        if (err.error && err.error.message) {
          this.message = err.error.message;
        } else {
          this.message = 'Could not upload the file!';
        }
        this.currentFile = undefined;

        if (err.status === 413) {
          this.dialogRef.close(true);
          this.dialogService.openDialogNegative(
            'The file size is too large. Must be less than 15M.'
          );
        } else {
          this.dialogService.openDialogNegative('upload file Error');
        }
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
            const canvas = this.pdfViewer.nativeElement;
            this.pdfService.clearCanvas(canvas);
            this.dialogRef.close(true);
          });
      },
      error: (err: any) => {
        console.log(err);
        if (err.error && err.error.message) {
          this.message = err.error.message;
        } else {
          this.message = 'Could not upload the file!';
        }
        this.currentFile = undefined;

        if (err.status === 413) {
          this.dialogRef.close(true);
          this.dialogService.openDialogNegative(
            'The file size is too large. Must be less than 15M.'
          );
        } else {
          this.dialogService.openDialogNegative('upload file Error');
        }
      },
    });
  }

  renderPdf(file: File) {
    const fileReader = new FileReader();

    fileReader.onload = async (e) => {
      const arrayBuffer: ArrayBuffer | null = fileReader.result as ArrayBuffer;

      if (arrayBuffer) {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDocument = await loadingTask.promise;

        await this.pdfService.storePdfInfo(pdfDocument);
        this.pdfLength.update(() => pdfDocument.numPages);
        this.currentPage.set(1);
        // this.pdfService.pdfRender(this.pdfViewer, true);
        this.isLoadingResults = false;
        this.isCanvas = true;
      }
    };
    fileReader.readAsArrayBuffer(file);
  }

  getPdf(url: string) {
    this.payStubService.getPdf(url).subscribe({
      next: async (res: ArrayBuffer) => {
        const loadingTask = pdfjsLib.getDocument({ data: res });
        const pdfDocument = await loadingTask.promise;
        await this.pdfService.storePdfInfo(pdfDocument);
        this.isLoadingResults = false;
        this.isCanvas = true;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onPrevPage() {
    if (this.currentPage() <= 1) return;
    this.currentPage.update((prev) => (prev -= 1));
  }

  onNextPage() {
    if (this.currentPage() >= this.pdfLength()) return;
    this.currentPage.update((prev) => (prev += 1));
  }
}
