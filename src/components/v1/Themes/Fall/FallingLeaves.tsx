import React from 'react';
import './FallingLeaves.css';

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export default function FallingLeaves() {
    const width = window.innerWidth;

    function createLeaf(i: number) {
      return (<i
        key={`${i}`}
        className={`${Math.random() < 0.5 ? 'l1' : 'l2'}`}
        style={
          {
            left: `${getRandomInt(width)}px`,
            animationDuration: `${getRandomInt(60) + 10}s, ${getRandomInt(10) + 3}s`,
            animationDelay: `${getRandomInt(30)}s`,
          }
        }
      />);
    }
    const leaves = Array(Math.floor(width / 50)).fill(0).map((_, i) => createLeaf(i));

  return (
    <div id="leaves">
      {leaves}
    </div>
  );
}
