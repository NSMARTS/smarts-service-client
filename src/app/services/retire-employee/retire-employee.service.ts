import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RetireEmployeeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 직원 퇴사
  retireEmployee(data: any) {
    return this.http.patch(this.baseUrl + '/employees', data);
  }
}
