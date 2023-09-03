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
    'start_date',
    'start_time',
  ];

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private dataService: DataService,
    private meetingService: MeetingService,
    private meetingListStorageService: MeetingListStorageService
  ) {}

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

    this.meetingService.getMeetingList().subscribe({
      next: (data: any) => {
        console.log(data.meetingList);
        this.meetingArray = data.meetingList;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
    // });
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
    // this.spaceTime = this.route.snapshot.params.spaceTime;
    this.spaceTime = this.route.snapshot.params['spaceTime'];

    const dialogRef = this.dialog.open(DialogMeetingSetComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('dialog close');
      // this.getMeetingList();
    });
  }

  trackById(index: number, data: any): number {
    return data._id;
  }

  toggle(meetingData: any, index: any) {}

  enterMeeting(data: any) {}

  deleteMeeting(data: any) {}
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
    // this.mdsService.members.pipe(takeUntil(this.unsubscribe$)).subscribe({
    //   next: (data: any) => {
    //     console.log(data);
    //     for (let index = 0; index < data[0]?.memberObjects.length; index++) {
    //       this.enlistedMember.push(data[0]?.memberObjects[index]._id);
    //     }
    //   },
    //   error: (err: any) => {
    //     console.log(err);
    //   },
    // });
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
            meetingTitle: formValue.meetingTitle,
            meetingDescription: formValue.meetingDescription,
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
          console.log(setMeeting);

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