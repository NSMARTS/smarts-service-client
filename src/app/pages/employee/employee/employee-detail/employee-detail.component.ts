import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { AuthService } from 'src/app/services/auth.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { ManagerService } from 'src/app/services/manager.service';

interface EmployeeData {
  username: string;
  email: string;
  phoneNumber?: string;
  profileImgPath: string;
  managers: any;
  empStartDate: any;
  personalLeave: any;
}

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialsModule],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
})
export class EmployeeDetailComponent {
  companyId!: string; //params id
  employeeId: string = ''; // url 파라미터

  employeeUsername: any;
  employeeYear: any;
  employeeEmail: any;
  employeePhoneNumber: any;
  employeeProfileImgPath: any;

  numberOfManagers: number | undefined;
  employees = this.employeeService.employees; // 상태관리 중인 직원리스트
  allManager: any;
  matchingData: any[] = [];
  employeeData: any[] = [];
  displayedColumns2: string[] = ['managerImg', 'managerName', 'managerEmail'];
  displayedColumns: string[] = [
    'year',
    'annualLeave',
    'sickLeave',
    'rollover',
    'replacementDay',
  ];

  annualPolicy: string | undefined;
  usedAdvanceLeave: any | undefined;
  isRadioGroupDisabled: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private managerService: ManagerService
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.employeeId = this.route.snapshot.params['employeeId'];
  }

  ngOnInit(): void {
    this.getEmployee();
  }

  getEmployee() {
    this.employeeService.getEmployee(this.employeeId).subscribe({
      next: (res: { data: EmployeeData }) => {
        console.log(res.data);
        this.employeeUsername = res.data.username;
        this.employeeEmail = res.data.email;
        this.employeePhoneNumber = res.data.phoneNumber;
        this.employeeProfileImgPath = res.data.profileImgPath;
        this.allManager = res.data.managers;
        this.annualPolicy = res.data.personalLeave.annualPolicy;
        this.usedAdvanceLeave =
          res.data.personalLeave.isAdvanceLeave.toString();
        console.log(this.annualPolicy, this.usedAdvanceLeave);

        const empStartDate = new Date(res.data.empStartDate); // 직원의 입사일
        const currentDate = new Date(); // 현재 날짜
        let yearsOfWork =
          currentDate.getFullYear() - empStartDate.getFullYear() + 1; // 입사일과 현재 날짜 사이의 년차 계산

        // 현재 날짜의 월과 입사일의 월 비교
        if (
          currentDate.getMonth() < empStartDate.getMonth() ||
          (currentDate.getMonth() === empStartDate.getMonth() &&
            currentDate.getDate() < empStartDate.getDate())
        ) {
          // 아직 이번 해의 입사일이 오지 않았으면 1년을 빼줍니다.
          yearsOfWork--;
        }
        this.employeeYear = yearsOfWork;
        this.numberOfManagers = this.allManager.length;

        console.log(this.allManager);
        this.getManagerList();
      },
      error: (err) => console.error(err),
    });
  }

  getManagerList() {
    this.managerService.getManagerList(this.companyId).subscribe({
      next: (res) => {
        console.log(res.data);
        let managerList = res.data;

        this.matchingData = this.allManager.map((manager: any) => {
          const matchingManager = managerList.find(
            (item: any) => item.email === manager.email
          ) as any;
          if (matchingManager) {
            return {
              ...manager,
              username: matchingManager.username,
              profileImgPath: matchingManager.profileImgPath,
            };
          } else {
            return manager;
          }
        });
        console.log(this.matchingData);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('No companies found');
        } else {
          console.error('An error occurred while fetching manager list');
        }
      },
    });
  }
}
