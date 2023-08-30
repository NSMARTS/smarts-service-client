import { HttpClient, HttpRequest } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpResMsg } from '../interfaces/http-response.interfac';

@Injectable({
  providedIn: 'root'
})
export class PayStubService {
  private baseUrl = environment.apiUrl;
  destroyRef = inject(DestroyRef);
  constructor(
    private http: HttpClient,
  ) { }
  upload(company: string, email: any, file: File): Observable<HttpResMsg<any>> {
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);
    formData.append("email", email);
    formData.append("company", company);
    return this.http.post<HttpResMsg<any>>(this.baseUrl + '/statementes', formData)
  }

  getFiles(): Observable<any> {
    return this.http.get<HttpResMsg<any>>(this.baseUrl + '/files');
  }
}
