import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FormControl, FormGroup } from '@angular/forms';
import { DialogService } from 'src/app/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';
import { MemberDataStorageService } from 'src/app/stores/data/member-data-storage.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { DataService } from 'src/app/stores/data/data.service';
import { MeetingListStorageService } from 'src/app/stores/data/meeting-list-storage.service';

//view table
export interface PeriodicElement {
    Meeting: String;
    Date: Date;
}

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
})
export class MeetingComponent implements OnInit {
  spaceTime: any;
  meetingArray: any[] = [];
  private unsubscribe$ = new Subject<void>();
  userData: any;
  @Input() memberInSpace: any;
  displayedColumns: string[] = [
    'meetingTitle',
    'meetingDescription',
    'meetingLink',
    'start_date',
    'start_time',
  ];
  companyId: string; // 회사아이디 params

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private dataService: DataService,
    private meetingService: MeetingService, // private meetingListStorageService: MeetingListStorageService,
    private dialogService: DialogService
  ) {
    this.companyId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    // this.route.params.subscribe((params) => {
    // this.spaceTime = this.route.snapshot.params['spaceTime'];
    // console.log(params);

    // this.meetingService.getSpaceMembers(params.spaceTime).subscribe(
    //   async (data: any) => {
    //     await this.getMembers();
    //   },
    //   (err: any) => {
    //     console.log('spaceService error', err);
    //   }
    // );
    this.getMeetingList(this.companyId);
    // });
  }

  // // 미팅 목록 조회
  // getMeetingList(companyId: string) {
  //   this.meetingService.getMeetingList(companyId).subscribe({
  //     next: (data: any) => {
  //       console.log(data.meetingList);
  //       this.meetingArray = data.meetingList.sort((a: any, b: any) => {
  //         return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  //       });
  //       console.log(this.meetingArray)
  //     },
  //     error: (err: any) => {
  //       console.log(err);
  //     },
  //   });
  // }

  // 미팅 목록 조회
  getMeetingList(companyId: string) {
    this.meetingService.getMeetingList(companyId).subscribe({
      next: (data: any) => {
        // 1. 서버 response를 meetingList라는 변수에 복사 (clone)
        const meetingList = structuredClone(data.meetingList);

        // 2. meetingList에 날짜와 시간이 합쳐진 "meetingDate라는 변수를 추가"
        meetingList.map((item: any) => {
          // start time (ex; PM 12 : 00 ) 을 공백으로 split 하면 ['PM', '12', ':', '00]
          const meetingTime = {
            am_pm: item.start_time.split(' ')[0], // 배열[0]은 AM PM에 해당
            time: Number(item.start_time.split(' ')[1]), // 배열[1]은 시간에 해당
            minute: Number(item.start_time.split(' ')[3]), // 배열[3]은 분에 해당
          };

          // PM이고 12시인 경우만 12시이고 그 외의 PM은 +12를 해줌 (ex: PM 11 -> 23)
          if (meetingTime.am_pm == 'PM' && meetingTime.time != 12)
            meetingTime.time += 12;
          // AM이고 12시인 경우 00시를 의미하므로 해당 case만 0으로 변경
          if (meetingTime.am_pm == 'AM' && meetingTime.time == 12)
            meetingTime.time = 0;

          // meetingDate라는 변수에 미팅 일자와 시간을 통합하여 저장
          item.meetingDate = new Date(
            `${item.start_date} ${meetingTime.time}:${meetingTime.minute}`
          );
          return item;
        });

        // console.log(meetingList);

        // 3.meetingDate를 기준으로 sorting하고 해당 값을 this.meetingArray에 저장
        // (현재는 최근일수로 위로 오도록 sort => 과거 미팅을 위에 오게 하려면 b와 a의 위치 변경 )
        this.meetingArray = meetingList.sort((a: any, b: any) => {
          return (
            new Date(a.meetingDate).getTime() -
            new Date(b.meetingDate).getTime()
          );
        });
        console.log(this.meetingArray);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  // ngOnChanges() {
  //   // this.spaceTime = this.route.snapshot.params.spaceTime;
  //   this.spaceTime = this.route.snapshot.params['spaceTime'];
  //   this.dataService.userProfile
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((data: any) => {
  //       console.log(data);
  //       this.userData = data;
  //       this.meetingIsHost();
  //     });
  // }

  //미팅 호스트인지 확인하고 호스트면 툴바 보이게하기
  // meetingIsHost() {
  //   this.meetingListStorageService.meeting$
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((data: any) => {
  //       this.meetingArray = this.meetingService.statusInMeeting(data);
  //       // this.meetingArray = new MatTableDataSource<PeriodicElement>(this.meetingArray);
  //       // this.onResize();

  //       for (let i = 0; i < this.meetingArray.length; i++) {
  //         const hostId = this.meetingArray[i].manager;

  //         if (hostId == this.userData._id) {
  //           this.meetingArray[i].isHost = true;
  //         } else {
  //           this.meetingArray[i].isHost = false;
  //         }
  //         for (let j = 0; j < this.memberInSpace.length; j++) {
  //           const memberId = this.memberInSpace[j]._id;
  //           if (hostId == memberId) {
  //             this.meetingArray[i].manager_name = this.memberInSpace[j].name;
  //             this.meetingArray[i].manager_profile =
  //               this.memberInSpace[j].profile_img;
  //           }
  //         }
  //       }
  //     });
  // }

  // 미팅 생성
  openDialogDocMeetingSet() {
    const dialogRef = this.dialog.open(DialogMeetingSetComponent, {
      data: { companyId: this.companyId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('dialog close');
      this.getMeetingList(this.companyId);
      // this.getMeetingList();
    });
  }

  trackById(index: number, data: any): number {
    return data._id;
  }

  toggle(meetingData: any, index: any) {}

  enterMeeting(data: any) {
    window.open(data.meetingLink);
  }

  // dialog에 아이디를 보내야함
  editMeeting(data: any) {
    const dialogRef = this.dialog.open(MeetingEditComponent, {
      // data: { companyId: data.company , meetingId: data._id },
      data: { list: this.meetingArray, meetingId: data._id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getMeetingList(this.companyId);
    });
  }

  deleteMeeting(data: any) {
    const companyMeetingData = {
      companyId: this.companyId,
      meetingId: data._id,
    };
    console.log(companyMeetingData);
    this.dialogService
      .openDialogConfirm('Do you want to cancel the meeting?')
      .subscribe((result) => {
        if (result) {
          this.meetingService.deleteMeeting(companyMeetingData).subscribe({
            next: (data: any) => {
              console.log(data);
              this.dialogService.openDialogPositive(
                'Successfully, the meeting has been deleted.'
              );
              this.getMeetingList(this.companyId);
            },
            error: (err: any) => {
              console.log(err);
            },
          });
        }
      });
  }
}


///////////////////////////////////////////////////////////
// 미팅 생성하는 dialog

@Component({
  selector: 'app-meeting-set',
  standalone: true,
  templateUrl: './dialog/meeting-set.html',
  styleUrls: ['./meeting.component.scss'],
  imports: [MaterialsModule, CommonModule],
  providers: [MeetingService],
})
export class DialogMeetingSetComponent {
  today = new Date();

  setMeetingForm = new FormGroup({
    startDate: new FormControl(this.today),
    meetingTitle: new FormControl(),
    meetingDescription: new FormControl(),
    meetingLink: new FormControl(),
    startHour: new FormControl('12'),
    startMin: new FormControl('00'),
    startUnit: new FormControl('PM'),
  });

  hourList = [
    { value: '1' },
    { value: '2' },
    { value: '3' },
    { value: '4' },
    { value: '5' },
    { value: '6' },
    { value: '7' },
    { value: '8' },
    { value: '9' },
    { value: '10' },
    { value: '11' },
    { value: '12' },
  ];
  minList = [
    { value: '00' },
    { value: '15' },
    { value: '30' },
    { value: '45' },
  ];
  timeUnit = [{ value: 'PM' }, { value: 'AM' }];

  enlistedMember: any = [];
  private unsubscribe$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<DialogMeetingSetComponent>,
    private dialogService: DialogService,
    private meetingService: MeetingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdsService: MemberDataStorageService
  ) {
    this.mdsService.members.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (data: any) => {
        console.log(data);
        for (let index = 0; index < data[0]?.memberObjects.length; index++) {
          this.enlistedMember.push(data[0]?.memberObjects[index]._id);
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  ngOnDestroy() {
    // unsubscribe all subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // 미팅 만들기
  createMeeting() {
    this.dialogService
      .openDialogConfirm('Do you want to set up a meeting?')
      .subscribe((result) => {
        if (result) {
          // currentMember 만들기 -> 실시간 미팅에서 쓰임
          let currentMember = new Array();
          for (let index = 0; index < this.enlistedMember.length; index++) {
            const element = {
              member_id: this.enlistedMember[index],
              role: 'Presenter',
              online: false,
            };
            currentMember.push(element);
          }

          const formValue = this.setMeetingForm.value;

          let setMeeting = {
            company: this.data.companyId,
            meetingTitle: formValue.meetingTitle,
            meetingDescription: formValue.meetingDescription,
            meetingLink: formValue.meetingLink,
            startDate: formValue.startDate,
            startTime:
              formValue.startUnit +
              ' ' +
              formValue.startHour +
              ' : ' +
              formValue.startMin,
            enlistedMembers: this.enlistedMember,
            currentMembers: currentMember,
            status: 'pending',
          };
          console.log(setMeeting.company);

          if (setMeeting.startDate == null || setMeeting.meetingTitle == null) {
            this.dialogService.openDialogNegative(
              'Please, check the meeting title and date.'
            );
          } else {
            this.meetingService.createMeeting(setMeeting).subscribe({
              next: (data: any) => {
                console.log(data);
                this.dialogRef.close();
                this.dialogService.openDialogPositive(
                  'Successfully, the meeting has been set up.'
                );
              },
              error: (err: any) => {
                console.log(err);
              },
            });
          }
        }
      });
  }

  // 달력 필터
  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };
}


///////////////////////////////////////////////////////////
// 미팅 편집하는 dialog

@Component({
  selector: 'app-meeting-set',
  standalone: true,
  templateUrl: './dialog/meeting-edit.html',
  styleUrls: ['./meeting.component.scss'],
  imports: [MaterialsModule, CommonModule],
  providers: [MeetingService],
})
export class MeetingEditComponent {
  today = new Date();

  setMeetingForm = new FormGroup({
    startDate: new FormControl(this.today),
    meetingTitle: new FormControl(),
    meetingDescription: new FormControl(),
    meetingLink: new FormControl(),
    startHour: new FormControl('12'),
    startMin: new FormControl('00'),
    startUnit: new FormControl('PM'),
  });
  meetingList: any;

  hourList = [
    { value: '1' },
    { value: '2' },
    { value: '3' },
    { value: '4' },
    { value: '5' },
    { value: '6' },
    { value: '7' },
    { value: '8' },
    { value: '9' },
    { value: '10' },
    { value: '11' },
    { value: '12' },
  ];
  minList = [
    { value: '00' },
    { value: '15' },
    { value: '30' },
    { value: '45' },
  ];
  timeUnit = [{ value: 'PM' }, { value: 'AM' }];

  enlistedMember: any = [];
  private unsubscribe$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<MeetingEditComponent>,
    private dialogService: DialogService,
    private meetingService: MeetingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdsService: MemberDataStorageService
  ) {
    this.mdsService.members.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (data: any) => {
        console.log(data);
        for (let index = 0; index < data[0]?.memberObjects.length; index++) {
          this.enlistedMember.push(data[0]?.memberObjects[index]._id);
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  ngOnInit(): void {
    this.getMeeting();
  }

  ngOnDestroy() {
    // unsubscribe all subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getMeeting() {
    console.log(this.data);
    this.meetingList = this.data.list.filter((e: any) => e._id === this.data.meetingId);
    console.log(this.meetingList);
    this.setMeetingForm.patchValue(this.meetingList[0]);
  }

  // 미팅 만들기
  editMeeting() {
    this.dialogService
      .openDialogConfirm('Do you want to set up a meeting?')
      .subscribe((result) => {
        if (result) {
          // currentMember 만들기 -> 실시간 미팅에서 쓰임
          let currentMember = new Array();
          for (let index = 0; index < this.enlistedMember.length; index++) {
            const element = {
              member_id: this.enlistedMember[index],
              role: 'Presenter',
              online: false,
            };
            currentMember.push(element);
          }
          const formValue = this.setMeetingForm.value;
          let setMeeting = {
            _id: this.meetingList[0]._id,
            company: this.meetingList[0].company,
            meetingTitle: formValue.meetingTitle,
            meetingDescription: formValue.meetingDescription,
            meetingLink: formValue.meetingLink,
            startDate: formValue.startDate,
            startTime:
              formValue.startUnit +
              ' ' +
              formValue.startHour +
              ' : ' +
              formValue.startMin,
            enlistedMembers: this.enlistedMember,
            currentMembers: currentMember,
            status: 'pending',
          };
          console.log(this.meetingList[0].company);
          if (setMeeting.startDate == null || setMeeting.meetingTitle == null) {
            this.dialogService.openDialogNegative(
              'Please, check the meeting title and date.'
            );
          } else {
            this.meetingService.editMeeting(setMeeting).subscribe({
              next: (data: any) => {
                console.log(data);
                this.dialogRef.close();
                this.dialogService.openDialogPositive(
                  'Successfully, the meeting has been edit.'
                );
              },
              error: (err: any) => {
                console.log(err);
              },
            });
          }
        }
      });
  }

  // 달력 필터
  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };
}