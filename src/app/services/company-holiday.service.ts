import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyHolidayService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //회사 공휴일 등록
  addCompanyHoliday(id: any, companyHolidayData: any) {
    return this.http.post(
      this.baseUrl + '/companies/' + id + '/holiday',
      companyHolidayData
    );
  }

  //회사 공휴일 목록 조회
  getCompanyHolidayList(id: any) {
    return this.http.get(this.baseUrl + '/companies/' + id + '/holiday');
  }

  //회사 공휴일 삭제
  deleteCompanyHoliday(id: any, holidayid: any) {
    return this.http.delete(
      this.baseUrl + '/companies/' + id + '/holiday/' + holidayid
    );
  }
}
