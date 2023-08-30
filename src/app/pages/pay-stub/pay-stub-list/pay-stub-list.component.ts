import { Component, ViewChild, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Employee } from 'src/app/interfaces/employee.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MatDialog } from '@angular/material/dialog';
import { PayStubDialogComponent } from 'src/app/dialog/pay-stub-dialog/pay-stub-dialog.component';

@Component({
  selector: 'app-pay-stub-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './pay-stub-list.component.html',
  styleUrls: ['./pay-stub-list.component.scss']
})
export class PayStubListComponent {

  displayedColumns: string[] = [
    'title',
    'name',
    'date',
  ];

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  companyName: string; // 회사아이디 params 

  filterValues: any = {};
  filterSelectObj: any = [];
  company_max_day: any;
  isRollover = false;
  employees: WritableSignal<Employee[]>

  constructor(
    private employeeService: EmployeeService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
  ) {
    this.companyName = this.route.snapshot.params['companyName'];
    this.employees = this.employeeService.employees
  }
  ngOnInit(): void {
    this.getEmployees(this.companyName);
  }


  async getEmployees(companyName: string) {
    // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // 서버에 값을 받아올때까지 멈춘다.
    const employees = await lastValueFrom(this.employeeService.getEmployees(companyName))
    console.log('employees : ', employees)
    // signal을 통한 상태관리
    await this.employeeService.setEmployees(employees.data)

    this.dataSource = new MatTableDataSource(this.employeeService.employees());
    this.dataSource.paginator = this.paginator;
  }


  openDialog() {
    this.dialog.open(PayStubDialogComponent, {
      width: '1200px',
      data: {
        companyName: this.companyName
      },
    });
  }
}
