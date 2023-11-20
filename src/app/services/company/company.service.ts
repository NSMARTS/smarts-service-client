import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Company } from '../../interfaces/company.interface';
import { HttpResMsg } from '../../interfaces/http-response.interfac';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private baseUrl = environment.apiUrl;
  destroyRef = inject(DestroyRef);

  companyId = signal<string>('');

  constructor(private http: HttpClient) {
    effect(() => console.log('회사 ID :', this.companyId()));
  }

  //회사 등록
  addCompany(companyData: any) {
    return this.http
      .post(this.baseUrl + '/companies', companyData)
  }

  //회사 목록 조회
  getCompanyList(): Observable<HttpResMsg<Company[]>> {
    return this.http
      .get<HttpResMsg<Company[]>>(this.baseUrl + '/companies')
  }

  // sorting 예제 현재 sorting pagenation
  //회사 목록과 회사별 직원, 매니저 수 조회
  // getCompanyListWith(active: string, direction: string, pageIndex: number, pageSize: number): Observable<HttpResMsg<Company[]>> {
  //   const queryParams = { 'active': active, 'direction': direction, 'pageIndex': pageIndex, 'pageSize': pageSize }
  //   return this.http.get<HttpResMsg<Company[]>>(
  //     this.baseUrl + '/companies/with', {
  //     params: queryParams
  //   }
  //   );
  // }

  //회사 목록과 회사별 직원, 매니저 수 조회
  getCompanyListWith(): Observable<HttpResMsg<Company[]>> {

    return this.http.get<HttpResMsg<Company[]>>(
      this.baseUrl + '/companies/with'
    );
  }


  // 회사 상세 조회 HttpParams 방법
  getCompanyInfo(companyId: any): Observable<HttpResMsg<Company>> {
    return this.http
      .get<HttpResMsg<Company>>(this.baseUrl + '/companies/view/' + companyId)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 회사 수정
  editCompany(companyId: string, companyData: any) {
    return this.http
      .patch(this.baseUrl + '/companies/' + companyId, companyData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 회사 삭제
  deleteCompany(companyId: any) {
    return this.http.delete(this.baseUrl + '/companies/' + companyId);
  }
}
