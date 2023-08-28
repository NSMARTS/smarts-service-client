import { DestroyRef, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Company } from '../interfaces/company.interface';
import { HttpResMsg } from '../interfaces/http-response.interfac';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private baseUrl = environment.apiUrl;
  destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient) { }

  //회사 등록
  addCompany(companyData: any) {
    return this.http.post(this.baseUrl + '/companies', companyData).pipe(takeUntilDestroyed(this.destroyRef));
  }

  //회사 목록 조회
  getCompanyList(): Observable<HttpResMsg<Company[]>> {
    return this.http.get<HttpResMsg<Company[]>>(this.baseUrl + '/companies').pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 회사 상세 조회 HttpParams 방법
  getCompanyInfo(id: any): Observable<HttpResMsg<Company>> {
    return this.http.get<HttpResMsg<Company>>(
      this.baseUrl + '/companies/' + id
    ).pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 회사 수정
  editCompany(id: string, companyData: any) {
    return this.http.patch(this.baseUrl + '/companies/' + id, companyData).pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 회사 삭제
  deleteCompany(id: any) {
    return this.http.delete(this.baseUrl + '/companies/' + id);
  }

  // 회사목록 & 회사 별 직원 수 조회
  findAllWithEmployeesNum(): Observable<HttpResMsg<Company[]>> {
    return this.http.get<HttpResMsg<Company[]>>(this.baseUrl + '/companies/findAllWithEmployeesNum');
  }
}
