import { HttpClient } from "@angular/common/http";
import { MeetingListStorageService } from "../stores/data/meeting-list-storage.service";
import { shareReplay, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { Injectable } from "@angular/core";
import { CommonService } from "./common.service";
@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  commonService: CommonService = new CommonService();

  constructor(
    private http: HttpClient,
    private meetingListStorageService: MeetingListStorageService // private mdsService: MemberDataStorageService, // private ddsService: DocDataStorageService, // private scrumService: ScrumBoardStorageService
  ) {}
  private baseUrl = environment.apiUrl;

  // 미팅 생성
  createMeeting(data: any) {
    return this.http.post(this.baseUrl + '/meetings', data);
  }

  // 미팅목록 조회
  getMeetingList(companyId: string) {
    return this.http.get(this.baseUrl + '/meetings/' + companyId);
  }

  // 미팅 삭제
  deleteMeeting(data: any) {
    console.log(data);
    return this.http.delete(
      this.baseUrl + '/meetings/' + data.companyId + '/' + data.meetingId
    );
  }

  // 미팅 수정
  editMeeting(setMeeting: any) {
    return this.http.put(this.baseUrl + '/meetings', setMeeting);
  }

  // 미팅 오픈
  openMeeting(data: any) {
    return this.http.put(this.baseUrl + '/meetings', data);
  }

  // 미팅 클로즈
  closeMeeting(data: any) {
    return this.http.put(this.baseUrl + '/meetings', data);
  }

}
