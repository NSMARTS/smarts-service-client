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

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = environment.apiUrl;
  destroyRef = inject(DestroyRef);
  employees = signal<Employee[]>([])
  constructor(
    private http: HttpClient,
    private commonService: CommonService,
  ) { }

  //회사 등록
  addEmployee(companyData: any) {
    return this.http
      .post(this.baseUrl + '/employees', companyData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  /***
   * @param companyName
   * 회사이름으로 직원전체 조회
   */
  getEmployees(companyName: string): Observable<HttpResMsg<Employee[]>> {
    return this.http
      .get<HttpResMsg<Employee[]>>(this.baseUrl + '/employees/' + companyName)
  }

  /**
   * signal 저장
   * @param employees 
   */
  async setEmployees(employees: Employee[]) {
    // 회사 별 직원들 연차 계산
    const calculatedEmployees = await this.calculateEmployeesYear(employees)
    this.employees.set(calculatedEmployees)
  }

  /***
   * @param id
   * 직원아이디로 조회
   */
  getEmployee(id: string): Observable<HttpResMsg<Employee>> {
    return this.http
      .get<HttpResMsg<Employee>>(this.baseUrl + '/employees/view/' + id)
  }

  updateEmployee(id: string, updateData: any): Observable<HttpResMsg<Employee[]>> {
    return this.http
      .patch<HttpResMsg<Employee[]>>(this.baseUrl + '/employees/' + id, updateData)
  }


  /**
   * 직원들 근속년수 계산
   * @param employees 
   */
  async calculateEmployeesYear(employees: Employee[]) {
    const calculatedEmployees = await employees.map((employee) => {
      // 근속년수 계산
      return this.calculateEmployeeYear(employee)
    })
    return calculatedEmployees;
  }

  /**
   * 직원 근속년수 계산
   * @param employee 직원
   * @return employee 
   * {...employee, year:0, month:0(계약서 기준, 근속년수가 1년이 안될 경우 사용)}
   */
  calculateEmployeeYear(employee: Employee) {
    const commonServiceDateFormatting = this.commonService.dateFormatting(employee.empStartDate);
    // 1월 1일을 기준으로
    if (employee.company?.annualPolicy === 'byYear') {
      // 
      if (moment(employee?.empStartDate).year() < moment().year()) {
        return {
          ...employee,
          year: (moment().year() - moment(employee?.empStartDate).year()),
          empStartDate: commonServiceDateFormatting
        }
      }
      return {
        ...employee,
        year: 0,
        empStartDate: commonServiceDateFormatting
      }
      // 계약일 기준으로
    } else if (employee.company?.annualPolicy === 'byContract') {
      // test 용
      // const today = moment(new Date('2023-08-30T00:00:00.000+00:00'));
      const today = moment(new Date());
      const empStartDate = moment(employee?.empStartDate);
      const careerYear = (today.diff(empStartDate, 'years'));
      // 만 1년차가 아니면
      if (careerYear === 0) {
        // 12 month 로 표현
        const careerMonth = today.diff(empStartDate, 'months');
        return {
          ...employee,
          year: careerYear,
          month: careerMonth,
          empStartDate: commonServiceDateFormatting
        }
      }
      return {
        ...employee,
        year: careerYear,
        empStartDate: commonServiceDateFormatting
      }
    }
    return employee
  }
}
