import { CommonService } from 'src/app/services/common.service';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  Component,
  OnInit,
  ViewChild,
  WritableSignal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { Employee } from 'src/app/interfaces/employee.interface';
import * as moment from 'moment';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  displayedColumns: string[] = [
    'profile',
    'name',
    'email',
    'year',
    'entitlement',
    'rollover',
    'sickLeave',
    'replacementDay',
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

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>(
    []
  );
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private employeeService: EmployeeService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.employees = this.employeeService.employees;
  }
  ngOnInit(): void {
    this.getEmployees(this.companyId);
  }

  async getEmployees(companyId: string) {
    // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // 서버에 값을 받아올때까지 멈춘다.
    const employees = await lastValueFrom(this.employeeService.getEmployees(companyId));
    await this.employeeService.setEmployees(employees.data);
    this.dataSource = new MatTableDataSource(this.employeeService.employees());
    this.dataSource.paginator = this.paginator;
    console.log(this.dataSource)
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
        this.getEmployees(this.companyId);
        console.log(data);
      },
      error: (err: any) => { },
    });
  }
}
