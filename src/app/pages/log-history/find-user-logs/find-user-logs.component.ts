import {
  Component,
  DestroyRef,
  ViewChild,
  WritableSignal,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CommonService } from 'src/app/services/common/common.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { LogService } from 'src/app/services/log/log.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';
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
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-find-user-logs',
  standalone: true,
  imports: [CommonModule, MaterialsModule, ReactiveFormsModule],
  templateUrl: './find-user-logs.component.html',
  styleUrls: ['./find-user-logs.component.scss'],
})
export class FindUserLogsComponent {
  // Dependency inject
  private fb = inject(FormBuilder);
  companyService = inject(CompanyService);
  logService = inject(LogService);
  dialogService = inject(DialogService);
  destroyRef = inject(DestroyRef);

  filteredCompany = signal<any[]>([]); // 자동완성에 들어갈

  companies = signal<any[]>([]);

  selectedLog: WritableSignal<any> = this.logService.selectedLog;

  displayedColumns: string[] = ['enterTime', 'leaveTime', 'url'];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  resultsLength = 0;

  constructor() {
    effect(() => {
      // 마지막 행적 클릭 시 추적
      if (this.selectedLog()._id) {
        this.getLogsByQuery();
      }
    });
  }

  ngAfterViewInit() {
    // 조건에 따른 사원들 휴가 가져오기
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  getLogsByQuery() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          let query: any = {
            startOfMonth: this.selectedLog().startOfMonth,
            endOfMonth: this.selectedLog().endOfMonth,
            active: this.sort.active,
            direction: this.sort.direction,
            pageIndex: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
            ...(this.selectedLog()?.admin?.email
              ? { admin: this.selectedLog().admin.email }
              : {}),
            ...(this.selectedLog()?.manager?.email
              ? { manager: this.selectedLog().manager.email }
              : {}),
            ...(this.selectedLog()?.employee?.email
              ? { employee: this.selectedLog().employee.email }
              : {}),
          };

          return this.logService.getUserLogs(query).pipe(
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
          const updatedData = res.data.map((log: any) => {
            return {
              ...log,
              enterTime: moment(log.enterTime, 'YYYY-MM-DD HH:mm:ss').toDate(),
              leaveTime: moment(log.leaveTime, 'YYYY-MM-DD HH:mm:ss').toDate()
            };
          })
          this.resultsLength = res.total_count;
          this.dataSource = new MatTableDataSource<any>(updatedData);
          return res.data;
        })
      )
      .subscribe();
  }
}
