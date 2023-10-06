// https://www.angulararchitects.io/aktuelles/angular-signals/

import { Employee } from 'src/app/interfaces/employee.interface';
import { CommonService } from 'src/app/services/common.service';
import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';
import { HttpResMsg } from '../interfaces/http-response.interfac';
import * as moment from 'moment';
import { LeaveRequest } from '../interfaces/leave-request.interface';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private baseUrl = environment.apiUrl;
  destroyRef = inject(DestroyRef);
  employees = signal<Employee[]>([]);
  constructor(private http: HttpClient, private commonService: CommonService) {}

  //회사 등록
  addEmployee(companyData: any) {
    return this.http
      .post(this.baseUrl + '/employees', companyData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  /***
   * @param companyId
   * 회사아이디로 직원전체 조회
   */
  getEmployees(id: string): Observable<HttpResMsg<Employee[]>> {
    return this.http.get<HttpResMsg<Employee[]>>(
      this.baseUrl + '/employees/' + id
    );
  }

  getEmployeesWithQueryParameters(
    id: string,
    active: string,
    direction: string,
    pageIndex: number,
    pageSize: number
  ): Observable<HttpResMsg<Employee[]>> {
    const queryParams = {
      active: active,
      direction: direction,
      pageIndex: pageIndex,
      pageSize: pageSize,
    };
    return this.http.get<HttpResMsg<Employee[]>>(
      this.baseUrl + '/employees/' + id,
      {
        params: queryParams,
      }
    );
  }

  /**
   * signal 저장
   * @param employees
   */
  async setEmployees(employees: Employee[]) {
    // 회사 별 직원들 연차 계산
    // const calculatedEmployees = await this.calculateEmployeesYear(employees);
    return this.employees.set(employees);
  }

  /***
   * @param id
   * 직원아이디로 조회
   */
  getEmployee(id: string): Observable<HttpResMsg<Employee>> {
    return this.http.get<HttpResMsg<Employee>>(
      this.baseUrl + '/employees/view/' + id
    );
  }

  updateEmployeeProfile(
    id: string,
    updateData: any
  ): Observable<HttpResMsg<Employee[]>> {
    return this.http.patch<HttpResMsg<Employee[]>>(
      this.baseUrl + '/employees/' + id,
      updateData
    );
  }

  updateEmployeeLeaves(
    id: string,
    updateData: any
  ): Observable<HttpResMsg<Employee[]>> {
    return this.http.patch<HttpResMsg<Employee[]>>(
      this.baseUrl + '/employees/' + id + '/leaves',
      updateData
    );
  }

  resetPassword(id: string): Observable<HttpResMsg<Employee>> {
    return this.http.patch<HttpResMsg<Employee>>(
      this.baseUrl + '/employees/' + id + '/resetPassword',
      {}
    );
  }
  // /**
  //  * 직원들 근속년수 계산
  //  * @param employees
  //  */
  // async calculateEmployeesYear(employees: Employee[]) {
  //   const calculatedEmployees = await employees.map((employee) => {
  //     // 근속년수 계산
  //     return this.calculateEmployeeYear(employee);
  //   });
  //   return calculatedEmployees;
  // }

  // /**
  //  * 직원 근속년수 계산
  //  * @param employee 직원
  //  * @return employee
  //  * {...employee, year:0, month:0(계약서 기준, 근속년수가 1년이 안될 경우 사용)}
  //  */
  // calculateEmployeeYear(employee: Employee) {
  //   const commonServiceDateFormatting = this.commonService.dateFormatting(
  //     employee.empStartDate
  //   );
  //   // 1월 1일을 기준으로
  //   if (employee.company?.annualPolicy === 'byYear') {
  //     // 올해가 계약한 해 보다 클 경우, 해가 넘어갔을 경우 1년차
  //     if (moment().year() > moment(employee?.empStartDate).year()) {
  //       return {
  //         ...employee,
  //         year: moment().year() - moment(employee?.empStartDate).year(),
  //         empStartDate: commonServiceDateFormatting,
  //       };
  //     }
  //     //  이번 해가 계약한 해 보다 작은 경우, 해가 넘어가지 않았을 경우, 0년차
  //     return {
  //       ...employee,
  //       year: 0,
  //       empStartDate: commonServiceDateFormatting,
  //     };
  //     // 계약일 기준으로
  //   } else if (employee.company?.annualPolicy === 'byContract') {
  //     // test 용
  //     // const today = moment(new Date('2023-08-30T00:00:00.000+00:00'));
  //     const today = moment(new Date());
  //     const empStartDate = moment(employee?.empStartDate);
  //     // diff years 계약일이 만 1년차가 안되면 0, n년
  //     const careerYear = today.diff(empStartDate, 'years');
  //     // 만 1년차가 아니면 12 month 로 표현
  //     if (careerYear === 0) {
  //       // 만 1년차가 아니면 12 month 로 표현
  //       const careerMonth = today.diff(empStartDate, 'months');
  //       // 0년차면 year는 0, month는 n
  //       return {
  //         ...employee,
  //         year: careerYear,
  //         month: careerMonth,
  //         empStartDate: commonServiceDateFormatting,
  //       };
  //     }
  //     // 계약서 기준 n년 차. month는 없다.
  //     return {
  //       ...employee,
  //       year: careerYear,
  //       empStartDate: commonServiceDateFormatting,
  //     };
  //   }
  //   return employee;
  // }

  retireEmployee(id: string): Observable<HttpResMsg<Employee[]>> {
    console.log(id);
    return this.http.delete<HttpResMsg<Employee[]>>(
      this.baseUrl + '/employees/' + id
    );
  }

  // 퇴사 직원 목록
  getRetireEmployees(companyId: string) {
    return this.http.get<HttpResMsg<Employee[]>>(
      this.baseUrl + '/employees/' + companyId + '/retire'
    );
  }

  // 퇴사 직원 취소
  cancelRetireEmployee(employeeId: string): Observable<HttpResMsg<Employee[]>> {
    return this.http.delete<HttpResMsg<Employee[]>>(
      this.baseUrl + '/employees/' + employeeId + '/retire'
    );
  }

  /**
   *
   * @param id companyId
   * @param data {emailFormControl: 'string', leaveStartDate: '2023-09-01', leaveEndDate: '2023-09-30', leaveType: 'all'}
   * @returns LeaveRequest[]
   */
  getEmployeeLeaveListSearch(
    id: string,
    data: any
  ): Observable<HttpResMsg<LeaveRequest[]>> {
    return this.http.get<HttpResMsg<LeaveRequest[]>>(
      this.baseUrl + '/employees/' + id + '/leaves/',
      { params: data }
    );
  }
}
