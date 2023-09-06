import { CommonService } from './common.service';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
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
  payStubs = signal<any[]>([]);
  pdf = signal<any>({});

  constructor(
    private http: HttpClient,
  ) { }
  upload({ title, employee, file, writer, company }: Statment): Observable<HttpResMsg<any>> {
    const formData: FormData = new FormData();
    console.log(file)
    formData.append("file", file, file?.name);
    formData.append("title", title);
    formData.append("employee", employee);
    formData.append("writer", writer);
    formData.append("company", company);
    return this.http.post<HttpResMsg<any>>(this.baseUrl + '/statements', formData, {
      reportProgress: true,
    })
  }

  getFiles(): Observable<any> {
    return this.http.get<HttpResMsg<any>>(this.baseUrl + '/files');
  }

  getPayStubs(id: string): Observable<HttpResMsg<any[]>> {
    return this.http.get<HttpResMsg<any[]>>(this.baseUrl + '/statements/' + id)
  }

  setPayStubs(data: any[]) {
    return this.payStubs.set(data)
  }

  getPdf(url: string): Observable<ArrayBuffer> {
    // url 한글깨짐 방지용
    const encodedUrl = encodeURIComponent(url);
    const headers = new HttpHeaders({
      'Content-Type': 'application/pdf',
      'Accept': 'application/pdf'
    });
    return this.http.get(this.baseUrl + `/statements/findPdf/${encodedUrl}`, {
      headers: headers,
      responseType: 'arraybuffer'
    });
  }

}
