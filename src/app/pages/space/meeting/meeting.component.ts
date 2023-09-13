import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  WritableSignal,
  inject,
  signal,
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
import { Employee } from 'src/app/interfaces/employee.interface';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';
import { ManagerService } from 'src/app/services/manager.service';
import { Manager } from 'src/app/interfaces/manager.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from 'src/app/services/dialog.service';

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
})
export class MeetingComponent implements OnInit {
  spaceTime: any;
  meetingArray: any[] = [];
  userData: any;

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

        // 직원 명단 저장 후 Meeting Lsit 요청
        // 사실 3가지 요청을 동시에 하는게 가장 효율적이지만 코드를 조금 더 건드려야 함...
        // 기존 코드를 유지하는 차원에서는 이 방식이 가장 편함
        this.getMeetingList(this.companyId);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  // manager list
  getManagerList(companyId: string) {
    this.managerService.getManagerList(this.companyId).subscribe({
      next: (res: HttpResMsg<Manager[]>) => {
        // this.managers = res.data;
        console.log('manager list: ', this.managers);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('No managers found');
        } else {
          console.error('An error occurred while fetching manager list');
        }
      },
    });
  }

  // employee list
  getEmployees(companyId: string) {
    this.employeeService.getEmployees(this.companyId).subscribe({
      next: (res: HttpResMsg<Employee[]>) => {
        // this.employees = res.data;
        console.log('employee list: ', this.employees);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('No employees found');
        } else {
          console.error('An error occurred while fetching employee list');
        }
      },
    });
  }

  // 미팅 목록 조회
  getMeetingList(companyId: string) {
    this.meetingService.getMeetingList(companyId).subscribe({
      next: (data: any) => {
        // 1. meetingList에 날짜와 시간이 합쳐진 "meetingDate라는 변수를 추가"
        const meetingList = data.meetingList.map((item: any) => {
          // start time (ex; PM 12 : 00 ) 을 공백으로 split 하면 ['PM', '12', ':', '00]
          // const meetingTime = {
          //   am_pm: item.startTime.split(' ')[0], // 배열[0]은 AM PM에 해당
          //   time: Number(item.startTime.split(' ')[1]), // 배열[1]은 시간에 해당
          //   minute: Number(item.startTime.split(' ')[3]), // 배열[3]은 분에 해당
          // };

          // // PM이고 12시인 경우만 12시이고 그 외의 PM은 +12를 해줌 (ex: PM 11 -> 23)
          // if (meetingTime.am_pm == 'PM' && meetingTime.time != 12)
          //   meetingTime.time += 12;
          // // AM이고 12시인 경우 00시를 의미하므로 해당 case만 0으로 변경
          // if (meetingTime.am_pm == 'AM' && meetingTime.time == 12)
          //   meetingTime.time = 0;

          // // meetingDate라는 변수에 미팅 일자와 시간을 통합하여 저장
          // const meetingDate = new Date(
          //   `${item.startDate} ${meetingTime.time}:${meetingTime.minute}`
          // );

          console.log(item.managers, this.managers, this.employees);

          // 참여 매니저 id에 맞는 username 등록
          let newManager = item.managers.map((part: any) => {
            const userName = this.managers.filter((item) => {
              return part === item._id;
            })[0]?.username;

            console.log(userName);
            return userName;
          });

          // 참여 직원 id에 맞는 username 등록
          let newEmployee = item.employees.map((part: any) => {
            const userName = this.employees.filter((item) => {
              return part === item._id;
            })[0]?.username;

            console.log(userName);
            return userName;
          });

          // 객체를 반환하여 meetingList 변수에 순차적으로 저장
          return { ...item, newManager, newEmployee };
        });

        console.log(meetingList);

        // 2.meetingDate를 기준으로 sorting하고 해당 값을 this.meetingArray에 저장
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
      console.log('dialog close');
      this.getMeetingList(this.companyId);
      // this.getMeetingList();
    });
  }

  toggle(meetingData: any, index: any) {
    // console.log('data status', meetingData);
    // 1단계 status가 Open 일때
    if (meetingData.status == 'Open') {
      // meetingData.status = 'Close';
      console.log('data status', meetingData.status);
      this.closeMeeting(meetingData);
    } else if (meetingData.status == 'Close') {
      console.log('data status', meetingData.status);
      this.openMeeting(meetingData);
    }
  }

  openMeeting(meetingData: any) {
    let data = {
      _id: meetingData._id,
      spaceId: meetingData.spaceId,
      status: 'Open',
    };
    this.meetingService.editMeeting(data).subscribe({
      next: (data: any) => {
        console.log(data);
        // this.getMeetingList(this.companyId) 
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

  closeMeeting(meetingData: any) {
    let data = {
      _id: meetingData._id,
      spaceId: meetingData.spaceId,
      status: 'Close',
    };
    this.meetingService.editMeeting(data).subscribe({
      next: (data: any) => {
        console.log(data);
        // this.getMeetingList(this.companyId); 
        meetingData.status = 'Close';
      },
      error: (err: any) => {
        console.log(err);
      },
    });
    this.snackbar.open('Meeting close', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      // verticalPosition: "top",
    });
  }

  enterMeeting(data: any) {
    window.open(data.meetingLink);
  }

  // dialog에 아이디를 보내야함
  editMeeting(data: any) {
    const dialogRef = this.dialog.open(MeetingEditComponent, {
      data: {
        list: this.meetingArray,
        meetingId: data._id,
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
  templateUrl: '../../../dialog/meeting/meeting-set.html',
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
    managers: new FormControl(''),
    employees: new FormControl(''),
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
    private employeeService: EmployeeService
  ) {
    this.managers = this.data.managers;
    this.employees = this.data.employees;
    console.log(this.managers, this.employees);
  }

  // 미팅 만들기
  createMeeting() {
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
    managers: new FormControl(''),
    employees: new FormControl(''),
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

  constructor(
    public dialogRef: MatDialogRef<MeetingEditComponent>,
    private dialogService: DialogService,
    private meetingService: MeetingService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.managers = this.data.managers;
    this.employees = this.data.employees;
    console.log(this.managers, this.employees);
  }

  ngOnInit(): void {
    this.getMeeting();
  }

  getMeeting() {
    console.log(this.data);
    this.meetingList = this.data.list.filter(
      (e: any) => e._id === this.data.meetingId
    );
    // this.setMeetingForm.controls.startDate.patchValue(
    //   this.meetingList[0].meetingDate
    // );
    this.setMeetingForm.patchValue(this.meetingList[0]);
    console.log(this.setMeetingForm.value);
  }

  // 미팅 수정
  editMeeting() {
    this.dialogService
      .openDialogConfirm('Do you want to edit a meeting?')
      .subscribe((result) => {
        if (result) {
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
            managers: formValue.managers,
            employees: formValue.employees,
          };
          console.log(setMeeting);
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
