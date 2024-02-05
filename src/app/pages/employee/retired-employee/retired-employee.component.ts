import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { Employee } from 'src/app/interfaces/employee.interface';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-retired-employee',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './retired-employee.component.html',
  styleUrls: ['./retired-employee.component.scss'],
})
export class RetiredEmployeeListComponent {
  displayedColumns: string[] = [
    'name',
    'email',
    'phone',
    'dateOfEnter',
    'resignationDate',
    'cancel',
  ];

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>(
    []
  );

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  companyId: string; // 회사아이디 params

  constructor(
    public dialog: MatDialog,
    private employeeMngmtService: EmployeeService,
    private route: ActivatedRoute,
    private dialogService: DialogService
  ) {
    this.companyId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getMyRetireEmployees();
  }

  // 퇴사자 목록 출력
  getMyRetireEmployees() {
    this.employeeMngmtService.getRetireEmployees(this.companyId).subscribe({
      next: (data: any) => {
        this.dataSource = new MatTableDataSource(data.data);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // 퇴사자 퇴사 취소
  cancelRetireEmployee(employeeId: string) {
    this.dialogService
      .openDialogConfirm('Do you want cancel this request?')
      .subscribe((result: any) => {
        if (result) {
          this.employeeMngmtService.cancelRetireEmployee(employeeId).subscribe({
            next: () => {
              this.getMyRetireEmployees();
              this.dialogService.openDialogPositive(
                'Successfully, the employee has been retire cancel.'
              );
            },
            error: (err: any) => {
              console.error(err);
              this.dialogService.openDialogNegative('An error has occurred.');
            },
          });
        }
      });
  }

  // 퇴사자 필터
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
