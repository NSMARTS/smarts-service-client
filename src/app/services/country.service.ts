import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    private baseUrl = environment.apiUrl;
    destroyRef = inject(DestroyRef);
    constructor(
        private http: HttpClient
    ) { }

    getCountries() {
        return this.http.get(this.baseUrl + '/country/countr').pipe(
            takeUntilDestroyed(this.destroyRef), // 컴포넌트가 삭제될때 까지 구독. 삭제되면 메모리를 지운다.
        )
    }
}
