import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Subject, forkJoin, map, startWith, takeUntil } from 'rxjs';
import { MeetingService } from 'src/app/services/meeting.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { ManagerService } from 'src/app/services/manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from 'src/app/services/dialog.service';
import * as moment from 'moment';

import { FADE_IN } from 'src/app/animations/card.animation';

//view table
export interface PeriodicElement {
  Meeting: String;
  Date: Date;
}
export interface Member {
  _id: string;
  username: string;
}

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  animations: [FADE_IN],
})
export class MeetingComponent implements OnInit {
  meetingArray: any[] = [];
  today = new Date();

  displayedColumns: string[] = [
    'meetingTitle',
    'meetingDescription',
    'meetingLink',
    'startDate',
    'startTime',
    'managers',
    'employees',
  ];

  employees: any[] = [];
  managers: Member[] = [];
  companyId: string; // 회사아이디 params
  showAllMeetings: boolean = false;

  //   isLoadingResults = true;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private managerService: ManagerService,
    private meetingService: MeetingService,
    private dialogService: DialogService,
    private snackbar: MatSnackBar
  ) {
    this.companyId = this.route.snapshot.params['id'];

    // let year = this.today.getFullYear(); // 현재 연도 가져오기
    // let month: any = this.today.getMonth() + 1; // 현재 월 가져오기 (0부터 시작하므로 1을 더해줍니다.)
    // let day: any = this.today.getDate(); // 현재 날짜 가져오기

    // // 월과 날짜가 한 자리 숫자인 경우 두 자리로 포맷팅합니다.
    // if (month < 10) {
    //   month = '0' + month;
    // }

    // if (day < 10) {
    //   day = '0' + day;
    // }

    // this.formattedDate = year + '-' + month + '-' + day;
    // console.log(this.formattedDate);
  }

  ngOnInit(): void {
    // 여러 http 요청을 배열로 설정
    const multipleHttpRequest = [
      this.managerService.getManagerList(this.companyId),
      this.employeeService.getEmployees(this.companyId),
    ];

    // 2개의 http 요청 먼저 진행
    forkJoin(multipleHttpRequest).subscribe({
      next: (res: any) => {
        // res가 배열로 나옵니다. (요청한 순서대로))
        console.log(res);

        this.managers = res[0].data;
        this.employees = res[1].data;

        this.getMeetingList(this.companyId);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  // // manager list
  // getManagerList(companyId: string) {
  //   this.managerService.getManagerList(this.companyId).subscribe({
  //     next: (res: HttpResMsg<Manager[]>) => {
  //       // this.managers = res.data;
  //       console.log('manager list: ', this.managers);
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       if (err.status === 404) {
  //         console.error('No managers found');
  //       } else {
  //         console.error('An error occurred while fetching manager list');
  //       }
  //     },
  //   });
  // }

  // // employee list
  // getEmployees(companyId: string) {
  //   this.employeeService.getEmployees(this.companyId).subscribe({
  //     next: (res: HttpResMsg<Employee[]>) => {
  //       // this.employees = res.data;
  //       console.log('employee list: ', this.employees);
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       if (err.status === 404) {
  //         console.error('No employees found');
  //       } else {
  //         console.error('An error occurred while fetching employee list');
  //       }
  //     },
  //   });
  // }

  // 미팅 목록 조회
  getMeetingList(companyId: string) {
    this.meetingService.getMeetingList(companyId).subscribe({
      next: (data: any) => {
        // 1. meetingList에 날짜와 시간이 합쳐진 "meetingDate라는 변수를 추가"
        const meetingList = data.meetingList.map((item: any) => {
          // start time (ex; PM 12 : 00 ) 을 공백으로 split 하면 ['PM', '12', ':', '00]
          const meetingTime = {
            am_pm: item.startTime.split(' ')[0], // 배열[0]은 AM PM에 해당
            time: Number(item.startTime.split(' ')[1]), // 배열[1]은 시간에 해당
            minute: Number(item.startTime.split(' ')[3]), // 배열[3]은 분에 해당
          };

          // // // PM이고 12시인 경우만 12시이고 그 외의 PM은 +12를 해줌 (ex: PM 11 -> 23)
          if (meetingTime.am_pm == 'PM' && meetingTime.time != 12)
            meetingTime.time += 12;
          // AM이고 12시인 경우 00시를 의미하므로 해당 case만 0으로 변경
          if (meetingTime.am_pm == 'AM' && meetingTime.time == 12)
            meetingTime.time = 0;

          const yymmddStr = moment(item.startDate).format('YYYY-MM-DD');

          const meetingDate = new Date(
            `${yymmddStr} ${meetingTime.time}:${meetingTime.minute}`
          );

          // 참여 매니저 id에 맞는 username 등록
          // let newManager = item.managers
        //    .map((part: any) => {
          //   const userName = this.managers.filter((item) => {
          //     return part === item._id;
          //   })[0]?.username;

          //   // console.log(userName);
          //   return userName;
          // });
          
          let newManager = item.managers
            .map((part: any) => this.managers.find((item) => part === item._id))
            .filter((user: any) => user !== undefined)
            .map((user: any) => user.username);


          // 참여 직원 id에 맞는 username 등록
          // meeting 에 member에는 퇴사한 정보가 남아있다.
          // 퇴사 시 미팅에 있는 member도 삭제해야하는데
          // 임시로 안보이게함.
          
          // let newEmployee = item.employees.map((part: any) => {
          //   const userName = this.employees.filter((item) => {
          //     return part === item._id;
          //   })[0]?.username;

          //   // console.log(userName);
          //   return userName;
          // });

          let newEmployee = item.employees
            .map((part: any) =>
              this.employees.find((item) => part === item._id)
            )
            .filter((user: any) => user !== undefined)
            .map((user: any) => user.username);

          // 객체를 반환하여 meetingList 변수에 순차적으로 저장
          return { ...item, newManager, newEmployee, meetingDate };
        });

        this.meetingArray = meetingList.sort((a: any, b: any) => {
          return (
            new Date(b.meetingDate).getTime() -
            new Date(a.meetingDate).getTime()
          );
        });
        
        this.autoCloseMeeting();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  autoCloseMeeting() {
    // console.log(this.meetingArray);

    const meetingList = this.meetingArray.map((item: any) => {
      // console.log(this.today, new Date(item.startDate));
      const itemStartDate = new Date(item.startDate);
      itemStartDate.setHours(0, 0, 0, 0);
      this.today;
      //  console.log(this.today, itemStartDate);

      if (itemStartDate < this.today && item.status == 'Open') {
        // console.log(item._id);
        // let obj = { _id: item._id };
        this.closeMeeting(item._id, 'auto');
      }
    });
  }

  isToggleDisabled(startDate: string): boolean {
    const itemStartDate = new Date(startDate);
    itemStartDate.setHours(0, 0, 0, 0);
    this.today.setHours(0, 0, 0, 0);

    return itemStartDate < this.today;
  }

  // 미팅 생성
  openDialogDocMeetingSet() {
    const dialogRef = this.dialog.open(DialogMeetingSetComponent, {
      data: {
        companyId: this.companyId,
        managers: this.managers,
        employees: this.employees,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getMeetingList(this.companyId);
    });
  }

  toggle(meetingData: any) {
    if (meetingData.status == 'Open') {
      this.closeMeeting(meetingData, 'toggle');
    } else if (meetingData.status == 'Close') {
      this.openMeeting(meetingData);
    }
  }

  openMeeting(meetingData: any) {
    let data = {
      status: 'Open',
    };
    this.meetingService.editMeeting(meetingData._id, data).subscribe({
      next: (data: any) => {
        meetingData.status = 'Open';
      },
      error: (err: any) => {
        console.log(err);
      },
    });
    this.snackbar.open('Meeting Open', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
    });
  }

  closeMeeting(meetingData: any, closeType: string) {
    let data = {
      status: 'Close',
    };
    this.meetingService.editMeeting(meetingData._id, data).subscribe({
      next: (data: any) => {
        // console.log(data);
        meetingData.status = 'Close';
      },
      error: (err: any) => {
        console.log(err);
      },
    });

    if (closeType == 'auto') return;

    this.snackbar.open('Meeting close', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
    });
  }

  enterMeeting(data: any) {
    window.open(data.meetingLink);
  }

  // dialog에 아이디를 보내야함
  editMeeting(data: any) {
    const dialogRef = this.dialog.open(MeetingEditComponent, {
      data: {
        meetingData: data,
        managers: this.managers,
        employees: this.employees,
      },
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
    // console.log(companyMeetingData);
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
  templateUrl: '../../../dialog/meeting/meeting-set.html',
  styleUrls: ['./meeting.component.scss'],
  imports: [MaterialsModule, CommonModule],
  providers: [MeetingService],
})
export class DialogMeetingSetComponent {
  today = new Date();

  setMeetingForm = new FormGroup({
    startDate: new FormControl(this.today, [Validators.required]),
    meetingTitle: new FormControl('', [Validators.required]),
    meetingDescription: new FormControl(),
    meetingLink: new FormControl(),
    startHour: new FormControl('12'),
    startMin: new FormControl('00'),
    startUnit: new FormControl('PM'),
    managers: new FormControl([]),
    employees: new FormControl([]),
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

  managers: any = [];
  employees: any = [];

  constructor(
    public dialogRef: MatDialogRef<DialogMeetingSetComponent>,
    private dialogService: DialogService,
    private meetingService: MeetingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.managers = this.data.managers;
    this.employees = this.data.employees;
  }

  // 미팅 만들기
  createMeeting() {
    if (this.setMeetingForm.valid) {
      this.dialogService
        .openDialogConfirm('Do you want to set up a meeting?')
        .subscribe((result) => {
          if (result) {
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
              managers: formValue.managers,
              employees: formValue.employees,
              status: 'Open',
            };
            console.log(setMeeting);

            if (
              setMeeting.startDate == null ||
              setMeeting.meetingTitle == null
            ) {
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
  }

  startDatePickChange(dateValue: any) {
    this.setMeetingForm.get('startDate')?.setValue(dateValue);
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
  selector: 'app-meeting-edit',
  standalone: true,
  templateUrl: '../../../dialog/meeting/meeting-edit.html',
  styleUrls: ['./meeting.component.scss'],
  imports: [MaterialsModule, CommonModule],
  providers: [MeetingService],
})
export class MeetingEditComponent {
  setMeetingForm = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    meetingTitle: new FormControl('', [Validators.required]),
    meetingDescription: new FormControl(),
    meetingLink: new FormControl(),
    startHour: new FormControl('12'),
    startMin: new FormControl('00'),
    startUnit: new FormControl('PM'),
    managers: new FormControl([]),
    employees: new FormControl([]),
  });
  meetingList: any[] = [];

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

  managers: any = [];
  employees: any = [];
  meetingData: any;

  constructor(
    public dialogRef: MatDialogRef<MeetingEditComponent>,
    private dialogService: DialogService,
    private meetingService: MeetingService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.managers = this.data.managers;
    this.employees = this.data.employees;
    this.meetingData = this.data.meetingData;
  }

  ngOnInit(): void {
    this.getMeeting();
  }

  getMeeting() {
    const meetingTime = {
      startUnit: this.meetingData.startTime.split(' ')[0], // 배열[0]은 AM PM에 해당
      startHour: this.meetingData.startTime.split(' ')[1], // 배열[1]은 시간에 해당
      startMin: this.meetingData.startTime.split(' ')[3], // 배열[3]은 분에 해당
    };

    this.setMeetingForm.patchValue({
      ...this.meetingData,
      ...meetingTime,
    });
  }

  // 미팅 수정
  editMeeting() {
    if (this.setMeetingForm.valid) {
      this.dialogService
        .openDialogConfirm('Do you want to edit a meeting?')
        .subscribe((result) => {
          if (result) {
            const formValue = this.setMeetingForm.value;
            let setMeeting = {
              company: this.meetingData.company,
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
              managers: formValue.managers,
              employees: formValue.employees,
            };
            console.log(setMeeting);
            if (
              setMeeting.startDate == null ||
              setMeeting.meetingTitle == null
            ) {
              this.dialogService.openDialogNegative(
                'Please, check the meeting title and date.'
              );
            } else {
              this.meetingService
                .editMeeting(this.meetingData._id, setMeeting)
                .subscribe({
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
  }

  startDatePickChange(dateValue: any) {
    this.setMeetingForm.get('startDate')?.setValue(dateValue);
  }

  // 달력 필터
  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };
}
