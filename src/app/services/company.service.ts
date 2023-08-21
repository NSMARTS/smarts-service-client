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

  constructor(private http: HttpClient) {}

  //회사 등록
  addCompany(companyData: any) {
    return this.http
      .post(this.baseUrl + '/company/company', companyData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  //회사 목록 조회
  getCompanyList(): Observable<HttpResMsg<Company[]>> {
    return this.http
      .get<HttpResMsg<Company[]>>(this.baseUrl + '/company/companies')
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 회사 상세 조회 HttpParams 방법
  getCompanyInfo(id: any): Observable<HttpResMsg<Company>> {
    return this.http
      .get<HttpResMsg<Company>>(this.baseUrl + '/company/company/' + id)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // query parameters는 URL 뒤로 ?를 사용하여 전달하거나 key=value형식으로 요청에 음성적인 데이터를 전달하는 방법입니다. 그것은 주로 데이터 복제, 호출, 페이징이 추가 요청을 야기할 때 사용됩니다.
  // getCompanyInfo(id: any) {
  //     console.log(id);
  //     return this.http.get(this.baseUrl + '/company/company/', {
  //         params: { _id: id },
  //     });
  // }

  // 회사 수정
  editCompany(id: string, companyData: any) {
    return this.http
      .patch(this.baseUrl + '/company/company/' + id, companyData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 회사 삭제
  deleteCompany(companyId: any) {
    return this.http
      .delete(this.baseUrl + '/company/company/', {
        params: companyId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef));
  }
}
