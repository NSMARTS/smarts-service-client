import { Component, DestroyRef, Inject, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from 'src/app/services/employee.service';
import { Observable, map, startWith, tap, filter, lastValueFrom } from 'rxjs';
import { Employee } from 'src/app/interfaces/employee.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PayStubService } from 'src/app/services/pay-stub.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-pay-stub-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, ReactiveFormsModule],
  templateUrl: './pay-stub-dialog.component.html',
  styleUrls: ['./pay-stub-dialog.component.scss']
})
export class PayStubDialogComponent implements OnInit {

  currentFile?: File;// 파일 업로드 시 여기에 관리
  progress = 0;
  message = '';
  fileName = 'Select File';
  fileInfos?: Observable<any>;

  email = new FormControl<string>('')
  filteredEmployee = signal<Employee[]>([])
  employees: WritableSignal<Employee[]>
  destroyRef = inject(DestroyRef);
  filterString = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private employeeService: EmployeeService,
    private payStubService: PayStubService
  ) {
    // 상태저장된 employee 리스트 불러오기
    this.employees = this.employeeService.employees
    // input controller 값 받아오기
    this.email.valueChanges
      .pipe(
        startWith(''),
        // 받아온 값 employee.name과 일치하는것 끼리 배열로 가져오기
        map(email => (email ? this._filterStates(email) : this.employees().slice())),
        // 배열로 가져온거 시그널에 등록
        map(employees => this.filteredEmployee.set(employees)),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe()
  }

  ngOnInit(): void {
    this.getEmployees()

  }

  async getEmployees() {
    const employees = await lastValueFrom(this.employeeService.getEmployees(this.data.companyName))
    await this.employeeService.setEmployees(employees.data)
    console.log(this.employees())
  }

  /**
   * 이름으로 검색하거나 email로 검색하쇼
   * @param value 
   * @returns 
   */
  private _filterStates(value: string): Employee[] {
    const filterValue = value?.toLowerCase();
    return this.employees().filter(
      state =>
        state.email.toLowerCase().includes(filterValue) ||
        state.username.toLowerCase().includes(filterValue)
    );
  }

  selectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      this.currentFile = file;
      this.fileName = this.currentFile.name;
    } else {
      this.fileName = 'Select File';
    }
  }

  upload(): void {
    this.progress = 0;
    this.message = "";

    if (this.currentFile) {
      this.payStubService.upload(this.data.companyName, this.email.value, this.currentFile).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.message = event.body.message;
            this.fileInfos = this.payStubService.getFiles();
          }
        },
        error: (err: any) => {
          console.log(err);
          this.progress = 0;
          if (err.error && err.error.message) {
            this.message = err.error.message;
          } else {
            this.message = 'Could not upload the file!';
          }
          this.currentFile = undefined;
        }
      });
    }

  }
}
