import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/services/employee.service';
import { CommonService } from 'src/app/services/common.service';
import { DialogService } from 'src/app/dialog/dialog.service';
import { DataService } from 'src/app/stores/data/data.service';
import { Employee } from 'src/app/interfaces/employee.interface';

@Component({
  selector: 'app-retired-employee-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './retired-employee-list.component.html',
  styleUrls: ['./retired-employee-list.component.scss'],
})
export class RetiredEmployeeListComponent {
  displayedColumns: string[] = [
    'name',
    'email',
    'emp_start_date',
    'resignation_date',
    'myEmployeeButton',
  ];
  // filterValues = {};
  // filterSelectObj = [];

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>(
    []
  );

  myRank;
  managerName = '';
  company_max_day: any;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  private unsubscribe$ = new Subject<void>();
  isRollover = false;
  public spaceTime: string | undefined;
  companyName: string; // 회사아이디 params

  constructor(
    public dialog: MatDialog,
    private employeeMngmtService: EmployeeService,
    // private retiredEmployeeMngmtService: RetiredEmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private dialogService: DialogService,
    private dataService: DataService
  ) {
    this.myRank = this.route.snapshot.routeConfig?.path;
    this.companyName = this.route.snapshot.params['companyName'];
    console.log('ddddddddddd');
  }

  ngOnInit(): void {
    // this.dataService.userProfile
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(async (data: any) => {
    //     console.log(data);
    //     console.log(data.company_id);
    //     if (!data.companyId) return;

    //     this.company_max_day = data.companyId.rolloverMaxDay;
    //     console.log(this.company_max_day);
    //     if (this.company_max_day != undefined) {
    //       this.isRollover = true;
    //       this.displayedColumns = [
    //         'name',
    //         'email',
    //         'emp_start_date',
    //         'resignation_date',
    //         'myEmployeeButton',
    //       ];
    //     }
    //     console.log('zzzzzzzzzz');
    //     await this.getMyRetiredEmployeeLists();
    //   });
    this.getMyRetiredEmployeeLists();
  }
  // 퇴사자 목록 출력
  getMyRetiredEmployeeLists() {
    this.managerName = '';
    console.log('ssssssssss');
    this.employeeMngmtService.getRetiredEmployee(this.companyName).subscribe({
      next: (data: any) => {
        console.log(data.data);

        //   this.getMyEmployeeList.data = data.data;
        //   this.getMyEmployeeList.paginator = this.paginator;
        this.dataSource = new MatTableDataSource(data.data);
        console.log(this.dataSource);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  cancelRetireEmployee(id: string) {
    this.employeeMngmtService.cancelRetireEmployee(id).subscribe(() => {
      this.getMyRetiredEmployeeLists();
    });
  }
}
