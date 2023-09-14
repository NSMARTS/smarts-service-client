import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpResMsg } from '../interfaces/http-response.interfac';
import { Notification } from '../interfaces/notification.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  createNotification(data: any): Observable<HttpResMsg<Notification>> {
    return this.http.post<HttpResMsg<Notification>>(this.baseUrl + '/notifications', data)
  }

  getNotifications(id: string, data: any): Observable<HttpResMsg<Notification[]>> {
    return this.http.get<HttpResMsg<Notification[]>>(this.baseUrl + '/notifications/' + id + '/', { params: data })
  }
}
