import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Employee } from 'src/app/interfaces/employee.interface';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { DialogService } from 'src/app/services/dialog.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { ManagerService } from 'src/app/services/manager.service';

@Component({
  selector: 'app-manager-employees-add',
  templateUrl: './manager-employees-add.component.html',
  styleUrls: ['./manager-employees-add.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
})
export class ManagerEmployeesAddComponent implements OnInit {
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
    // 'menu',
    // 'edit',
    // 'retire',
  ];

  companyId: string; // 회사아이디 params
  managerId: string; // 회사아이디 params
  clickRowIds: any[] = [];

  filterValues: any = {};
  filterSelectObj: any = [];
  company_max_day: any;
  isRollover = false;
  employees: WritableSignal<Employee[]>;

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>(
    []
  );
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  resultsLength = 0;

  constructor(
    private employeeService: EmployeeService,
    private managerService: ManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ManagerEmployeesAddComponent>,
    private dialogService: DialogService,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    this.companyId = data.companyId;
    this.managerId = data.managerId;
    this.employees = this.employeeService.employees;
  }
  ngOnInit(): void {
    this.getManagerEmployeesWithout();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addmanagerEmployees() {
    const addManagerEmployees = {
      managerId: this.managerId,
      employeesId: this.clickRowIds,
    };

    this.managerService.addManagerEmployees(addManagerEmployees).subscribe({
      next: () => {
        this.dialogRef.close();
        this.dialogService.openDialogPositive(
          'Successfully, a manager employee has been added.'
        );
      },
      error: (err) => {
        console.error(err);
        if (err.status === 409) {
          this.dialogService.openDialogNegative(
            'Manager employee date is duplicated.'
          );
        } else {
          this.dialogService.openDialogNegative(
            'Adding manager employee Error'
          );
        }
      },
    });
  }

  async getManagerEmployeesWithout() {
    // // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // // 서버에 값을 받아올때까지 멈춘다.
    // const employees = await lastValueFrom(
    //   this.managerService.getManagerEmployeesWithout(
    //     this.companyId,
    //     this.managerId
    //   )
    // );
    // // signal을 통한 상태관리
    // await this.employeeService.setEmployees(employees.data);
    // console.log(employees.data);
    // this.dataSource.data = this.employeeService.employees();
    // this.dataSource.paginator = this.paginator;

    this.managerService
      .getManagerEmployeesWithout(this.companyId, this.managerId)
      .subscribe({
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

  clickManagerEmployees(row: any) {
    row.isClick = !row.isClick;

    // 만약 .bold-row 클래스가 적용된 행이 bold 상태로 변경되었다면, ID를 배열에 추가합니다.
    if (row.isClick) {
      this.clickRowIds.push(row._id);
    } else {
      // .bold-row 클래스가 제거된 행이 bold 상태에서 굵지 않게 변경되었다면, ID를 배열에서 제거합니다.
      const index = this.clickRowIds.indexOf(row._id);
      if (index !== -1) {
        this.clickRowIds.splice(index, 1);
      }
    }
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
