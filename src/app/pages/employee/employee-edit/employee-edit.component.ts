import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { EmployeeService } from 'src/app/services/employee.service';
import { CommonService } from 'src/app/services/common.service';
import { CountryService } from 'src/app/services/leave/country/country.service';
import { Country, Employee } from 'src/app/interfaces/employee.interface';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialsModule],
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss']
})
export class EmployeeEditComponent {
  employeeId: string = '';
  getEmployeeInfo: any;
  countryList: Country[] = [];
  companyName: string = '';
  // FormGroup
  editEmployeeForm: FormGroup;
  leaveStandards!: FormArray;


  employees = this.employeeService.employees

  employee!: Employee;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private countryService: CountryService,

    private commonService: CommonService,


  ) {
    this.employeeId = this.route.snapshot.params['id'];
    this.companyName = this.route.snapshot.params['companyName'];
    this.editEmployeeForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]), // 직원에게 적용할 나라 공휴일. Default Korea 
      isManager: new FormControl(false, [Validators.required]),
      empStartDate: new FormControl('', [Validators.required]),
      empEndDate: new FormControl(''),
      department: new FormControl(''),
      position: new FormControl(''),
      leaveStandards: this.fb.array([]),
      isRollover: [false],
      rolloverMaxMonth: [0, [Validators.min(0)]],
      rolloverMaxDay: [0, [Validators.min(0)]],
      countryCode: [''],
      isReplacementDay: [false],
      rdValidityTerm: [0, [Validators.min(0)]],
      isAdvanceLeave: [false],
      annualPolicy: ['byContract'],
    });
    this.leaveStandards = this.editEmployeeForm.get(
      'leaveStandards'
    ) as FormArray;
    this.addItem();


  }

  ngOnInit(): void {
    // 상태저장 중인 employees 호출
    if (this.employees().length > 0) {
      const employee = this.employees()?.filter((employee) => employee._id === this.employeeId)
      if (!employee) return
      this.editEmployeeForm.patchValue(this.employee);
      this.editEmployeeForm.patchValue(this.employee?.personalLeave);
      this.getCountryList()
    }
    // 상태저장 중인 employees가 없다면 http 호출
    // getCountryList 안에 getEmployee()가 있다.
    this.getCountryList()
  }


  /**
  * + 버튼 누를 시 item을 추가
  * @returns
  */
  createLeaveStandard(i: number): FormGroup {
    return this.fb.group({
      year: i + 1,
      annualLeave: [0, [Validators.min(0)]],
      sickLeave: [0, [Validators.min(0)]],
    });
  }

  /**
   * + 버튼 클릭 시
   * 기존에 가져온 연차정책에
   * {year:leaveStandards.lenhth, annualLeave: 0 , sickLeave: 0}
   * leaveStandards : FormArray에 담는다.
   */
  addItem() {
    const newYear = this.leaveStandards.length + 1;
    const newLeaveStandard = this.createLeaveStandard(newYear);
    this.leaveStandards.push(newLeaveStandard);
    this.updateYears();
  }

  cancelItem(i: any) {
    if (this.leaveStandards) {
      this.leaveStandards.removeAt(i);
      this.updateYears();
    }
  }
  /**
   * item에 year를 추가하거나 제거하면
   * leaveStandards에 기존 배열의 year들도 수정
   */
  updateYears() {
    this.leaveStandards.controls.forEach((group, index) => {
      group.get('year')?.setValue(index + 1);
    });
  }


  getLeaveStandardsControls() {
    return (this.editEmployeeForm.get('leaveStandards') as FormArray).controls;
  }

  /**
  * 기존 연차정책을 가져와, formgroup객체 형식으로 만든 후 FormArray에 담는다.
  * @returns
  */
  getLeaveStandard(data: any): FormGroup {
    return this.fb.group({
      year: data.year,
      annualLeave: [data.annualLeave, [Validators.min(0)]],
      sickLeave: [data.sickLeave, [Validators.min(0)]],
    });
  }

  patchLeaveStadard() {
    this.leaveStandards.clear();
    this.leaveStandards = this.editEmployeeForm.get(
      'leaveStandards'
    ) as FormArray;
    // 기존 컨트롤 제거
    this.leaveStandards.clear();
    // 새로운 컨트롤 추가
    for (let i = 0; i < this.employee.personalLeave.leaveStandards.length; i++) {
      this.leaveStandards.push(
        this.getLeaveStandard(this.employee.personalLeave.leaveStandards[i])
      );
    }
  }

  getCountryList() {
    this.countryService.getCountryList().subscribe({
      next: (res) => {
        this.countryList = res.data
        this.getEmployee()
      },
      error: (err) => console.error(err)
    })
  }

  getEmployee() {
    this.employeeService.getEmployee(this.employeeId).subscribe({
      next: (res) => {
        console.log(res.data)

        this.employee = res.data
        this.editEmployeeForm.patchValue(this.employee);
        this.editEmployeeForm.patchValue(this.employee?.personalLeave);

        this.patchLeaveStadard();
      },
      error: (err) => console.error(err)
    })
  }

  backManagerList() {
    this.router.navigate(['leave/employee-mngmt/manager-list']);
  }

  updateProfileInfo() {

  }

  updateLeaveInfo() {

  }
}
