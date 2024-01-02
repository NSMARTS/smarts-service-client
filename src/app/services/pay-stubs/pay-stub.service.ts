import { PayStub } from '../../interfaces/pay-stub.interface';
import { CommonService } from '../common/common.service';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpResMsg } from '../../interfaces/http-response.interfac';
import { Statment } from '../../interfaces/statement.interface';

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
    formData.append("file", file, file?.name);
    formData.append("title", title);
    formData.append("employee", employee);
    formData.append("writer", writer);
    formData.append("company", company);

    return this.http.post<HttpResMsg<any>>(this.baseUrl + '/statements', formData, {
      reportProgress: true,
    })
  }

  edit(payStubId: string, { title, employee, file, writer, company }: Statment): Observable<HttpResMsg<any>> {
    const formData: FormData = new FormData();
    if (file) {
      formData.append("file", file, file?.name);
    }
    formData.append("title", title);
    formData.append("employee", employee);
    formData.append("writer", writer);
    formData.append("company", company);

    return this.http.patch<HttpResMsg<any>>(this.baseUrl + '/statements/' + payStubId, formData, {
      reportProgress: true,
    })
  }

  getFiles(): Observable<any> {
    return this.http.get<HttpResMsg<any>>(this.baseUrl + '/files');
  }

  getPayStubs(id: string, data: any): Observable<HttpResMsg<any[]>> {
    return this.http.get<HttpResMsg<any[]>>(this.baseUrl + '/statements/' + id, { params: data })
  }

  setPayStubs(data: any[]) {
    return this.payStubs.set(data)
  }

  getPayStub(compayId: string, payStubId: string): Observable<HttpResMsg<any>> {
    return this.http.get<HttpResMsg<any>>(this.baseUrl + '/statements/' + compayId + '/' + payStubId)
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

  deletePayStub(companyId: string, payStubId: string): Observable<HttpResMsg<any>> {
    return this.http.delete<HttpResMsg<any>>(this.baseUrl + '/statements/' + companyId + '/' + payStubId)
  }

  downloadPdf(key: string): Observable<Blob> {
    const encodedUrl = encodeURIComponent(key);

    const headers = new HttpHeaders({
      'Content-Type': 'application/pdf',
      'Accept': 'application/pdf'
    });
    return this.http.get(this.baseUrl + `/statements/download/${encodedUrl}`, {
      headers: headers,
      responseType: 'blob'
    })
  }
}


