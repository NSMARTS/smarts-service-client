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
import { MatTableDataSource } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { DialogService } from 'src/app/dialog/dialog.service';
import { Employee } from 'src/app/interfaces/employee.interface';
import { MaterialsModule } from 'src/app/materials/materials.module';
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
    'name',
    'year',
    'entitlement',
    'rollover',
    'sickLeave',
    'replacementDay',
    'advanceLeave',
    'annualPolicy',
    'empStartDate',
  ];

  companyId: string; // 회사아이디 params
  managerId: string; // 회사아이디 params
  boldRowIds: any[] = [];

  filterValues: any = {};
  filterSelectObj: any = [];
  company_max_day: any;
  isRollover = false;
  employees: WritableSignal<Employee[]>;

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>(
    []
  );
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private employeeService: EmployeeService,
    private managerService: ManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ManagerEmployeesAddComponent>,
    private dialogService: DialogService
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
      employeesId: this.boldRowIds,
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
    // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // 서버에 값을 받아올때까지 멈춘다.
    const employees = await lastValueFrom(
      this.managerService.getManagerEmployeesWithout(this.companyId)
    );
    // signal을 통한 상태관리
    await this.employeeService.setEmployees(employees.data);

    this.dataSource.data = this.employeeService.employees();
    this.dataSource.paginator = this.paginator;
  }

  clickManagerEmployees(row: any) {
    row.isBold = !row.isBold;

    // 만약 .bold-row 클래스가 적용된 행이 bold 상태로 변경되었다면, ID를 배열에 추가합니다.
    if (row.isBold) {
      this.boldRowIds.push(row._id);
    } else {
      // .bold-row 클래스가 제거된 행이 bold 상태에서 굵지 않게 변경되었다면, ID를 배열에서 제거합니다.
      const index = this.boldRowIds.indexOf(row._id);
      if (index !== -1) {
        this.boldRowIds.splice(index, 1);
      }
    }
  }
}
