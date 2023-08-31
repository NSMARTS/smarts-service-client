import { HttpClient, HttpRequest } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpResMsg } from '../interfaces/http-response.interfac';
import { Statment } from '../interfaces/statement.interface';

@Injectable({
  providedIn: 'root'
})
export class PayStubService {
  private baseUrl = environment.apiUrl;
  destroyRef = inject(DestroyRef);
  constructor(
    private http: HttpClient,
  ) { }
  upload({ title, employee, file, writer, company }: Statment): Observable<HttpResMsg<any>> {
    const formData: FormData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("employee", employee);
    formData.append("writer", writer);
    formData.append("company", company);
    return this.http.post<HttpResMsg<any>>(this.baseUrl + '/statementes', formData)
  }

  getFiles(): Observable<any> {
    return this.http.get<HttpResMsg<any>>(this.baseUrl + '/files');
  }
}
