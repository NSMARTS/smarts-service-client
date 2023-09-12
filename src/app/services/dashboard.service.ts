import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //모든 개수 목록 조회
  getAllCount() {
    return this.http.get(this.baseUrl + '/dashboard');
  }

  //모든 리스트 목록 조회
  getAllList() {
    return this.http.get(this.baseUrl + '/dashboard/list');
  }

  //모든 나라 목록 조회
  getAllCountry() {
    return this.http.get(this.baseUrl + '/dashboard/country');
  }

  //회사별 모든 개수 목록 조회
  getAllCompanyCount(companyId: any) {
    return this.http.get(this.baseUrl + '/dashboard/company/' + companyId);
  }
}
