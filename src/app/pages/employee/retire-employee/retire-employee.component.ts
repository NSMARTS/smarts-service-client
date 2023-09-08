import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/interfaces/employee.interface';

@Component({
  selector: 'app-retire-employee',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './retire-employee.component.html',
  styleUrls: ['./retire-employee.component.scss'],
})
export class RetiredEmployeeListComponent {
  displayedColumns: string[] = [
    'name',
    'email',
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
    private route: ActivatedRoute
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

  cancelRetireEmployee(employeeId: string) {
    this.employeeMngmtService.cancelRetireEmployee(employeeId).subscribe(() => {
      this.getMyRetireEmployees();
    });
  }

  // 회사 이름 필터
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
