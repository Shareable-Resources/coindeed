import { differenceInSeconds, addSeconds } from 'date-fns';
import { useEffect, useState } from 'react';
interface TimeLeftProps {
  endsAt: Date;
}

const serverTime = new Date();
serverTime.setMinutes(serverTime.getMinutes() + 3);
const clientTime = new Date();
const delta = differenceInSeconds(serverTime, clientTime);

function formatTimeLeft(timeLeftInSeconds: number) {
  const days = Math.floor(timeLeftInSeconds / 86400);
  const hours = Math.floor((timeLeftInSeconds % 86400) / 3600);
  const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
  const seconds = Math.floor(timeLeftInSeconds % 60);
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

export const TimeLeft = ({ endsAt }: TimeLeftProps) => {
  const [timeLeft, setTimeLeft] = useState(0);
  // const [color] = useState('');
  const [color, setColor] = useState('text-moneyGreen');

  useEffect(() => {
    // console.log('use effect')
    let interval: ReturnType<typeof setInterval> | null = null;

    function timer() {
      const calculatedServerTime = addSeconds(new Date(), delta);

      const timeLeft = differenceInSeconds(endsAt, calculatedServerTime);
      setTimeLeft(timeLeft);
      if (timeLeft <= 0) {
        setColor('text-white');
      } else if (timeLeft < 3600) {
        setColor('text-moneyRed');
      } else if (timeLeft < 86400) {
        setColor('text-moneyYellow');
      } else {
        setColor('text-moneyGreen');
      }
    }
    timer();
    interval = setInterval(timer, 500);

    // if (timeLeft < 60 * 60 * 24 && timeLeft > 0) {
    //   if (!interval) {
    //   }
    // } else {
    //   interval && clearInterval(interval);
    // }

    return function cleanup() {
      // console.log('cleanup')
      interval && clearInterval(interval);
    };
  }, [timeLeft, endsAt]);

  return <div className={color}>{timeLeft > 0 ? formatTimeLeft(timeLeft) : '-'}</div>;
};
