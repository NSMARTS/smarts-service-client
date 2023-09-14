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

  getNotification(companyId: string, notificationId: string): Observable<HttpResMsg<Notification>> {
    console.log(this.baseUrl + '/notifications/' + companyId + '/' + notificationId)
    return this.http.get<HttpResMsg<Notification>>(this.baseUrl + '/notifications/' + companyId + '/' + notificationId)
  }

  getNotifications(id: string, query: any): Observable<HttpResMsg<Notification[]>> {
    return this.http.get<HttpResMsg<Notification[]>>(this.baseUrl + '/notifications/' + id, { params: query })
  }

  createNotification(data: any): Observable<HttpResMsg<Notification>> {
    return this.http.post<HttpResMsg<Notification>>(this.baseUrl + '/notifications', data)
  }

  updateNotification(companyId: string, notificationId: string, data: any): Observable<HttpResMsg<Notification>> {
    return this.http.patch<HttpResMsg<Notification>>(this.baseUrl + `/notifications/${companyId}/${notificationId}`, data)
  }

  deleteNotification(notificationId: string) {
    return this.http.delete<HttpResMsg<Notification>>(this.baseUrl + '/notifications/' + notificationId)
  }
}
