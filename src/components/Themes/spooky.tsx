import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import PumpkinIcon from 'img/dark/pumpkin-dark.svg';
import TombstoneIcon from 'img/dark/tombstone-dark.svg';
import { theme } from 'constants/index';

export default function Spooky(props) {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const itemStyle =
    width > 650
      ? {
          bottom: theme.groundItemHeight,
          height: '5vw',
          left: '80%',
          minHeight: '75px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };
  const rightItemStyle =
    width > 850
      ? {
          bottom: theme.groundItemHeight,
          height: '3vw',
          left: 'calc(80% + 4.4vw)',
          minHeight: '55px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };
  const tombstoneStyle =
    width > 1200
      ? {
          bottom: '44px',
          height: '5vw',
          maxHeight: '100px',
          left: '60%',
          minHeight: '55px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };

  return (
    <>
      <img alt="Tombstone Icon" src={TombstoneIcon} style={tombstoneStyle} />
      <img alt="Pumkpin Icon" src={PumpkinIcon} style={itemStyle} />
      <img alt="Pumkpin Icon" src={PumpkinIcon} style={rightItemStyle} />
      {props.children}
    </>
  );
}
