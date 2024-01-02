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
  addCompanyHoliday(companyId: any, companyHolidayData: any) {
    return this.http.post(
      this.baseUrl + '/companies/' + companyId + '/holiday',
      companyHolidayData
    );
  }

  //회사 공휴일 목록 조회
  getCompanyHolidayList(companyId: any) {
    return this.http.get(this.baseUrl + '/companies/' + companyId + '/holiday');
  }

  //회사 공휴일 삭제
  deleteCompanyHoliday(companyId: any, holidayId: any) {
    return this.http.delete(
      this.baseUrl + '/companies/' + companyId + '/holiday/' + holidayId
    );
  }
}
