import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyHolidayService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCompanyHolidayList(id: any) {
    return this.http.get(this.baseUrl + '/companies/' + id + '/holiday');
  }

  addCompanyHoliday(id: any, companyHolidayData: any) {
    console.log(companyHolidayData);
    return this.http.post(
      this.baseUrl + '/companies/' + id + '/holiday',
      companyHolidayData
    );
  }

  deleteCompanyHoliday(id: any, holidayid: any) {
    return this.http.delete(
      this.baseUrl + '/companies/' + id + '/holiday/' + holidayid
    );
  }
}
