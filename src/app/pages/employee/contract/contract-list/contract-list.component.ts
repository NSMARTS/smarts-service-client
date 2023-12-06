import { Component, DestroyRef, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { catchError, lastValueFrom, map, merge, of, startWith, switchMap } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Employee } from 'src/app/interfaces/employee.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from 'src/app/services/common/common.service';
import { ContractService } from 'src/app/services/contract/contract.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss']
})
export class ContractListComponent {

  // ----------서비스 주입-------------------
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  employeeService = inject(EmployeeService);
  commonService = inject(CommonService);
  contractService = inject(ContractService);
  dialogService = inject(DialogService);

  // ---------- 변수 선언 ------------------
  searchContractForm: FormGroup;
  companyId: string;
  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>([]);
  destroyRef = inject(DestroyRef);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  selection = new SelectionModel<any>(false, []);
  displayedColumns: string[] = [
    'uploadDate',
    'title',
    'writer',
    'employeeName',
    'employeeStatus',
    'managerName',
    'managerStatus',
    'download',
    'detail',
    'menu',
  ];
  resultsLength = 0;
  pdfUrl: string | null = null;;


  // ---------- 시그널 변수 -----------------
  filteredEmployee = signal<Employee[]>([]); // 자동완성에 들어갈 emploeeList
  employees: WritableSignal<Employee[]>;


  constructor() {
    this.companyId = this.route.snapshot.params['id'];

    // 이번 달 기준 첫째날
    const startOfMonth = moment().startOf('month').format();
    // 이번 달 기준 마지막날
    const endOfMonth = moment().endOf('month').format();

    this.employees = this.employeeService.employees;


    this.searchContractForm = this.fb.group({
      titleFormControl: new FormControl(''),
      emailFormControl: new FormControl(''),
      uploadStartDate: new FormControl(startOfMonth),
      uploadEndDate: new FormControl(endOfMonth),
    })
  }

  createContract() {
    this.router.navigate([`company/${this.companyId}/contract/add`]);
  }

  ngAfterViewInit(): void {
    this.getEmployees(this.companyId);
    // this.getPayStubs(this.companyId);
  }

  ngOnDestroy() {
    // 컴포넌트가 파괴될 때 Blob URL 해제, 안하면 다운로드한 pdf가 브라우저 메모리를 잡아먹는다.
    if (this.pdfUrl) {
      window.URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = null;
    }
  }


  async getEmployees(companyId: string) {
    // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // 서버에 값을 받아올때까지 멈춘다.
    const employees = await lastValueFrom(
      this.employeeService.getEmployees(companyId)
    );
    // signal을 통한 상태관리
    this.employeeService.setEmployees(employees.data);
    this.setAutoComplete();
  }

  /**
   * email 폼 자동완성 코드 ---------------------------------
   */
  setAutoComplete() {
    // auto complete
    this.searchContractForm.controls['emailFormControl'].valueChanges
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

    this.getContractsByQuery();
  }

  private _filterStates(email: string): Employee[] {
    const filterValue = email.toLowerCase();
    return this.employees().filter(
      (state) =>
        state.email.toLowerCase().includes(filterValue) ||
        state.username.toLowerCase().includes(filterValue)
    );
  }

  getContractsByQuery() {
    const formValue = this.searchContractForm.value;
    const convertedLeaveStartDate = this.commonService.dateFormatting(
      this.searchContractForm.controls['uploadStartDate'].value
    );
    // 검색 범위 마지막 일을 YYYY-MM-DD 포맷으로 변경
    const convertedLeaveEndDate = this.commonService.dateFormatting(
      this.searchContractForm.controls['uploadEndDate'].value
    );
    // 조건에 따른 사원들 휴가 가져오기
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          const query = {
            ...formValue,
            uploadStartDate: convertedLeaveStartDate,
            uploadEndDate: convertedLeaveEndDate,
            active: this.sort.active,
            direction: this.sort.direction,
            pageIndex: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
          };
          return this.contractService.getContracts(this.companyId, query).pipe(
            catchError((error: HttpErrorResponse) => {
              // 에러 다이얼로그를 여는 코드
              this.dialogService.openDialogNegative(
                error.error.message
              );
              return of(null);
            })
          );
        }),
        map((res: any) => {
          // Flip flag to show that loading has finished.
          //   this.isRateLimitReached = res.data === null;
          console.log(res.data);
          this.resultsLength = res.total_count;
          this.dataSource = new MatTableDataSource<any>(res.data);
          return res.data;
        })
      ).subscribe();
  }

  download(key: string) {
    this.contractService.downloadPdf(key).subscribe({
      next: (res) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        this.pdfUrl = window.URL.createObjectURL(blob);
        window.open(this.pdfUrl);
      },
      error: (error) => {
        console.error(error);
        this.dialogService.openDialogNegative('Internet Server Error.');
      },
    });
  }

  /**
   * 디테일 페id로
   * @param row 
   */
  onRowClick(contractId: string) {
    console.log('contractId', contractId)
    this.router.navigate([`company/${this.companyId}/contract/detail/${contractId}`]);

  }


  openEditContractDialog(contractId: string, employeeStatus: string, managerStatus: string) {
    if (employeeStatus !== 'pending' || managerStatus !== 'pending') {
      this.dialogService.openDialogNegative('This document has been signed or declined. No further modifications are allowed.')
    } else {
      this.router.navigate([`company/${this.companyId}/contract/edit/${contractId}`]);
    }
  }

  openDeleteContractDialog(_id: string, employeeStatus: string, managerStatus: string) {
    if (employeeStatus !== 'pending' || managerStatus !== 'pending') {
      this.dialogService.openDialogNegative('This document has been signed or declined. No further deleted are allowed.')
    } else {
      this.contractService.deleteContract(_id).subscribe({
        next: (res) => {
          this.dialogService.openDialogPositive(res.message).subscribe({
            next: (res) => this.getContractsByQuery()
          })
        },
        error: (err) => this.dialogService.openDialogNegative(err.error.message)
      })
    }
  }
}
