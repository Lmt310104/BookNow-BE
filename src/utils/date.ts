import * as moment from 'moment';
import { DateFormat } from './constants';

export const formatDate = ({
  date,
  formatSpecification,
  targetFormat,
}: {
  date: Date | string;
  formatSpecification?: string;
  targetFormat: string;
}) => {
  const t = moment(date, formatSpecification);
  return t.format(targetFormat);
};

export function toTimeDate(date: Date): string {
  return formatDate({
    date,
    targetFormat: DateFormat.TIME_DATE,
  });
}

export function toDateTime(date: Date): string {
  return formatDate({
    date,
    targetFormat: DateFormat.DATE_TIME,
  });
}
