import * as dayjs from 'dayjs';

export interface IVacation {
  id?: number;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
}

export class Vacation implements IVacation {
  constructor(public id?: number, public startDate?: dayjs.Dayjs | null, public endDate?: dayjs.Dayjs | null) {}
}

export function getVacationIdentifier(vacation: IVacation): number | undefined {
  return vacation.id;
}
