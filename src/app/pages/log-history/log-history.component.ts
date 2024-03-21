import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ViewChild,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialsModule } from 'src/app/materials/materials.module';
import * as moment from 'moment';
import { CompanyService } from 'src/app/services/company/company.service';
import {
  catchError,
  lastValueFrom,
  map,
  merge,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LogService } from 'src/app/services/log/log.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogService } from 'src/app/services/dialog/dialog.service';

import { FindUserLogsComponent } from './find-user-logs/find-user-logs.component';
import { PeriodicElement } from '../main/main.component';

@Component({
  selector: 'app-log-history',
  standalone: true,
  imports: [
    CommonModule,
    MaterialsModule,
    ReactiveFormsModule,
    FindUserLogsComponent,
  ],
  templateUrl: './log-history.component.html',
  styleUrls: ['./log-history.component.scss'],
})
export class LogHistoryComponent {
  selectedRowId: string | null = null;
  // Dependency inject
  private fb = inject(FormBuilder);
  companyService = inject(CompanyService);
  logService = inject(LogService);
  dialogService = inject(DialogService);

  filteredCompany = signal<any[]>([]); // 자동완성에 들어갈

  companies = signal<any[]>([]);

  destroyRef = inject(DestroyRef);

  displayedColumns: string[] = ['employee', 'company', 'leaveTime', 'url'];

  dataSource = new MatTableDataSource<any>([]);
  searchLogsForm: FormGroup;

  clickedRows = new Set<PeriodicElement>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  resultsLength = 0;

  startOfMonth: Date;
  endOfMonth: Date;

  constructor() {
    // string을 date 형식으로 바꿔야지 table에 나온다 ...
    this.startOfMonth = moment().startOf('month').toDate();

    // 이번 달의 마지막 날, 시간을 23:59:59로 설정
    this.endOfMonth = moment()
      .endOf('month')
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();

    this.searchLogsForm = this.fb.group({
      companyFormControl: new FormControl(''),
      emailFormControl: new FormControl(''),
      startOfMonth: new FormControl(this.startOfMonth),
      endOfMonth: new FormControl(this.endOfMonth),
    });
  }
  ngAfterViewInit(): void {
    this.getCompanies();
  }

  async getCompanies() {
    try {
      // 비동기 요청으로 회사 목록을 가져옵니다.
      const companies: any = await lastValueFrom(this.companyService.getCompanyList().pipe(
        catchError(error => {
          console.error('Error fetching company list', error);
          return of([]); // 오류가 발생하면 빈 배열 반환
        })
      ));
      // 새 회사 정보 추가
      const updatedData = [...companies.data, { companyName: 'Global HR KOREA' }];

      // 업데이트된 데이터 세팅
      this.companies.set(updatedData);

      // 자동 완성 설정
      this.setAutoComplete();
    } catch (error) {
      console.error('Failed to fetch companies', error);
    }
  }

  /**
   * email 폼 자동완성 코드 ---------------------------------
   */
  setAutoComplete() {
    // auto complete
    this.searchLogsForm.controls['companyFormControl'].valueChanges
      .pipe(
        startWith(''),
        map((company) =>
          company ? this._filterStates(company) : this.companies().slice()
        ),
        // 배열로 가져온거 시그널에 등록
        map((companies) => this.filteredCompany.set(companies)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.getEmployeesByQuery();
  }
  private _filterStates(company: string): any[] {
    const filterValue = company.toLowerCase();
    return this.companies().filter((state) =>
      state.companyName.toLowerCase().includes(filterValue)
    );
  }

  getEmployeesByQuery() {
    const formValue = this.searchLogsForm.value;

    this.startOfMonth = this.searchLogsForm.controls['startOfMonth'].value;
    // 선택한날 23:59:59초로 변경
    this.endOfMonth = moment(this.searchLogsForm.controls['endOfMonth'].value)
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();

    console.log(formValue)

    // 조건에 따른 사원들 휴가 가져오기
    this.sort.sortChange.subscribe((res) => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          const query = {
            ...formValue,
            startOfMonth: this.startOfMonth,
            endOfMonth: this.endOfMonth,
            active: this.sort.active,
            direction: this.sort.direction,
            pageIndex: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
          };
          return this.logService.getLogs(query).pipe(
            catchError((error: HttpErrorResponse) => {
              // 에러 다이얼로그를 여는 코드
              this.dialogService.openDialogNegative(error.error.message);
              return of(null);
            })
          );
        }),
        map((res: any) => {
          // Flip flag to show that loading has finished.
          //   this.isRateLimitReached = res.data === null;
          console.log(res)
          const updatedData = res.data.map((log: any) => {
            return {
              ...log,
              enterTime: moment(log.enterTime, 'YYYY-MM-DD HH:mm:ss').toDate(),
              leaveTime: moment(log.leaveTime, 'YYYY-MM-DD HH:mm:ss').toDate()
            };
          })


          this.resultsLength = res.total_count;
          this.dataSource = new MatTableDataSource<any>(updatedData);
          return updatedData;
        })
      )
      .subscribe();
  }

  handleClick(row: any) {
    const setData = {
      ...row,
      startOfMonth: this.startOfMonth,
      endOfMonth: this.endOfMonth,
    };
    this.logService.setSelectedLog(setData);

    this.selectedRowId = row._id;
  }
}
