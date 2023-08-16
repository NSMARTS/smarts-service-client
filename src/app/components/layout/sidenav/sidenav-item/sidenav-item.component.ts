import { Component, DestroyRef, HostBinding, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { dropdownAnimation } from 'src/app/animations/dropdown.animation';
import { NavigationDropdown, NavigationItem, SidenavViewPolicy } from 'src/app/interfaces/navigation-item.interface';

import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationService } from 'src/app/stores/layout/navigation.service';

@Component({
    selector: 'app-sidenav-item',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, MaterialsModule],
    templateUrl: './sidenav-item.component.html',
    styleUrls: ['./sidenav-item.component.scss'],
    animations: [dropdownAnimation],
})
export class SidenavItemComponent implements OnInit, OnChanges {
    @Input() item!: NavigationItem;
    @Input() level: number = 0;
    @Input() flag!: SidenavViewPolicy;

    isOpen: boolean = false;
    isActive: boolean = false;
    navigationService = inject(NavigationService)
    selectedDropDownItem = this.navigationService.selectedDropDownItem

    destroyRef = inject(DestroyRef);



    isLink = this.navigationService.isLink;
    isDropdown = this.navigationService.isDropdown;
    isSubheading = this.navigationService.isSubheading;
    isCreateSpace = this.navigationService.isCreateSpace;

    // @HostBinding('class')
    // https://angular.io/api/core/HostBinding
    // https://pub.dev/documentation/angular/latest/angular/HostBinding-class.html
    // https://stackoverflow.com/questions/34641281/how-to-add-class-to-host-element
    // host (po-sidenav-item)의 class에 item-level-1... 등의 class 추가 (drop down level)
    // getter를 사용하지 않으면 ngOnchanges에서 따로 level값에 따른 변화를 반영해야함 (여기서는 undefined)
    // https://stackoverflow.com/questions/44923564/conditional-hostbinding-depending-on-input
    @HostBinding('class')
    get levelClass() {
        return `item-level-${this.level}`;
    }
    constructor(
        private router: Router,
        public dialog2: MatDialog,
    ) {

    }

    ngOnInit(): void {
        // console.log('[[ side nav item ]]', this.flag);
        // this.subscription = new Subscription(); // for unsubscribe

        /*-----------------------------------------------------
         * dropdown menu에만 해당되는 subscription으로
         * if 문으로 dropdown인 경우만 subscription 하도록 변경함
        --------------------------------------------------------*/
        if (this.isDropdown(this.item)) {
            /*---------------------------------------
              1. router의 NavigationEnd event catch
              2. 현재 item이 drop down item인지 check
              3. onRouteChange 실행
              현재 menu가 dropdown인 경우만 영향있음.
      
              * 참고: 최초 event는 catch 안됨.
              (https://stackoverflow.com/questions/43237318/angular-2-router-event-not-firing-first-time)
            --------------------------------------------*/
            // const sub1 = this.router.events.pipe(
            //     filter(event => event instanceof NavigationEnd)
            // ).subscribe(() => this.onRouteChange());

            this.router.events.pipe(
                filter(event => event instanceof NavigationEnd),
                tap(() => this.onRouteChange()),
                takeUntilDestroyed(this.destroyRef)
            )


            /*--------------------------------------------
              Drop down menu의 변경 여부 (open <-> closed)
              현재 menu가 dropdown인 경우만 영향있음.
            ----------------------------------------------*/
            // effect(() => this.onOpenChange(this.dropNavItem()))
            // const sub2 = this.navigationService.openChange$.subscribe(item => this.onOpenChange(item));

            // this.subscription.add(sub1)
            // this.subscription.add(sub2);
        }
    }


    /**
    * 현재 메뉴가 Dropdown menu인 경우
    * 클릭시 open <-> close 전환
    */
    toggleOpen() {
        this.isOpen = !this.isOpen;
        this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
        // this.cd.markForCheck(); // --> OnPush
    }

