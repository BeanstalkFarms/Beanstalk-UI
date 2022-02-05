import React from 'react';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';
import Snowfall from 'react-snowfall';
import { AppState } from 'state';
import { FallingLeaves } from 'components/Fall';
import { theme } from 'constants/index';
import './index.tsx';
import 'components/Themes/winterApp.css';

function Barn() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

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

  // Show the typical Beanstalk background.
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

  return (
    <Box className="App">
      {/* Barn (bottom left corner) */}
      <Barn />
      {/* "mountain" in background */}
      <Box
        className="BeanstalkMT"
        name={theme.name}
        style={width < 800 ? { left: '0px' } : { left: '280px' }}
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
      {theme.name === 'winter' ? (
        <Snowfall
          snowflakeCount={200}
          speed={[0, 0.5]}
          wind={[-0.5, 0.5]}
          style={{ position: 'fixed' }}
        />
      ) : null}
      {theme.name === 'fall' ? (
        <FallingLeaves />
      ) : null}
      {/* Sun (top left corner) */}
      <img alt="Sun Icon" src={theme.sun} style={sunStyle} />
    </Box>
  );
}
