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
import { DialogService } from 'src/app/services/dialog.service';
import { lastValueFrom, map, merge, startWith, switchMap } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements AfterViewInit {
  displayedColumns: string[] = [
    // 'profile',
    'name',
    'email',
    'phoneNumber',
    'year',
    // 'entitlement',
    // 'sickLeave',
    // 'replacementDay',
    // 'rollover',
    // 'advanceLeave',
    // 'annualPolicy',
    'empStartDate',
    'detail',
    'menu',
    // 'edit',
    // 'retire',
  ];

  companyId: string; // 회사아이디 params

  filterValues: any = {};
  filterSelectObj: any = [];
  company_max_day: any;
  isRollover = false;
  employees: WritableSignal<Employee[]>;

  dataSource = new MatTableDataSource<Employee>([]);

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  resultsLength = 0;

  constructor(
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.employees = this.employeeService.employees;
  }

  ngAfterViewInit() {
    this.getEmployees();
  }

  async getEmployees() {
    // 페이지 네이션 sorting 예제
    // this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    // merge(this.sort.sortChange, this.paginator.page)
    //   .pipe(
    //     startWith({}),
    //     switchMap(() => {
    //       this.isLoadingResults = true;
    //       return this.employeeService
    //         .getEmployeesWithQueryParameters(
    //           this.companyId,
    //           this.sort.active,
    //           this.sort.direction,
    //           this.paginator.pageIndex,
    //           this.paginator.pageSize
    //         )
    //         .pipe();
    //     }),
    //     map(async (res: any) => {
    //       // https://material.angular.io/components/table/examples
    //       console.log(res);
    //       this.isLoadingResults = false;
    //       this.isRateLimitReached = res.data === null;
    //       this.resultsLength = res.total_count;
    //       await this.employeeService.setEmployees(res.data);
    //       this.dataSource = new MatTableDataSource<Employee>(this.employees());

    //       return this.employees();
    //     })
    //   )
    //   .subscribe();

    this.employeeService.getEmployees(this.companyId).subscribe({
      next: async (res: HttpResMsg<Employee[]>) => {
        await this.employeeService.setEmployees(res.data);
        this.dataSource = new MatTableDataSource<Employee>(this.employees());
        this.isLoadingResults = false;
        this.isRateLimitReached = res.data === null;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('No companies found');
        } else {
          console.error('An error occurred while fetching company list');
        }
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onClick(id: string) {
    this.router.navigate([`/company/${this.companyId}/employee/detail/${id}`]);
  }

  detailPage(id: string) {
    this.router.navigate([`/company/${this.companyId}/employee/detail/${id}`]);
  }

  editEmployeeProfile(id: string) {
    this.router.navigate([
      `/company/${this.companyId}/employee/editEmployeeProfile/${id}`,
    ]);
  }

  editEmployee(id: string) {
    this.router.navigate([
      `/company/${this.companyId}/employee/editEmployeeLeave/${id}`,
    ]);
  }

  addEmployee() {
    this.router.navigate([`/company/${this.companyId}/employee/add`]);
  }

  // 퇴사자 추가
  retireEmployee(id: string) {
    console.log(id);
    this.dialogService
      .openDialogConfirm('Do you retire this employee?')
      .subscribe((result: any) => {
        if (result) {
          this.employeeService.retireEmployee(id).subscribe({
            next: (data: any) => {
              this.getEmployees();
              this.dialogService.openDialogPositive(
                'Successfully, the employee has been retire.'
              );
              console.log(data);
            },
            error: (err: any) => {},
          });
        }
      });
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
