import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Company } from '../interfaces/company.interface';
import { HttpResMsg } from '../interfaces/http-response.interfac';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //회사 등록
  addCompany(companyData: any) {
    return this.http.post(this.baseUrl + '/companies', companyData);
  }

  //회사 목록 조회
  getCompanyList(): Observable<HttpResMsg<Company[]>> {
    return this.http.get<HttpResMsg<Company[]>>(this.baseUrl + '/companies');
  }

  // 회사 상세 조회 HttpParams 방법
  getCompanyInfo(id: any): Observable<HttpResMsg<Company>> {
    return this.http.get<HttpResMsg<Company>>(
      this.baseUrl + '/companies/' + id
    );
  }

  // 회사 수정
  editCompany(id: string, companyData: any) {
    return this.http.patch(this.baseUrl + '/companies/' + id, companyData);
  }

  // 회사 삭제
  deleteCompany(id: any) {
    console.log(id);
    return this.http.delete(this.baseUrl + '/companies/' + id);
  }
}
