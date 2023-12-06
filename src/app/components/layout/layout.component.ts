import {
  Component,
  DestroyRef,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialsModule } from 'src/app/materials/materials.module';
import { ToolbarComponent } from './toolbar/toolbar.component';

import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { SidenavComponent } from './sidenav/sidenav.component';
import { delay, distinctUntilChanged, filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatSidenav } from '@angular/material/sidenav';
import { SidenavService } from 'src/app/stores/layout/sidenav.service';
import { NavigationService } from 'src/app/stores/layout/navigation.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    MaterialsModule,
    ToolbarComponent,
    SidenavComponent,
    RouterModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private sidenavService = inject(SidenavService);
  isDesktop = this.sidenavService.isDesktop;

  isSideNavOpen = this.sidenavService.isSideNavOpen;
  private navigationService = inject(NavigationService);
  navItems = this.navigationService.navItems;

  isSidenavRequired = false;
  route = inject(ActivatedRoute);

  companyId = this.route.snapshot.params['id'];
  companyInfo: any;

  // isLoadingResults는 false
  isLoadingResults: boolean = false;

  // 나중에 타입 알아서 적는다.
  userProfileData: any;
  public isActive: boolean = false;

  @ViewChild('sidenav', { static: true })
  sidenav!: MatSidenav;

  destroyRef = inject(DestroyRef);

  // subscriptions: Subscription;
  notiItems = [
    {
      notiType: 'leave-request',
      isRead: false,
      iconText: 'open_in_browser',
      notiLabel: 'A new leave request received',
    },
    {
      notiType: 'company-request',
      isRead: false,
      iconText: 'work_outline',
      notiLabel: 'A new company request received',
    },
    {
      notiType: 'company-res-y',
      isRead: false,
      iconText: 'done_outline',
      notiLabel: 'The company request has been accepted',
    },
    {
      notiType: 'leave-res-n',
      isRead: false,
      iconText: 'block',
      notiLabel: 'The leave request has been rejected',
    },
    {
      notiType: 'company-res-n',
      isRead: false,
      iconText: 'block',
      notiLabel: 'The company request has been rejected',
    },
    {
      notiType: 'leave-request',
      isRead: false,
      iconText: 'open_in_browser',
      notiLabel: 'A new leave request received',
    },
    {
      notiType: 'leave-res-y',
      isRead: false,
      iconText: 'done_outline',
      notiLabel: 'A new leave request has been accepted',
    },
    {
      notiType: 'leave-request',
      isRead: false,
      iconText: 'open_in_browser',
      notiLabel: 'A new leave request received',
    },
    {
      notiType: 'leave-request',
      isRead: false,
      iconText: 'open_in_browser',
      notiLabel: 'A new leave request received',
    },
    {
      notiType: 'leave-request',
      isRead: false,
      iconText: 'open_in_browser',
      notiLabel: 'A new leave request received',
    },
  ];

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private _loading: LoadingService
  ) {
    /**
     * 1. 상단 햄버거 매뉴 클릭 시 사이드바가 나옴
     * this.isSideNavOpen()가 true면 실행
     */
    effect(() => {
      console.log('isSideNavOpen() : ', this.isSideNavOpen());
      this.sidenav.open();
    });
  }

  ngOnInit(): void {
    /**
     * 데스크탑 모드가 아닐 경우
     * 햄버거에서 사이드바를 열고 다른 페이지로 이동하면
     * 사이드 바를 자동으로 닫음
     */
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        tap(() => {
          if (!this.isDesktop()) {
            return this.sidenav.close();
          }
          return;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => { });

    // url navigation
    this.router.events
      .pipe(
        distinctUntilChanged(),
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: any) => {
        // 최종 url
        const currentUrl = event.urlAfterRedirects;
        const splittedUrl = currentUrl.split('/');

        // check /company/24 hex length object_id
        this.isSidenavRequired = false;
        if (splittedUrl[1] === 'company' && splittedUrl[2]?.length == 24) {
          console.log('current url>> ', currentUrl);
          this.isSidenavRequired = true;

          console.log(this.companyId, splittedUrl[2]);
          if (this.companyId != splittedUrl[2]) {
            this.companyId = splittedUrl[2];
            console.log('컴퍼니 아이디', this.companyId);
            this.getCompanyInfo();
            this.navigationService.updateNavItems(this.companyId);
          }
        }
      });

    // For browser refresh
    console.log('init url>> ', this.router.url);
    const splittedUrl = this.router.url.split('/');
    if (splittedUrl[1] === 'company' && splittedUrl[2]?.length == 24) {
      this.isSidenavRequired = true;

      console.log(this.companyId, splittedUrl[2]);
      if (this.companyId != splittedUrl[2]) {
        this.companyId = splittedUrl[2];
        console.log('컴퍼니 아이디', this.companyId);
        this.getCompanyInfo();
        this.navigationService.updateNavItems(this.companyId);
      }
    }

    /*-----------------------------------------
        Desktop이 아닌 경우에 대한 side menu 처리.
      ------------------------------------------*/

    // // 1. 상단 햄버거 메뉴 클릭시 sidenav(메뉴) open.
    // // open 상태만 check.
    // const sub1 = this.layoutService.sidenavOpen$.pipe(
    //     filter(open => open === true)
    // ).subscribe((open) => this.sidenav.open());

    /*--------------------------------------------------------------------
      2. Desktop이 아닌 경우, navigation 이동 종료 후 sidenav 자동으로 close
      --> 모바일에서는 상단 버튼 클릭 => 메뉴 open => 페이지이동 => 메뉴 close
      isDeskop$은 behaviour subject를 사용하지 않으므로 withLatestFrom 사용.
      https://rxjs-dev.firebaseapp.com/api/operators/withLatestFrom
    ---------------------------------------------------------------------*/
    // const sub2 = this.router.events.pipe(
    //     filter(event => event instanceof NavigationEnd),
    //     withLatestFrom(this.isDesktop()), // isDesktop$을 같이 참조
    //     filter(([event, isDesktop]) => !isDesktop), // desktop이 아닌 상태에서만 넘어가도록 설정
    // ).subscribe(() => this.sidenav.close());

    // this.subscriptions = new Subscription(); // for unsubscribe
    // this.subscriptions.add(sub1).add(sub2);

    // 처음에는 router event는 안들어옴 (component 생성전?) --> startWith를 이용. url check 가능한 듯.
    // Initial Router Test
    // https://stackoverflow.com/questions/43237318/angular-2-router-event-not-firing-first-time
    // this.router.events
    //   .pipe(
    //     filter((event) => event instanceof NavigationEnd),
    //     startWith(this.router)
    //   )
    //   .subscribe((event: NavigationEnd) => {
    //     // there will be first router.url - and next - router events
    //     console.log(event.url); // .RouterState.snapshot.url

    //   });

    this.listenToLoading();
  }

  getCompanyInfo() {
    this.companyService.getCompanyInfo(this.companyId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.companyInfo = {
          name: res.data.companyName,
          date: res.data.contractDate,
        };
      },
      error: (err: any) => {
        console.log(err.error.message);
      },
    });
  }

  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
    // this.subscriptions.unsubscribe();
  }

  /**
   * Listen to the loadingSub property in the LoadingService class. This drives the
   * display of the loading spinner.
   */
  listenToLoading(): void {
    this._loading.loadingSub
      .pipe(delay(0), takeUntilDestroyed(this.destroyRef)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.isLoadingResults = loading;
      });
  }
}
