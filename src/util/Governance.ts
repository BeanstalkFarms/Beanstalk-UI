/**
 * Formats date messages for governance proposals.
 */
export const getDateMessage = (end: number) => {
  /// Dates
  let dateMessage;
  const today = new Date();
  const endDate = new Date(end * 1000);

  /// Calculations
  const differenceInTime = endDate.getTime() - today.getTime();
  const differenceInHours = differenceInTime / 36e5;
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  today.setHours(0, 0, 0, 0);

  // date is in the future
  if (differenceInHours > 0) {
    if (differenceInHours <= 1) {
      // less than one hour away
      dateMessage = `Vote ends in ${Math.round(differenceInHours * 60)} minutes`;
    } else if (Math.round(differenceInHours) === 1) {
      // exactly one hour away
      dateMessage = `Vote ends in ${Math.round(differenceInHours)} hour`;
    } else if (differenceInHours > 1 && differenceInHours <= 24) {
      // less than one day away
      dateMessage = `Vote ends in ${Math.round(differenceInHours)} hours`;
    } else if (differenceInHours > 24 && differenceInDays <= 7) {
      // less than one week away
      dateMessage = `Vote ends in ${Math.round(differenceInDays)} days`;
    } else if (differenceInDays > 7) {
      // greater than one week away
      dateMessage = `Vote ends on ${endDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}`;
    }
  } else {
    // in the past
    dateMessage = `Vote ended on ${endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}`;
  }

  return dateMessage;
};
