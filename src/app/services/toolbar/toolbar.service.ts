import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  constructor(private http: HttpClient) {}
  private baseUrl = environment.apiUrl;
  
  // 나라 목록 조회
  getCompanyInfo(companyId: any) {
    return this.http.get(this.baseUrl + '/countries');
  }
}