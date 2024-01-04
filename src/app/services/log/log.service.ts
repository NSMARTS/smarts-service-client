import { HttpClient } from '@angular/common/http';
import { Injectable, effect, signal } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  selectedLog = signal<any>({})

  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {
    effect(() => {
      console.log(this.selectedLog())
    })
  }

  /**
   * 조건(회사, 이메일, 기간)에 일치하는 사용자의 마지막 접속 로그 목록
   * @param query 
   * @returns 
   */
  getLogs(query: any) {
    return this.http.get(this.baseUrl + '/logs', { params: query })
  }

  createLog(data: any) {
    return this.http.post(this.baseUrl + `/logs`, data)
  }

  /**
   * 선택한 사용자의 접속 로그 목록
   * @param query 
   * @returns 
   */
  getUserLogs(query: any) {
    return this.http.get(this.baseUrl + '/logs/user', { params: query })
  }

  setSelectedLog(log: any) {
    this.selectedLog.set(log)
  }

}
