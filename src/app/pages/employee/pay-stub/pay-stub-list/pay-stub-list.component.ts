import { DialogService } from './../../../../services/dialog.service';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  WritableSignal,
  inject,
  signal,
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
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  resultsLength = 0;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private payStubService: PayStubService,
    private dialogService: DialogService
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
          this.isRateLimitReached = res.data === null;
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
    const context = canvas.getContext('2d')!;

    // Canvas의 크기와 내용 초기화
    canvas.width = 0;
    canvas.height = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);
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
          });
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  editPayStub(id: string) {

    const dialogRef = this.dialog.open(PayStubDialogComponent, {
      data: {
        companyId: this.companyId,
        payStubId: id,
        isEditMode: true
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getPayStubsByQuery();
    });
  }

  deletePayStub(payStubId: string) {
    this.payStubService.deletePayStub(this.companyId, payStubId).subscribe({
      next: (res) => {
        if (res.success) {
          this.getPayStubsByQuery();
          this.dialogService.openDialogPositive('Statement deleted successfully.');
        }
      },
      error: (error) => {
        this.dialogService.openDialogNegative('An error occurred on the Internet server.');
      }
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(PayStubDialogComponent, {
      data: {
        companyId: this.companyId,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getPayStubsByQuery();
    });
  }
}