    createSpaceDialog() {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.hasOwnProperty('item') && this.isDropdown(this.item)) { // this.item -> changes.item.currentValue로 해도 됩
            this.onRouteChange();
        }
    }


    /**
        * dropdown state 변경이 발생한 item이 현재 dropdown menu의 child (하위 모두 포함)인가?
        *  --> ok : true 반환
        *  --> no : child의 child에 대해 recursion 수행.
        *
        * @param parent 현재 component에 해당하는  Dropdown menu item
        * @param item state 변경이 일어난 dropdown menu item
        */
    isChildrenOf(parent: NavigationDropdown, item: NavigationDropdown): any {
        if (parent?.children?.indexOf(item) !== -1) {
            console.log(parent?.children?.indexOf(item) !== -1)
            return true;
        }

        // 더 하위 child drop menu에 대한 check 수행.
        return parent?.children
            .filter(child => this.isDropdown(child))
            .some(child => this.isChildrenOf(child as NavigationDropdown, item));
    }

    /**
    * Dropdown [open <-> close] state (openChange$) 전환 발생에 따른 처리.
    * (다른 dropdown menu가 변경된 상태에도 들어옴)
    *
    * state 전환이 발생한 dropdown menu가 현재 자신인지 아닌지 check.
    * - 다른 dropdown 메뉴였다면 내 dropdown 메뉴는 close.
    * - (예외 1) 내 자식 dropdown 메뉴인 경우에는 현재 상태 유지
    * - (예외 2) 내 자식의 링크 중 하나가 active인 경우에는 현재 상태 유지
    * @param item NavigationDropdown
    */
    onOpenChange(item: NavigationDropdown) {

        // Dropdown 상태 변화가 발생한 item이 내 자식 (모든 하위 자식 포함)인 경우
        //   --> 현재 상태에서 변경할 필요 없음
        if (this.isChildrenOf(this.item as NavigationDropdown, item)) {
            return;
        }

        // 내 dropdown menu가 active한 child (Link)를 가지고 있는 경우
        //   --> 현재 상태에서 변경할 필요 없음
        if (this.hasActiveChilds(this.item as NavigationDropdown)) {
            return;
        }

        // 현재 내 dropdown에 대한 변경인 경우
        //   --> 현재 상태에서 변경할 필요 없음
        if (this.item === item) {
            return;
        }

        // 위 조건 통과 후
        // dropdown 상태 변화가 발생한 dropdown item이 내가 아니라면 isOpen = false로 설정
        // * 부모 dropdown이 닫히는 경우 자식도 닫히게 됨
        this.isOpen = false;
        // this.cd.markForCheck();

        // 원본
        // if (this.item !== item) {
        //   this.isOpen = false;
        //   this.cd.markForCheck();
        // }
    }

    onRouteChange() {
        if (this.hasActiveChilds(this.item as NavigationDropdown)) {
            // 내 하위 Menu에 active child가 있는 경우
            this.isActive = true;
            this.isOpen = true;
            this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
            // this.cd.markForCheck(); //--> 필요 없음..?
        } else {
            // 내 하위 Menu에 active child가 없는 경우
            this.isActive = false;
            this.isOpen = false;
            this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
            // this.cd.markForCheck(); //--> 필요 없음..?
        }
    }


    /**
     * 현재 dropdown item의 children 중에 Active한 child가 존재하는지 check
     * @param parent NavigationDropdown
     */
    hasActiveChilds(parent: NavigationDropdown): boolean {
        return parent.children.some((child): any => {
            // drop down menu인 경우 recursive...
            // 현재 2중 dropdown menu는 없으므로 아래 루틴은 진입하지 않음.
            if (this.isDropdown(child)) {
                return this.hasActiveChilds(child);
            }

            if (this.isLink(child)) {
                // https://angular.io/api/router/Router
                // isActive(url: string | UrlTree, exact: boolean): boolean
                // TO CHECK : exact parameter 영향
                return this.router.isActive(child.route as string, false);
            }
        });
    }
}
