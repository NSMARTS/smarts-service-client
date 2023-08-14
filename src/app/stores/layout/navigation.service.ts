import { Injectable, signal } from '@angular/core';
import { sidenavRouteInfo } from 'src/app/config/sidenav-route-info';
import { NavigationCreatSpace, NavigationDropdown, NavigationItem, NavigationLink, NavigationSubheading } from 'src/app/interfaces/navigation-item.interface';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    navItems = signal<NavigationItem[]>(sidenavRouteInfo);

    // as 문법은 타입스크립트 문법으로 타입을 추가해준다.
    // item 같은 경우 NavigationDropdown 값만 받는데
    // signal 값을 초기화 하기위해 값을 넣어야하나
    // 넣을 값이 없어 as 로 빈 배열에 강제로 타입을 추가했다.
    // 이렇게 하면 안되는데 해결법을 몰라 어쩔 수 없이 했다.
    // item을 쓰는 함수에는 전부 타입 체크를 하니 에러는
    // 나지 않을 것이다.
    selectedDropDownItem = signal<NavigationDropdown>({} as NavigationDropdown)
    constructor() { }

    triggerOpenChange(item: NavigationDropdown) {
        this.selectedDropDownItem.set(item)
    }

    /**
   * 현재 Menu가 Link에 해당하는지 check
   * @param item Navigation Item
   */
    isLink(item: NavigationItem): item is NavigationLink {
        return item.type === 'link';
    }

    /**
     * 현재 menu가 dropdown menu인지 check
     * @param item Navigation Item
     */
    isDropdown(item: NavigationItem): item is NavigationDropdown {
        return item.type === 'dropdown';
    }

    /**
     * 현재 menu가 Subheading인지 check
     * @param item Navigation Item
     */
    isSubheading(item: NavigationItem): item is NavigationSubheading {
        return item.type === 'subheading';
    }

    /**
     * 현재 menu가 Subheading인지 check
     * @param item Navigation Item
     */
    isCreateSpace(item: NavigationItem): item is NavigationCreatSpace {
        return item.type === 'click';
    }
}
