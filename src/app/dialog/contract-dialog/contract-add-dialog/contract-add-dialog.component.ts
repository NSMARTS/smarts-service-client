import { PdfInfo, PdfService } from '../../../services/pdf/pdf.service';
import { AuthService } from '../../../services/auth/auth.service';
import { AfterViewInit, Component, DestroyRef, Inject, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { UserInfo } from 'src/app/services/auth/auth.service';
import { Employee } from 'src/app/interfaces/employee.interface';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { lastValueFrom, map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContractService } from 'src/app/services/contract/contract.service';

@Component({
  selector: 'app-contract-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './contract-add-dialog.component.html',
  styleUrls: ['./contract-add-dialog.component.scss']
})
export class ContractAddDialogComponent implements OnInit, AfterViewInit {
  // 상위 컴포넌트에서 받아온 값
  public dialogRef = inject(MatDialogRef<ContractAddDialogComponent>)

  // 서비스 의존성 주입
  snackbar = inject(MatSnackBar);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  destroyRef = inject(DestroyRef);

  dialogService = inject(DialogService);
  authService = inject(AuthService);
  employeeService = inject(EmployeeService);
  contractService = inject(ContractService);
  pdfService = inject(PdfService);

  // 시그널 코드 (상태관리)
  userInfoStore: WritableSignal<UserInfo>;
  filteredEmployee = signal<Employee[]>([]);
  employees: WritableSignal<Employee[]>;
  pdfFile: WritableSignal<File | null>;
  contractMod: WritableSignal<string>;
  // 변수
  addContractForm: FormGroup;
  contractData;
  receiverSearchChecked: boolean = false;
  isSubmitting: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.addContractForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: [''],
      employee: new FormControl<string>('', [
        Validators.required,
        Validators.email,
      ]),
    });
    this.contractData = this.data
    this.contractMod = this.contractService.contractMod
    // 상태저장된 로그인 정보 불러오기
    this.userInfoStore = this.authService.userInfoStore;
    // 상태저장된 employee 리스트 불러오기
    this.employees = this.employeeService.employees;
    // 업로드한 파일 가져오기
    this.pdfFile = this.pdfService.pdfFile;


  }

  ngOnInit(): void {
    if (this.contractMod() === 'edit') {
      this.addContractForm.patchValue({
        ...this.data
      });
    }
  }

  ngAfterViewInit(): void {
    this.getEmployees(this.contractData.companyId);
    // this.getPayStubs(this.companyId);
    // 계약서가 edit 모드이면
  }

  async getEmployees(companyId: string) {
    // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // 서버에 값을 받아올때까지 멈춘다.
    const employees = await lastValueFrom(
      this.employeeService.getEmployees(companyId)
    );
    // signal을 통한 상태관리
    await this.employeeService.setEmployees(employees.data);
    this.setAutoComplete();
  }

  /**
   * email 폼 자동완성 코드 ---------------------------------
   */
  setAutoComplete() {
    // auto complete
    this.addContractForm.controls['employee'].valueChanges
      .pipe(
        startWith(''),
        map((employee) =>
          employee ? this._filterStates(employee) : this.employees().slice()
        ),
        // 배열로 가져온거 시그널에 등록
        map((employees) => this.filteredEmployee.set(employees)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

  }

  private _filterStates(email: string): Employee[] {
    const filterValue = email.toLowerCase();
    return this.employees().filter(
      (state) =>
        state.email.toLowerCase().includes(filterValue) ||
        state.username.toLowerCase().includes(filterValue)
    );
  }


  addContract() {
    if (this.addContractForm.valid) {
      this.isSubmitting = true
      const body = {
        ...this.addContractForm.value,
        company: this.contractData.companyId,
        writer: this.userInfoStore()._id,
        pdf: this.pdfFile(),
      };

      this.contractService.createContract(body).subscribe({
        next: (res) => {
          this.dialogService.openDialogPositive('Contract created successfully.');
          this.dialogRef.close(true);
          this.router.navigate([
            `/company/${this.contractData.companyId}/contract`,
          ]);
        },
        error: (error) => {
          this.isSubmitting = false
          this.dialogService.openDialogNegative(error.error.message);
        },
        complete: () => {
          this.isSubmitting = false
        }
      });
    }
  }

  editContract() {
    if (this.addContractForm.valid) {
      this.isSubmitting = true

      const body = {
        ...this.addContractForm.value,
        company: this.contractData.companyId,
        writer: this.userInfoStore()._id,
        pdf: this.pdfFile()
      }
      this.contractService.updateContract(this.data.contractId, body).subscribe({
        next: (res) => {
          this.dialogService.openDialogPositive('Contract created successfully.');
          this.dialogRef.close(true);
          this.router.navigate([`/company/${this.contractData.companyId}/contract`]);
        },
        error: (error) => {
          this.isSubmitting = false
          this.dialogService.openDialogNegative(error.error.message);
        },
        complete: () => {
          this.isSubmitting = false
        }
      })
    }
  }
}
