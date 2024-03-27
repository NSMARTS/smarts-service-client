import { AuthService } from '../../../services/auth/auth.service';
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { SidenavService } from 'src/app/stores/layout/sidenav.service';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Input() isSidenavRequired: boolean = false;
  @Input() companyInfo: any = {};
  private sidenavService = inject(SidenavService);
  // isSideNavOpen Boolean 사이드 nav 켰어 안켰어
  isSideNavOpen = this.sidenavService.isSideNavOpen;
  private unsubscribe$ = new Subject<void>();

  authService = inject(AuthService);
  userInfoStore = this.authService.userInfoStore;

  router = inject(Router);

  userProfileData: any; // 유저 프로필. 나중에 타입 추가
  notiItems: any = []; // 알림 객체 형식을 아직 모름. 나중에 타입 추가
  notiItemsLength = 0; // 알림 온 숫자 표시
  profileImg: string = '';
  companyId: any;

  constructor() {
    // public dataService: DataService // private route: ActivatedRoute, // private toolbarService: ToolbarService,
    // this.companyId = this.route.snapshot.params['id'];
    // this.dataService.userCompanyProfile
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((res: any) => {
    //     this.companyId = res;
    //   });
  }

  ngOnInit(): void {
    // this.notificationService.getNotification().subscribe(
    //     (data: any) => {
    //         if (data.result) {
    //         }
    //     }
    // )
    // this.getUserProfileData();
    // this.getNotificationData();
    // const splittedUrl = this.router.url.split('/');
    // // company의 하위 url인 경우 sidebar update
    // if (splittedUrl[1] === 'company') {
    //   // companyId 저장
    //   this.companyId = splittedUrl[2];
    // }
    // this.getCompanyInfo();
    // console.log(this.companyId);
  }

  // ngOnDestroy() {
  //   // unsubscribe all subscription
  //   this.unsubscribe$.next();
  //   this.unsubscribe$.complete();
  // }

  // getCompanyInfo() {
  //   this.toolbarService.getCompanyInfo(this.companyId);
  // };

  signOut() {
    // console.log('logout');
    // this.authService.logOut();
    // this.snackbar.open('Logout Goodbye ' + this.userProfileData.name, 'Close', {
    //     duration: 3000,
    //     horizontalPosition: "center"
    // });
    // this.router.navigate(['welcome']);
  }

  // getUserProfileData() {
  //     this.dataService.userProfile.pipe(takeUntil(this.unsubscribe$)).subscribe((res: any) => {
  //         this.userProfileData = res;
  //     });
  // }

  // notification 가져오기
  // getNotificationData() {
  //     const today = new Date();

  //     this.notificationStorageService.myNotificationData.pipe(takeUntil(this.unsubscribe$)).subscribe((res: any) => {

  //         // console.log(res)

  //         this.notiItems = res;
  //         let count = 0;
  //         for (let index = 0; index < this.notiItems.length; index++) {
  //             const element = this.notiItems[index].isRead;
  //             this.notiItems[index].period = moment(this.notiItems[index].createdAt).from(moment(today));
  //             if (element == false) {
  //                 count++;
  //             }
  //         }
  //         this.notiItemsLength = count
  //     });
  // }

  // notification 눌렀을때 이동
  // 나중에 타입 선언
  moveToPage(item: any) {
    // this.notificationService.editNotification(item).subscribe(
    //     (data: any) => {
    //         // console.log(data);
    //     }
    // )
    // // console.log(navi);
    // this.router.navigate([item.navigate]);
  }

  // MARK ALL AS READ 눌렀을때
  allRead() {
    //     this.notificationService.allReadNotification().subscribe(
    //         (data: any) => {
    //         }
    //     )
  }

  openSidenav() {
    //isSideNavOpen 를 true로 바꿈
    this.sidenavService.openSidenav();
  }

  signout() {
    this.authService.signOut();
    this.router.navigate(['sign-in']);
  }
}
