import React from 'react';
import './FallingLeaves.css';

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export default function FallingLeaves() {
    const width = window.innerWidth;

    function createLeaf() {
      return (<i
        className={`${Math.random() < 0.5 ? 'l1' : 'l2'}`}
        style={
          {
            left: `${getRandomInt(width)}px`,
            animationDuration: `${getRandomInt(40) + 10}s, ${getRandomInt(6) + 3}s`,
            animationDelay: `${getRandomInt(30)}s`,
          }
        }
      />);
    }
    const leaves = Array(Math.floor(width / 30)).fill(0).map(() => createLeaf());

  return (
    <div id="leaves">
      {leaves}
    </div>
  );
}
