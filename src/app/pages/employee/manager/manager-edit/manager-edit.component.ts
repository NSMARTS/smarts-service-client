import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/dialog/dialog.service';
import { ManagerService } from 'src/app/services/manager.service';
import { MatDialog } from '@angular/material/dialog';
import { ManagerEmployeesAddComponent } from '../../../../dialog/manager-employees-add/manager-employees-add.component';
import { lastValueFrom } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';
import { MatTableDataSource } from '@angular/material/table';
import { Employee } from 'src/app/interfaces/employee.interface';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-manager-edit',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './manager-edit.component.html',
  styleUrls: ['./manager-edit.component.scss'],
})
export class ManagerEditComponent {
  editManagerId!: string; //params id
  companyId!: string; //params id
  editManagerForm: FormGroup;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private managerService: ManagerService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    this.editManagerForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      phoneNumber: [''],
      address: [''],
    });

    this.companyId = this.route.snapshot.params['id'];
    this.editManagerId = this.route.snapshot.params['managerId'];
  }

  ngOnInit(): void {
    this.managerService.getManagerInfo(this.editManagerId).subscribe({
      next: (res) => {
        const managerData = res.data;
        console.log(res);
        this.editManagerForm.patchValue(managerData);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('Manager not found');
        } else {
          console.error('An error occurred while fetching manager info');
        }
      },
    });

    this.getManagerEmployees();
  }

  //Cancel 버튼 클릭
  toBack(): void {
    this.router.navigate(['company/' + this.companyId + '/manager']);
  }

  //Edit 버튼 클릭
  onSubmit() {
    const managerData = {
      ...this.editManagerForm.value,
    };

    this.managerService.editManager(this.editManagerId, managerData).subscribe({
      next: () => {
        this.router.navigate(['company/' + this.companyId + '/manager']);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          this.dialogService.openDialogNegative('Manager not found');
        } else {
          this.dialogService.openDialogNegative(
            'An error occurred while updating manager'
          );
        }
      },
    });
  }

  ////////////////////////////////////////////////////////////////////////
  addManagerEmployees() {
    const dialogRef = this.dialog.open(ManagerEmployeesAddComponent, {
      data: {
        //   companyHolidayList: this.companyHolidayList,
        companyId: this.companyId,
        managerId: this.editManagerId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // this.getManagerEmployeesList();
    });
  }

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

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>(
    []
  );
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  async getManagerEmployees() {
    // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // 서버에 값을 받아올때까지 멈춘다.
    const employees = await lastValueFrom(
      this.employeeService.getManagerEmployees(this.editManagerId)
    );
    console.log(employees);
    // signal을 통한 상태관리
    await this.employeeService.setEmployees(employees.data);

    this.dataSource.data = this.employeeService.employees();
    console.log(this.dataSource);
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
