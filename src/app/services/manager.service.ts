import { DestroyRef, Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpResMsg } from '../interfaces/http-response.interfac';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Manager } from '../interfaces/manager.interface';
import { Employee } from '../interfaces/employee.interface';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  private baseUrl = environment.apiUrl;
  destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient) { }

  //매니저 등록
  addManager(managerData: any) {
    return this.http
      .post(this.baseUrl + '/managers', managerData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  //매니저 목록 조회
  getManagerList(companyId: any): Observable<HttpResMsg<Manager[]>> {
    return this.http
      .get<HttpResMsg<Manager[]>>(this.baseUrl + '/managers/' + companyId)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 매니저 상세 조회 HttpParams 방법
  getManagerInfo(managerId: any): Observable<HttpResMsg<Manager>> {
    return this.http
      .get<HttpResMsg<Manager>>(this.baseUrl + '/managers/view/' + managerId)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 매니저 수정
  editManager(managerId: string, managerData: any) {
    return this.http
      .patch(this.baseUrl + '/managers/' + managerId, managerData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 매니저 비밀번호 리셋
  resetManagerPassword(managerId: string) {
    return this.http
      .get(this.baseUrl + '/managers/' + managerId + '/resetPassword')
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 매니저 삭제
  deleteManager(managerId: any) {
    return this.http.delete(this.baseUrl + '/managers/' + managerId);
  }

  // 매니저가 관리할 직원 등록
  addManagerEmployees(managerEmployeesData: any) {
    return this.http
      .post(this.baseUrl + '/managers/employees', managerEmployeesData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 매니저가 관리하는 직원 목록 조회
  getManagerEmployees(managerId: string): Observable<HttpResMsg<Employee[]>> {
    return this.http.get<HttpResMsg<Employee[]>>(
      this.baseUrl + '/managers/employees/' + managerId
    );
  }

  // 관리하지 않은 나머지 직원 목록 조회
  getManagerEmployeesWithout(
    companyId: string
  ): Observable<HttpResMsg<Employee[]>> {
    return this.http.get<HttpResMsg<Employee[]>>(
      this.baseUrl + '/managers/employees/' + companyId + '/without'
    );
  }

  // 매니저가 관리하고 있는 직원 삭제
  deleteManagerEmployees(employeeId: any) {
    return this.http.delete(this.baseUrl + '/managers/employee/' + employeeId);
  }
}
