import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpResMsg } from '../interfaces/http-response.interfac';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) { }
  changeProfileImg(imgae: File, id: string): Observable<HttpResMsg<any>> {
    console.log(imgae)
    console.log(id)
    const formData: FormData = new FormData();
    formData.append("file", imgae, imgae?.name);
    formData.append("id", id);
    return this.http.post<HttpResMsg<any>>(this.baseUrl + '/profile', formData, {
      reportProgress: true,
    })
  }

  updateProfile(formData: any): Observable<HttpResMsg<any>> {
    return this.http.patch<HttpResMsg<any>>(this.baseUrl + '/profile', formData)
  }
}
