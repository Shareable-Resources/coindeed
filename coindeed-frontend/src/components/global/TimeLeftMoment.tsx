/* eslint-disable react-hooks/exhaustive-deps */
import moment from 'moment';
import { useEffect, useState } from 'react';

interface TableTabProps {
  targetDate: any; // timestampe
  lightWhite?: boolean;
}

export const TimeLeftMoment = ({ targetDate, lightWhite = false }: TableTabProps) => {
  const [time, setTime] = useState<String | null>(null);
  const [color, setColor] = useState('text-white');

  const endDate = moment.unix(targetDate);
  const refreshTimer = 1000;

  function getTimer() {
    const diffTime = moment().diff(endDate) * -1;
    if (diffTime > 0) {
      const durationTime = moment.duration(diffTime, 'millisecond');
      const timer: string[] = [];
      const daysLeft = durationTime.asDays();
      if (daysLeft < 1 && daysLeft > 0) {
        setColor('text-moneyRed');
      } else if (daysLeft < 3) {
        setColor('text-moneyGreen');
      } else {
        setColor('text-white');
      }
      const months = durationTime.months();
      const days = durationTime.days();
      const hours = durationTime.hours();
      const minutes = durationTime.minutes();
      const seconds = durationTime.seconds();

      if (months) timer.push(`${months}mo`);
      if (months || days) timer.push(`${days}d`);
      if (months || days || hours) timer.push(`${hours}hr`);
      if (months || days || hours || minutes) timer.push(`${minutes}min`);
      if (months || days || hours || minutes || seconds) timer.push(`${seconds}s`);

      setTime(timer.join(' '));
    } else {
      setTime('Ended');
    }

    if (lightWhite) {
      setColor('text-white-light');
    }
  }

  useEffect(() => {
    getTimer();
    let IntervalTimer: any;

    if (moment().diff(endDate) * -1 > 0) IntervalTimer = setInterval(getTimer, refreshTimer);

    return () => {
      clearInterval(IntervalTimer);
    };
  }, [targetDate]);

  return <div className={`${color}`}>{time || '-'}</div>;
};
