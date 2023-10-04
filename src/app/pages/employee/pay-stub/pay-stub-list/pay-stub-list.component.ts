import { DialogService } from './../../../../services/dialog.service';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom, map, merge, startWith, switchMap } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Employee } from 'src/app/interfaces/employee.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MatDialog } from '@angular/material/dialog';
import { PayStubDialogComponent } from 'src/app/dialog/pay-stub-dialog/pay-stub-dialog.component';
import { PayStubService } from 'src/app/services/pay-stub.service';
import { SelectionModel } from '@angular/cdk/collections';
import * as pdfjsLib from 'pdfjs-dist';
import * as moment from 'moment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSort } from '@angular/material/sort';
import { PdfInfo, PdfService } from 'src/app/services/pdf.service';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { PDFPageProxy } from 'pdfjs-dist/types/web/interfaces';
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/lib/build/pdf.worker.js';

@Component({
  selector: 'app-pay-stub-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './pay-stub-list.component.html',
  styleUrls: ['./pay-stub-list.component.scss'],
})
export class PayStubListComponent implements AfterViewInit {
  selection = new SelectionModel<any>(false, []);
  imgSrc: string = '';
  displayedColumns: string[] = [
    'employeeName',
    'title',
    'uploadDate',
    'download',
    'detail',
    'menu',
  ];

  url: string = '';

  filteredEmployee = signal<Employee[]>([]); // 자동완성에 들어갈 emploeeList

  searchPayStubForm: FormGroup;

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>(
    []
  );

  companyId: string; // 회사아이디 params

  // filterValues: any = {};
  // filterSelectObj: any = [];
  company_max_day: any;
  isRollover = false;
  employees: WritableSignal<Employee[]>;
  paystubs: WritableSignal<any[]>;
  destroyRef = inject(DestroyRef);

  @ViewChild('pdfViewer') pdfViewer!: ElementRef<HTMLCanvasElement>;
  pdfInfo: WritableSignal<PdfInfo> = this.pdfService.pdfInfo;
  currentPage: WritableSignal<number> = this.pdfService.currentPage;
  pdfLength: WritableSignal<number> = this.pdfService.pdfLength;

