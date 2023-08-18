export interface Company {
    _id: string,
    company_code: string, // asdqwe
    company_name: string, // KR
    leave_standard: LeaveStandard[],
    isRollover: boolean, // 휴가 이월을 할껀지 말껀지,
    rollover_max_month: number, // 이월된 휴가가 언제까지 사용할껀지 ex) 남은 휴가 3달 더 보관가능
    rollover_max_day: number, // 휴가 이월이 며칠까지 될건지 ex) 남은 휴가 최대 5일 보관가능
    isReplacementDay: boolean, // 대체 휴가를 할껀지 말껀지
    rd_validity_term: number, // 대체 휴가 유효기간. 대체휴가가 생겼을 시 며칠안에 쓸껀지 기록
    annual_policy: string, // 'byYear' 은 1월 1일 기준으로 휴가가 생김. 'byContract' 입사일 기준으로 휴가가 생김
    isMinusAnnualLeave: boolean, // 마이너스 연차
    company_holiday: CompanyHoliday[]
}

export const InitialCompany: Company = {
    _id: '',
    company_code: '',
    company_name: '',
    leave_standard: [],
    isRollover: false,
    rollover_max_month: 0,
    rollover_max_day: 0, // 휴가 이월이 며칠까지 될건지 ex) 남은 휴가 최대 5일 보관가능
    isReplacementDay: false, // 대체 휴가를 할껀지 말껀지
    rd_validity_term: 0, // 대체 휴가 유효기간. 대체휴가가 생겼을 시 며칠안에 쓸껀지 기록
    annual_policy: 'byContract', // 'byYear' 은 1월 1일 기준으로 휴가가 생김. 'byContract' 입사일 기준으로 휴가가 생김
    isMinusAnnualLeave: false, // 마이너스 연차 
    company_holiday: []
}

/**
 * 연차정책 1년차엔 휴가가 몇개 병가는 몇개 등등...
 */
interface LeaveStandard {
    year: number, // 1년차 , 2년차 , 3년차...
    annual_leave: number, // "YYYY-MM-DD"
    sick_leave: number,
}

/**
 * 회사 공휴일 ex) 창립기념일
 */
interface CompanyHoliday {
    ch_name: string,
    ch_date: string, // "YYYY-MM-DD"
}