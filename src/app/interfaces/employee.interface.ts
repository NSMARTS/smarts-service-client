import { Company } from 'src/app/interfaces/company.interface';
export interface Employee {
  _id: string,
  email: string, // 이메일
  username: string, // 사용자 이름
  year: number,
  profileImgPath: string,
  empStartDate: Date | string, // 계약 시작일
  empEndDate: Date | string, // 계약 끝나는 날
  company: Company,
  country: Country,
  usedLeave: UsedLeave,
  isRetired: boolean,
  department: boolean,
  isManager: boolean,
  personalLeave: Company, // 개인이 가지고 있는 휴가정책. 컴퍼니의 연차정책 타입이 같다
}

// 사용한 휴가
export interface UsedLeave {
  entitlement: number, // 갖고 있던 연차 휴가 갯수
  takenEntiltement: number, // 연차 휴가 사용 횟수
  rollover: number, // 갖고 있던 이월 휴가 갯수
  takenRollover: number, // 이월 휴가 사용 횟수
  replacementDay: number, // 갖고 있던 대체 휴가 갯수
  takenReplacementDay: number, // 대체 휴가 사용 횟수
  profileImgPath: string // 프로필 이미지 경로
}

// 사용한 휴가
export interface Country {
  _id: string,
  countryName: string,
  countryCode: string,
  countryHoliday: CountryHoliday[]
}
export interface CountryHoliday {
  holidayName: string,
  holidayDate: string,
}


