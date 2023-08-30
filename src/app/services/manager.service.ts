import { DestroyRef, Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpResMsg } from '../interfaces/http-response.interfac';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Manager } from '../interfaces/manager.interface';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  private baseUrl = environment.apiUrl;
  destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient) {}

  //매니저 등록
  addManager(managerData: any) {
    return this.http
      .post(this.baseUrl + '/managers', managerData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  //매니저 목록 조회
  getManagerList(id: any): Observable<HttpResMsg<Manager[]>> {
    return this.http
      .get<HttpResMsg<Manager[]>>(this.baseUrl + '/managers/' + id)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 매니저 상세 조회 HttpParams 방법
  getManagerInfo(id: any): Observable<HttpResMsg<Manager>> {
    console.log(id);
    return this.http
      .get<HttpResMsg<Manager>>(this.baseUrl + '/managers/view/' + id)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 매니저 수정
  editManager(id: string, managerData: any) {
    console.log(id);
    return this.http
      .patch(this.baseUrl + '/managers/' + id, managerData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 매니저 삭제
  deleteManager(id: any) {
    return this.http.delete(this.baseUrl + '/managers/' + id);
  }
}
