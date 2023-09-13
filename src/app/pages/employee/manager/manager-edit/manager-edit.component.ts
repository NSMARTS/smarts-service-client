import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-manager-edit',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './manager-edit.component.html',
  styleUrls: ['./manager-edit.component.scss'],
})
export class ManagerEditComponent {
  managerId!: string; //params id
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
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]*$/)]],
      address: [''],
      isSuperManager: [''],
    });

    this.companyId = this.route.snapshot.params['id'];
    this.managerId = this.route.snapshot.params['managerId'];
  }

  ngOnInit(): void {
    this.managerService.getManagerInfo(this.managerId).subscribe({
      next: (res) => {
        const managerData = res.data;
        console.log(managerData);
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

  //Back 버튼 클릭
  onBack() {
    this.router.navigate(['company/' + this.companyId + '/manager']);
  }

  ////////////////////*Left mat-card*////////////////////

  onSubmit() {
    if (this.hasErrors()) {
      //유효성 검사 실패 시 빨갛게 나옴
    } else {
      // 유효성 검사 통과 시
      this.editManager();
    }
  }

  //Edit Manager 버튼 클릭
  editManager() {
    const managerData = {
      ...this.editManagerForm.value,
    };
    this.managerService.editManager(this.managerId, managerData).subscribe({
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

  //Cancel 버튼 클릭
  onCancel(): void {
    this.router.navigate(['company/' + this.companyId + '/manager']);
  }

  resetManagerPassword() {
    this.dialogService
      .openDialogConfirm('Do you reset this manager password?')
      .subscribe((result: any) => {
        if (result) {
          this.managerService.resetManagerPassword(this.managerId).subscribe({
            next: () => {
              this.dialogService.openDialogPositive(
                'Successfully, the manager password has been reset.'
              );
              this.router.navigate(['company/' + this.companyId + '/manager']);
            },
            error: (err: any) => {
              console.error(err);
              this.dialogService.openDialogNegative('Loadings Docs Error');
              alert(err.error.message);
            },
          });
        }
      });
  }

  //유효성 검사
  private hasErrors() {
    const emailRequiredError = this.editManagerForm
      .get('email')
      ?.hasError('required');
    const emailEmailError = this.editManagerForm
      .get('email')
      ?.hasError('email');
    const usernameError = this.editManagerForm
      .get('username')
      ?.hasError('required');
    const phoneNumberError = this.editManagerForm
      .get('phoneNumber')
      ?.hasError('pattern');

    return (
      emailRequiredError || emailEmailError || usernameError || phoneNumberError
    );
  }

  ////////////////////*Right mat-card*////////////////////

  displayedColumns: string[] = [
    'name',
    'email',
    'year',
    'entitlement',
    'sickLeave',
    'replacementDay',
    'rollover',
    'advanceLeave',
    'annualPolicy',
    'empStartDate',
    'delete',
  ];

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

  deleteManagerEmployees(employeeId: string) {
    this.dialogService
      .openDialogConfirm('Do you delete this manager employee?')
      .subscribe((result: any) => {
        if (result) {
          this.managerService.deleteManagerEmployees(employeeId).subscribe({
            next: () => {
              this.dialogService.openDialogPositive(
                'Successfully, the manager employee has been delete.'
              );
              this.getManagerEmployees();
            },
            error: (err: any) => {
              console.error(err);
              this.dialogService.openDialogNegative('Loadings Docs Error');
              alert(err.error.message);
            },
          });
        }
      });
  }
}
