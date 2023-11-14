import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpResMsg } from '../interfaces/http-response.interfac';
import { ContractForm } from '../interfaces/contract.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  contractMod = signal<string>('') // add, detail, edit
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) {

  }

  createContract({ title, pdf, employee, writer, description, company }: ContractForm) {
    const formData: FormData = new FormData();
    formData.append("file", pdf, pdf?.name);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("employee", employee);
    formData.append("writer", writer);
    formData.append("company", company);
    return this.http.post<HttpResMsg<any>>(this.baseUrl + '/contracts', formData)
  }

  getContract(compayId: string, payStubId: any) {
    return this.http.get<HttpResMsg<any[]>>(this.baseUrl + '/contracts/' + compayId + '/' + payStubId)
  }


  getContracts(id: string, data: any) {
    return this.http.get<HttpResMsg<any[]>>(this.baseUrl + '/contracts/' + id, { params: data })
  }

  downloadPdf(key: string): Observable<Blob> {
    const encodedUrl = encodeURIComponent(key);

    const headers = new HttpHeaders({
      'Content-Type': 'application/pdf',
      'Accept': 'application/pdf'
    });
    return this.http.get(this.baseUrl + `/contracts/download/${encodedUrl}`, {
      headers: headers,
      responseType: 'blob'
    })
  }
}
