import { HttpClient } from "@angular/common/http";
import { MeetingListStorageService } from "../stores/data/meeting-list-storage.service";
import { shareReplay, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { Injectable } from "@angular/core";
import { CommonService } from "./common.service";
import { MemberDataStorageService } from "../stores/data/member-data-storage.service";

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  commonService: CommonService = new CommonService();

  constructor(
    private http: HttpClient,
    private meetingListStorageService: MeetingListStorageService
  ) // private mdsService: MemberDataStorageService,
  // private ddsService: DocDataStorageService,
  // private scrumService: ScrumBoardStorageService
  {}
  private baseUrl = environment.apiUrl;

  // getSpaceMembers(spaceTime: any) {
  //   return this.http.get(this.baseUrl + '/meetings').pipe(
  //     tap((res: any) => {
  //       console.log(res.scrumBoard);
  //       console.log(res.spaceDocs);
  //       console.log(res.spaceMembers);
  //       this.mdsService.updateMembers(res.spaceMembers);
  //       this.scrumService.updateScrumBoard(res.scrumBoard);
  //       this.ddsService.updateDocs(res.spaceDocs);
  //       return res.message;
  //     })
  //   );
  // }

  // 미팅 생성
  createMeeting(data: any) {
    return this.http.post(this.baseUrl + '/meetings', data).pipe(
      shareReplay(1),
      tap((res: any) => {
        console.log(res);
        // this.pendingCompReqStorageService.updatePendingRequest(res.pendingCompanyData);

        // commonservice
        for (let index = 0; index < res.meetingList?.length; index++) {
          (res.meetingList[index].start_date =
            this.commonService.dateFormatting(
              res.meetingList[index].start_date
            )),
            'dateOnly';
        }
        this.meetingListStorageService.updateMeetingList(res.meetingList);
        return res.message;
      })
    );
  }

  // 미팅목록 가져오기
  getMeetingList(companyId: string) {
    return this.http.get(this.baseUrl + '/meetings/' + companyId).pipe(
      shareReplay(1),
      tap((res: any) => {
        console.log(res.meetingList);
        // this.pendingCompReqStorageService.updatePendingRequest(res.pendingCompanyData);

        // common service
        for (let index = 0; index < res.meetingList.length; index++) {
          (res.meetingList[index].start_date =
            this.commonService.dateFormatting(
              res.meetingList[index].start_date
            )),
            'dateOnly';
        }
        this.meetingListStorageService.updateMeetingList(res.meetingList);
        return res.message;
      })
    );
  }

  // meeting data clicked = true or false
  statusInMeeting(data: any) {
    return data.map((data: any) => {
      if (data.status == 'pending') {
        data.clicked = false;
        data.isButton = false;
      } else if (data.status == 'Open') {
        data.clicked = true;
        data.isButton = true;
      } else if (data.status == 'Close') {
        data.clicked = false;
        data.isButton = true;
      }
      return data;
    });
  }
}
