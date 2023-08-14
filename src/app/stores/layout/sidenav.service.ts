import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, shareReplay, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SidenavService {

    isDesktop = signal<boolean>(false)
    isSideNavOpen = signal<boolean>(false)
    destroyRef = inject(DestroyRef);

    constructor(
        private breakpointObserver: BreakpointObserver
    ) {
        this.breakpointObserver
            .observe([Breakpoints.Large, Breakpoints.XLarge]) // 현재 1280px 기준
            .pipe(
                tap((state: BreakpointState) => console.log(state.matches)),
                map((state: BreakpointState) =>
                    this.isDesktop.update((prev) => state.matches)),
                shareReplay(), // HTML template 내의 여러 isDesktop$ 호출에 대해 1회만 실행
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe();
    }

    openSidenav() {
        this.isSideNavOpen.set(true);
    }
}