  pageNumForm = new FormControl({ value: 0, disabled: true });
  isCanvas = false; // 캔버스를 렌더링 했는지, 안했는지. 했으면 페이지 이동 버튼 보여줌
  isDialog = false; // 다이얼로그를 켰는지 안켰는지, 상태에 따라 캔버스가 사이즈가 달라진다.

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  //   isRateLimitReached = false;
  resultsLength = 0;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private payStubService: PayStubService,
    private dialogService: DialogService,
    private pdfService: PdfService
  ) {
    // 이번 달 기준 첫째날
    const startOfMonth = moment().startOf('month').format();
    // 이번 달 기준 마지막날
    const endOfMonth = moment().endOf('month').format();

    this.companyId = this.route.snapshot.params['id'];
    // 상태저장된 employee 리스트 불러오기
    this.employees = this.employeeService.employees;
    // 상태저장된 payStubs 리스트 불러오기
    this.paystubs = this.payStubService.payStubs;

    this.searchPayStubForm = this.fb.group({
      emailFormControl: new FormControl(''),
      uploadStartDate: new FormControl(startOfMonth),
      uploadEndDate: new FormControl(endOfMonth),
      leaveType: new FormControl('all'),
    });

    effect(() => {
      untracked(() => this.pdfInfo());
      // 다이얼로그가 안켜지고, PDF 페이지 이동 시
      if (
        this.pdfInfo().pdfPages.length > 0 &&
        this.currentPage() &&
        !this.isDialog
      ) {
        console.log('뭐가 문제야');
        this.pdfService.pdfRender(this.pdfViewer, this.isDialog);
      }
    });
  }

  ngAfterViewInit(): void {
    this.getEmployees(this.companyId);
    // this.getPayStubs(this.companyId);
  }

  async getEmployees(companyId: string) {
    // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // 서버에 값을 받아올때까지 멈춘다.
    const employees = await lastValueFrom(
      this.employeeService.getEmployees(companyId)
    );
    // signal을 통한 상태관리
    await this.employeeService.setEmployees(employees.data);
    this.setAutoComplete();
  }

  /**
   * email 폼 자동완성 코드 ---------------------------------
   */
  setAutoComplete() {
    // auto complete
    this.searchPayStubForm.controls['emailFormControl'].valueChanges
      .pipe(
        startWith(''),
        map((employee) =>
          employee ? this._filterStates(employee) : this.employees().slice()
        ),
        // 배열로 가져온거 시그널에 등록
        map((employees) => this.filteredEmployee.set(employees)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.getPayStubsByQuery();
  }

  private _filterStates(email: string): Employee[] {
    const filterValue = email.toLowerCase();
    return this.employees().filter(
      (state) =>
        state.email.toLowerCase().includes(filterValue) ||
        state.username.toLowerCase().includes(filterValue)
    );
  }

  getPayStubsByQuery() {
    const formValue = this.searchPayStubForm.value;
    const convertedLeaveStartDate = this.commonService.dateFormatting(
      this.searchPayStubForm.controls['uploadStartDate'].value
    );
    // 검색 범위 마지막 일을 YYYY-MM-DD 포맷으로 변경
    const convertedLeaveEndDate = this.commonService.dateFormatting(
      this.searchPayStubForm.controls['uploadEndDate'].value
    );
    // 조건에 따른 사원들 휴가 가져오기
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const query = {
            ...formValue,
            uploadStartDate: convertedLeaveStartDate,
            uploadEndDate: convertedLeaveEndDate,
            active: this.sort.active,
            direction: this.sort.direction,
            pageIndex: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
          };
          return this.payStubService.getPayStubs(this.companyId, query).pipe();
        }),
        map((res: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          //   this.isRateLimitReached = res.data === null;
          console.log(res.data);
          this.resultsLength = res.total_count;
          this.dataSource = new MatTableDataSource<any>(res.data);
          return res.data;
        })
      )
      .subscribe();
  }

  onRowClick(row: any) {
    this.selection.clear();
    this.selection.select(row);
    this.imgSrc = row?.location;
    this.getPdf(row?.key);
    this.isLoadingResults = true;
  }

  onCanvasClick() {
    this.isLoadingResults = false;
    // 쿼리할때 pdf 그려진거 초기화
    const canvas = this.pdfViewer.nativeElement;
    this.pdfService.clearCanvas(canvas);
    this.pdfService.memoryRelease();
    this.isCanvas = false;
  }

  getPdf(url: string) {
    this.payStubService.getPdf(url).subscribe({
      next: async (res: ArrayBuffer) => {
        const loadingTask = pdfjsLib.getDocument({ data: res });
        const pdfDocument = await loadingTask.promise;
        // PDF 정보를 가져옴
        await this.pdfService.storePdfInfo(pdfDocument);
        this.isCanvas = true;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  editPayStub(id: string) {
    this.isDialog = true;
    const dialogRef = this.dialog.open(PayStubDialogComponent, {
      data: {
        companyId: this.companyId,
        payStubId: id,
        isEditMode: true, // 명세서 등록인지, 수정인지. true면 명세서 수정이다.
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.isDialog = false;
      this.pdfService.memoryRelease();
      this.getPayStubsByQuery();
    });
  }

  deletePayStub(payStubId: string) {
    this.payStubService.deletePayStub(this.companyId, payStubId).subscribe({
      next: (res) => {
        if (res.success) {
          this.getPayStubsByQuery();
          this.dialogService.openDialogPositive(
            'Statement deleted successfully.'
          );
        }
      },
      error: (error) => {
        this.dialogService.openDialogNegative(
          'An error occurred on the Internet server.'
        );
      },
    });
  }

  download(key: string) {
    this.payStubService.downloadPdf(key).subscribe({
      next: (res) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
        // 다운로드 후에는 URL을 해제합니다.
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error(error);
        this.dialogService.openDialogNegative('Internet Server Error.');
      },
    });
  }

  openDialog() {
    this.isDialog = true;
    const dialogRef = this.dialog.open(PayStubDialogComponent, {
      data: {
        companyId: this.companyId,
        employees: this.employees(),
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.isDialog = false;
      // pdf 초기화
      this.pdfService.memoryRelease();
      this.getPayStubsByQuery();
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

  // async onResize() {
  //   await this.pdfService.pdfRender(this.pdfViewer);
  //   this.isCanvas = true;
  // }

  /**
   * Zoom Button에 대한 동작
   * - viewInfoService의 zoomScale 값 update
   *
   * @param action : 'fitToWidth' , 'fitToPage', 'zoomIn', 'zoomOut'
   */
  clickZoom(action: any) {
    // console.log(">> Click Zoom: ", action);
    // const canvas = this.pdfViewer.nativeElement;
    // const newZoomScale = this.pdfService.calcZoomScale(action, this.pdfViewer, this.isDialog, prevZoomScale);
    // this.pdfService.updateZoomScale(newZoomScale);
  }
}
