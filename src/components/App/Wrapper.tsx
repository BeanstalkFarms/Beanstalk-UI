import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { theme } from 'constants/index';
import './index.tsx';
import 'components/Themes/Winter/winterApp.css';

function Barn() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  return (
    <>
      <Box
        className="BeanstalkBG"
        name={theme.name}
      />
      <Box
        className="Barn"
        name={theme.name}
        style={width < 800
          ? { bottom: theme.barnHeight, left: '0px' }
          : { bottom: theme.barnHeight, left: '280px' }
        }
      />
    </>
  );
}

export default function Main() {
  document.body.style.backgroundColor = theme.bodyBackground;
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const sunStyle = {
    height: theme.sunHeight,
    left: width < 800 ? theme.sunLeftPosition : '300px',
    minHeight: '150px',
    position: 'fixed',
    top: 100,
    zIndex: -101,
  };

  const rainbowStyle = {
    width: '125vw',
    left: '-10vw',
    top: 150,
    opacity: '0.2',
    position: 'fixed',
    zIndex: -101,
  };

  return (
    <Box className="App">
      {/* Barn (bottom left corner) */}
      <Barn />
      {/* "mountain" in background */}
      <Box
        className="BeanstalkMT"
        name={theme.name}
        // style={width < 800 ? { left: '0px' } : { left: '280px' }}
      />
      {/* Sky */}
      <Box
        className="BeanstalkSky"
        name={theme.name}
      />
      {/* Effects */}
      {theme.name === 'winterUpgrade' ? (
        <>
          <div id="cloud1" className="cloud-1" />
          <div id="cloud2" className="cloud-2" />
        </>
      ) : null}
      {/* Sun (top left corner) */}
      <img alt="" src={theme.sun} style={sunStyle} />
      {!theme.rainbow ? null : <img alt="" src={theme.rainbow} style={rainbowStyle} />}
    </Box>
  );
}

/* Hiding Flashing lights effect on barn */
// This rotates between 0 and 5 every 1.75s
// to create a "flashing lights" effect on the barn.
// const increment = (c: number) => c % 5 + 1;
// const timer = useRef<number | undefined>();
// const [count, setCount] = useState(increment(1));
// useEffect(() => {
//   if (width > 500 && theme.name === 'winter') {
//     timer.current = window.setInterval(() => {
//       setCount(increment(count));
//     }, 1750);
//     return () => {
//       window.clearInterval(timer.current);
//     };
//   }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [count]);
//
// // Show the winter-themed barn with flashing lights.
// if (theme.name === 'winter') {
//   return (
//     <>
//       <Box
//         className={`BG${count}`}
//         name={theme.name}
//       />
//       <Box
//         className={`B${count}`}
//         name={theme.name}
//         style={width < 800 ? { left: '0px' } : { left: '280px' }}
//       />
//     </>
//   );
// }

/* {theme.name === 'winter' ? (
  <Snowfall
    snowflakeCount={200}
    speed={[0, 0.5]}
    wind={[-0.5, 0.5]}
    style={{ position: 'fixed' }}
  />
) : null} */
