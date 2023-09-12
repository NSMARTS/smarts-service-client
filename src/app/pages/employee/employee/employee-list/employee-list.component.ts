import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonService } from 'src/app/services/common.service';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  WritableSignal,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { Employee } from 'src/app/interfaces/employee.interface';
import * as moment from 'moment';
import { lastValueFrom, map, merge, startWith, switchMap } from 'rxjs';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'profile',
    'name',
    'email',
    'year',
    'entitlement',
    'sickLeave',
    'replacementDay',
    'rollover',
    'advanceLeave',
    'annualPolicy',
    'empStartDate',
    'btns',
    // 'edit',
    // 'retire',
  ];

  companyId: string; // 회사아이디 params

  filterValues: any = {};
  filterSelectObj: any = [];
  company_max_day: any;
  isRollover = false;
  employees: WritableSignal<Employee[]>;

  dataSource = new MatTableDataSource<Employee>(
    []
  );

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  resultsLength = 0;

  constructor(
    private employeeService: EmployeeService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.employees = this.employeeService.employees;
  }

  ngAfterViewInit() {
    this.getEmployees();
  }

  async getEmployees() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.employeeService.getEmployeesWithQueryParameters(
            this.companyId,
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize
          ).pipe()
        }),
        map(async (res: any) => {
          // https://material.angular.io/components/table/examples
          this.isLoadingResults = false;
          this.isRateLimitReached = res.data === null;
          this.resultsLength = res.total_count;

          console.log(res.data)
          await this.employeeService.setEmployees(res.data);
          this.dataSource = new MatTableDataSource<Employee>(this.employees());

          return this.employees();
        }),
      )
      .subscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editEmployee(id: string) {
    this.router.navigate([`/company/${this.companyId}/employee/edit/${id}`]);
  }
  addEmployee() {
    this.router.navigate([`/company/${this.companyId}/employee/add`]);
  }

  // 퇴사자 추가
  retireEmployee(id: string) {
    console.log(id);
    this.employeeService.retireEmployee(id).subscribe({
      next: (data: any) => {
        this.getEmployees();
        console.log(data);
      },
      error: (err: any) => { },
    });
  }
}
