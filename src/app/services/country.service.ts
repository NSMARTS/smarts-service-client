import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Country } from 'src/app/interfaces/employee.interface';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private baseUrl = environment.apiUrl;
  destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient) {}

  // 나라 등록
  addCountry(countryData: any) {
    return this.http
      .post(this.baseUrl + '/countries', countryData)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  // 나라 목록 불러오기
  getCountryList(): Observable<HttpResMsg<Country[]>> {
    return this.http
      .get<HttpResMsg<Country[]>>(this.baseUrl + '/countries')
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  /***
   * 서버에 id 값을 api에 담아 요청할땐 두가지 방식이 있다.
   * HTTP params가 있고 Query params 가 있다.
   * 가끔 주소창을 보면 ?id=aasdfadf 이렇게 되어있는걸 볼 수 있는데
   * 이 방식이 Query params 이다.
   * 이때 서버에서 id 값을 확인하려면 req.query
   */
  // deleteCountry(countryId: any) {
  //   return this.http.delete(this.baseUrl + '/country', {
  //     params: {'id':countryId},
  //   });
  // }

  /***
   * 서버에 id 값을 api에 담아 요청할땐 두가지 방식이 있다.
   * HTTP params가 있고 Query params 가 있다.
   * 가끔 주소창을 보면 그냥 주소 바로 옆에 아이디 값을 넣어주면 된다.
   * country/country/dfasdfasdf
   * 이 방식이 HTTP params 이다.
   * 이때 서버에서 id 값을 확인하려면 req.params
   */
  deleteCountry(countryId: any) {
    return this.http.delete(this.baseUrl + '/countries/' + countryId);
  }

  // 나라 정보 가져오기
  getCountryInfo(data: any) {
    // console.log(data.countryId);
    return this.http.get(this.baseUrl + '/countries/holiday/' + data.countryId);
  }

  // 나라별 공휴일 추가
  addCountryHoliday(countryHolidayData: any) {
    // console.log(countryHolidayData);
    return this.http.post(
      this.baseUrl + '/countries/holiday/' + countryHolidayData._id,
      countryHolidayData
    );
  }

  // 나라별 공휴일 삭제
  deleteCountryHoliday(data: any) {
    // console.log(data);
    return this.http.delete(
      this.baseUrl + '/countries/holiday/' + data.countryId
    );
  }
}
