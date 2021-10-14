import React, { useEffect, useState, useRef } from 'react'
import { HeaderLabelWithTimer } from '../Common'
import { timeToString } from '../../util'

export default function LastCrossTimer(props) {

  const timeSinceCross = () => {
    if (props.lastCross === 0) return 0
    return Date.now() / 1e3 - props.lastCross
  }

  const timer = useRef()
  const [time, setTime] = useState(timeSinceCross())

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setTime(timeSinceCross())
    }, 1000)
    return () => {
      window.clearInterval(timer.current)
    }
  }, [time, props.lastCross])

  function display(time) {
    return [
      'Time Since $1 Crossed',
      time === 0 ? '-' : timeToString(time),
      'This is the time elapsed since the price last crossed the peg.'
    ]
  }

  return (
    <HeaderLabelWithTimer display={display} time={time} />
  )
}
