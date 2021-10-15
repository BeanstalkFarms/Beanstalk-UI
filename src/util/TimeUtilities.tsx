export function timeToString(timeDifference) {
  const timeInDays = Math.floor(timeDifference / 86400);
  if (timeInDays > 0) return `${timeInDays} days`;
  const timeInHours = Math.floor(timeDifference / 3600);
  if (timeInHours > 0) return `${timeInHours} hr`;
  const timeInMinutes = Math.floor(timeDifference / 60);
  if (timeInMinutes > 0) return `${timeInMinutes} min`;
  return `${Math.floor(timeDifference)} sec`;
}
