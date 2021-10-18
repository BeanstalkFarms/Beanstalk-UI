
export function timeToString(timeDifference) {
  const timeInDays = Math.floor(timeDifference / 86400)
  if (timeInDays > 0) return `${timeInDays} days`
  const timeInHours = Math.floor(timeDifference / 3600)
  if (timeInHours > 0) return `${timeInHours} hr`
  const timeInMinutes = Math.floor(timeDifference / 60)
  if (timeInMinutes > 0) return `${timeInMinutes} min`
  return `${Math.floor(timeDifference)} sec`

}

export function timeToStringDetailed(timeDifference) {
  const timeInDays = Math.floor(timeDifference / 86400)
  const timeInHours = Math.floor(timeDifference / 3600)
  const timeInMinutes = Math.floor(timeDifference / 60)
  const timeInSeconds = Math.floor(timeDifference)

  if (timeInDays > 0) {
    return `${timeInDays} days, ${timeInHours - timeInDays * 24} hr, ${timeInMinutes - timeInHours * 60} min, ${timeInSeconds - timeInMinutes * 60} sec`
  }
  if (timeInHours > 0) {
    return `${timeInHours} hr, ${timeInMinutes - timeInHours * 60} min, ${timeInSeconds - timeInMinutes * 60} sec`
  }
  if (timeInMinutes > 0) {
    return `${timeInMinutes} min, ${timeInSeconds - timeInMinutes * 60} sec`
  }
  return `${timeInSeconds} sec`
}
