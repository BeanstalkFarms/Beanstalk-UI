export const sleep = (ms: number = 1000) =>
  new Promise<void>((r) =>
    setTimeout(() => {
      r();
    }, ms)
  );

export function timeToString(timeDifference: number) {
  const timeInDays = Math.floor(timeDifference / 86400);
  if (timeInDays > 0) return `${timeInDays} ${timeInDays > 1 ? 'days' : 'day'}`;
  const timeInHours = Math.floor(timeDifference / 3600);
  if (timeInHours > 0) return `${timeInHours} hr`;
  const timeInMinutes = Math.floor(timeDifference / 60);
  if (timeInMinutes > 0) return `${timeInMinutes} min`;

  return `${Math.floor(timeDifference)} sec`;
}

export function timeToStringDetailed(timeDifference: number) {
  const timeInDays = Math.floor(timeDifference / 86400);
  const timeInHours = Math.floor(timeDifference / 3600);
  const timeInMinutes = Math.floor(timeDifference / 60);
  const timeInSeconds = Math.floor(timeDifference);

  if (timeInDays > 0) {
    return `${timeInDays} ${timeInDays > 1 ? 'days' : 'day'}, ${
      timeInHours - timeInDays * 24
    } hr, ${timeInMinutes - timeInHours * 60} min, ${
      timeInSeconds - timeInMinutes * 60
    } sec`;
  }
  if (timeInHours > 0) {
    return `${timeInHours} hr, ${timeInMinutes - timeInHours * 60} min, ${
      timeInSeconds - timeInMinutes * 60
    } sec`;
  }
  if (timeInMinutes > 0) {
    return `${timeInMinutes} min, ${timeInSeconds - timeInMinutes * 60} sec`;
  }

  return `${timeInSeconds} sec`;
}

export const benchmarkStart = (operation: string) => {
  console.log(`LOADING ${operation}`);
  return Date.now();
};

export const benchmarkEnd = (operation: string, startTime: number) => {
  console.log(
    `LOADED ${operation} (${(Date.now() - startTime) / 1e3} seconds)`
  );
};
