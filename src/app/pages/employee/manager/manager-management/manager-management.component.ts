import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ManagerEmployeesAddComponent } from '../../../../dialog/manager-employees-add/manager-employees-add.component';
import { ManagerService } from 'src/app/services/manager.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { DialogService } from 'src/app/services/dialog.service';

import { Employee } from 'src/app/interfaces/employee.interface';
import { lastValueFrom } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-manager-management',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './manager-management.component.html',
  styleUrls: ['./manager-management.component.scss'],
})
export class ManagerManagementComponent {
  managerId!: string; //params id
  companyId!: string; //params id

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
    'cancel',
  ];

  constructor(
    private dialogService: DialogService,
    private managerService: ManagerService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.managerId = this.route.snapshot.params['managerId'];
  }

  ngOnInit(): void {
    this.getManagerEmployees();
  }

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>(
    []
  );
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addManagerEmployees() {
    const dialogRef = this.dialog.open(ManagerEmployeesAddComponent, {
      data: {
        companyId: this.companyId,
        managerId: this.managerId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getManagerEmployees();
    });
  }

  async getManagerEmployees() {
    // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // 서버에 값을 받아올때까지 멈춘다.
    const managerEmployees = await lastValueFrom(
      this.managerService.getManagerEmployees(this.managerId)
    );
    // signal을 통한 상태관리
    await this.employeeService.setEmployees(managerEmployees.data);
    console.log(this.employeeService.employees());
    this.dataSource.data = this.employeeService.employees();
    this.dataSource.paginator = this.paginator;
  }

  cancelEmployees(employeeId: string) {
    this.dialogService
      .openDialogConfirm('Do you cancel this employee?')
      .subscribe((result: any) => {
        if (result) {
          this.managerService.deleteManagerEmployees(employeeId).subscribe({
            next: () => {
              this.dialogService.openDialogPositive(
                'Successfully, the employee has been cancel.'
              );
              this.getManagerEmployees();
            },
            error: (err: any) => {
              console.error(err);
              this.dialogService.openDialogNegative('Loadings Docs Error');
            },
          });
        }
      });
  }

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
