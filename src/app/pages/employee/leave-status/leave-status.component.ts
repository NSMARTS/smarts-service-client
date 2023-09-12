import { AfterViewInit, Component, DestroyRef, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from 'src/app/interfaces/employee.interface';
import { EmployeeService } from 'src/app/services/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, lastValueFrom, map, merge, startWith, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { LeaveRequest } from 'src/app/interfaces/leave-request.interface';
import { MatSort } from '@angular/material/sort';
import { LeaveStatusDetailDialogComponent } from 'src/app/dialog/leave-status-detail-dialog/leave-status-detail-dialog.component';

@Component({
  selector: 'app-leave-status',
  standalone: true,
  imports: [CommonModule, MaterialsModule, ReactiveFormsModule],
  templateUrl: './leave-status.component.html',
  styleUrls: ['./leave-status.component.scss']
})
export class LeaveStatusComponent implements AfterViewInit {

  companyId: string; // parameter

  filteredEmployee = signal<Employee[]>([]) // 자동완성에 들어갈 emploeeList
  employees: WritableSignal<Employee[]>

  destroyRef = inject(DestroyRef);


  displayedColumns: string[] = [
    'leaveStartDate',
    'leaveEndDate',
    'requestor',
    'requestorEmail',
    'leaveType',
    'leaveDuration',
    'status'
  ];

  dataSource = new MatTableDataSource<LeaveRequest>([]);

  searchLeaveStatusForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  resultsLength = 0;


  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    public dialog: MatDialog,
    private commonService: CommonService,
    private route: ActivatedRoute,
    // private excelSrv: ExcelService,
  ) {
    // 이번 달 기준 첫째날 
    const startOfMonth = moment().startOf('month').format();
    // 이번 달 기준 마지막날
    const endOfMonth = moment().endOf('month').format();

    this.companyId = this.route.snapshot.params['id'];
    this.employees = this.employeeService.employees // 시그널 불러오기

    this.searchLeaveStatusForm = this.fb.group({
      emailFormControl: new FormControl(''),
      leaveStartDate: new FormControl(startOfMonth),
      leaveEndDate: new FormControl(endOfMonth),
      leaveType: new FormControl('all'),
    })
  }

  ngAfterViewInit() {
    this.getEmployees();
  }

  async getEmployees() {
    const employees = await lastValueFrom(this.employeeService.getEmployees(this.companyId))
    await this.employeeService.employees.set(employees.data)
    this.setAutoComplete() // employeeList를 불러와서 자동완성에 사용
  }

  /**
   * email 폼 자동완성 코드 ---------------------------------
   */
  setAutoComplete() {
    // auto complete
    this.searchLeaveStatusForm.controls['emailFormControl'].valueChanges
      .pipe(
        startWith(''),
        map(employee => (employee ? this._filterStates(employee) : this.employees().slice())),
        // 배열로 가져온거 시그널에 등록
        map(employees => this.filteredEmployee.set(employees)),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe()

    this.myEmployeeLeaveListSearch();
  }

  private _filterStates(email: string): Employee[] {
    const filterValue = email.toLowerCase();
    return this.employees().filter(
      state =>
        state.email.toLowerCase().includes(filterValue) ||
        state.username.toLowerCase().includes(filterValue)
    );
  }

  /**
   * 휴가 사용 내역 목록 조회
   */
  myEmployeeLeaveListSearch() {
    const formValue = this.searchLeaveStatusForm.value;
    // 검색 범위 시작일을 YYYY-MM-DD 포맷으로 변경
    const convertedLeaveStartDate = this.commonService.dateFormatting(this.searchLeaveStatusForm.controls['leaveStartDate'].value)
    // 검색 범위 마지막 일을 YYYY-MM-DD 포맷으로 변경
    const convertedLeaveEndDate = this.commonService.dateFormatting(this.searchLeaveStatusForm.controls['leaveEndDate'].value)



    // 조건에 따른 사원들 휴가 가져오기
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const myEmployeeInfo = {
            ...formValue,
            leaveStartDate: convertedLeaveStartDate,
            leaveEndDate: convertedLeaveEndDate,
            active: this.sort.active,
            direction: this.sort.direction,
            pageIndex: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize
          }

          return this.employeeService.getEmployeeLeaveListSearch(this.companyId, myEmployeeInfo).pipe()
        }),
        map((res: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = res.data === null;
          this.resultsLength = res.total_count;
          this.dataSource = new MatTableDataSource<LeaveRequest>(res.data);
          return res.data;
        }),
      )
      .subscribe();
  }

  openLeaveStatusDetailDialog(data: LeaveRequest) {
    console.log(data)
    const dialogRef = this.dialog.open(LeaveStatusDetailDialogComponent, {
      maxWidth: '600px',
      width: '100%',
      data
    });
  }


}
