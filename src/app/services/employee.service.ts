import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EmployeeTakenVacation } from '../interfaces/employee.interface';
import { Observable, catchError, shareReplay, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private baseUrl = environment.apiUrl;
    destroyRef = inject(DestroyRef);
    employees = signal<EmployeeTakenVacation[]>([])
    constructor(
        private http: HttpClient
    ) { }

    getEmployees(id: string) {
        return this.http.get<EmployeeTakenVacation[]>(this.baseUrl + '/employee/employees').pipe(
            tap(data => this.employees.set(data)),
            takeUntilDestroyed(this.destroyRef), // 컴포넌트가 삭제될때 까지 구독. 삭제되면 메모리를 지운다.
            shareReplay(1), // 데이터 캐싱
            catchError(this.handleError)
        )
    }

    getEmployee(id: string) {
        return this.http.get<EmployeeTakenVacation[]>(this.baseUrl + '/employee/employees/' + id).pipe(
            tap(data => this.employees.set(data)),
            takeUntilDestroyed(this.destroyRef), // 컴포넌트가 삭제될때 까지 구독. 삭제되면 메모리를 지운다.
            shareReplay(1), // 데이터 캐싱
            catchError(this.handleError)
        )
    }

    // 나중에 타입 추가
    createEmployee(data: any) {
        return this.http.post<EmployeeTakenVacation[]>(this.baseUrl + '/employee/employees', data).pipe(takeUntilDestroyed(this.destroyRef))
    }

    // 나중에 타입 추가
    updateEmployee(id: string, data: any) {
        return this.http.patch<EmployeeTakenVacation[]>(this.baseUrl + '/employee/employees/' + id, data)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe()
    }

    // 나중에 타입 추가
    retireEmployee(id: string, data: any) {
        return this.http.delete<EmployeeTakenVacation[]>(this.baseUrl + '/employee/employees/' + id, data)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe()
    }


    private handleError(err: HttpErrorResponse): Observable<never> {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        let errorMessage = '';

        if (err.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            errorMessage = `An error occurred: ${err.error.message}`;
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            errorMessage = `Server returned code: ${err.status}, error message is: ${err.message
                }`;
        }
        console.error(err);
        return throwError(() => err);
    }
}
