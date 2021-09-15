import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as dayjs from 'dayjs';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IVacation, Vacation } from '../vacation.model';

import { VacationService } from './vacation.service';

describe('Service Tests', () => {
  describe('Vacation Service', () => {
    let service: VacationService;
    let httpMock: HttpTestingController;
    let elemDefault: IVacation;
    let expectedResult: IVacation | IVacation[] | boolean | null;
    let currentDate: dayjs.Dayjs;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
      expectedResult = null;
      service = TestBed.inject(VacationService);
      httpMock = TestBed.inject(HttpTestingController);
      currentDate = dayjs();

      elemDefault = {
        id: 0,
        startDate: currentDate,
        endDate: currentDate,
      };
    });

    describe('Service methods', () => {
      it('should find an element', () => {
        const returnedFromService = Object.assign(
          {
            startDate: currentDate.format(DATE_TIME_FORMAT),
            endDate: currentDate.format(DATE_TIME_FORMAT),
          },
          elemDefault
        );

        service.find(123).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(elemDefault);
      });

      it('should create a Vacation', () => {
        const returnedFromService = Object.assign(
          {
            id: 0,
            startDate: currentDate.format(DATE_TIME_FORMAT),
            endDate: currentDate.format(DATE_TIME_FORMAT),
          },
          elemDefault
        );

        const expected = Object.assign(
          {
            startDate: currentDate,
            endDate: currentDate,
          },
          returnedFromService
        );

        service.create(new Vacation()).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'POST' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should update a Vacation', () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            startDate: currentDate.format(DATE_TIME_FORMAT),
            endDate: currentDate.format(DATE_TIME_FORMAT),
          },
          elemDefault
        );

        const expected = Object.assign(
          {
            startDate: currentDate,
            endDate: currentDate,
          },
          returnedFromService
        );

        service.update(expected).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PUT' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should partial update a Vacation', () => {
        const patchObject = Object.assign(
          {
            startDate: currentDate.format(DATE_TIME_FORMAT),
          },
          new Vacation()
        );

        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = Object.assign(
          {
            startDate: currentDate,
            endDate: currentDate,
          },
          returnedFromService
        );

        service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PATCH' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should return a list of Vacation', () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            startDate: currentDate.format(DATE_TIME_FORMAT),
            endDate: currentDate.format(DATE_TIME_FORMAT),
          },
          elemDefault
        );

        const expected = Object.assign(
          {
            startDate: currentDate,
            endDate: currentDate,
          },
          returnedFromService
        );

        service.query().subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush([returnedFromService]);
        httpMock.verify();
        expect(expectedResult).toContainEqual(expected);
      });

      it('should delete a Vacation', () => {
        service.delete(123).subscribe(resp => (expectedResult = resp.ok));

        const req = httpMock.expectOne({ method: 'DELETE' });
        req.flush({ status: 200 });
        expect(expectedResult);
      });

      describe('addVacationToCollectionIfMissing', () => {
        it('should add a Vacation to an empty array', () => {
          const vacation: IVacation = { id: 123 };
          expectedResult = service.addVacationToCollectionIfMissing([], vacation);
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(vacation);
        });

        it('should not add a Vacation to an array that contains it', () => {
          const vacation: IVacation = { id: 123 };
          const vacationCollection: IVacation[] = [
            {
              ...vacation,
            },
            { id: 456 },
          ];
          expectedResult = service.addVacationToCollectionIfMissing(vacationCollection, vacation);
          expect(expectedResult).toHaveLength(2);
        });

        it("should add a Vacation to an array that doesn't contain it", () => {
          const vacation: IVacation = { id: 123 };
          const vacationCollection: IVacation[] = [{ id: 456 }];
          expectedResult = service.addVacationToCollectionIfMissing(vacationCollection, vacation);
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(vacation);
        });

        it('should add only unique Vacation to an array', () => {
          const vacationArray: IVacation[] = [{ id: 123 }, { id: 456 }, { id: 33952 }];
          const vacationCollection: IVacation[] = [{ id: 123 }];
          expectedResult = service.addVacationToCollectionIfMissing(vacationCollection, ...vacationArray);
          expect(expectedResult).toHaveLength(3);
        });

        it('should accept varargs', () => {
          const vacation: IVacation = { id: 123 };
          const vacation2: IVacation = { id: 456 };
          expectedResult = service.addVacationToCollectionIfMissing([], vacation, vacation2);
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(vacation);
          expect(expectedResult).toContain(vacation2);
        });

        it('should accept null and undefined values', () => {
          const vacation: IVacation = { id: 123 };
          expectedResult = service.addVacationToCollectionIfMissing([], null, vacation, undefined);
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(vacation);
        });

        it('should return initial array if no Vacation is added', () => {
          const vacationCollection: IVacation[] = [{ id: 123 }];
          expectedResult = service.addVacationToCollectionIfMissing(vacationCollection, undefined, null);
          expect(expectedResult).toEqual(vacationCollection);
        });
      });
    });

    afterEach(() => {
      httpMock.verify();
    });
  });
});
