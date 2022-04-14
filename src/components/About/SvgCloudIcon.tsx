import React, { FC } from 'react';
import { theme } from 'constants/index';

interface SvgCloudIconProps {
    height?: string;
    width?: string;
    text?: string;
}

const SvgCloudIcon: FC<SvgCloudIconProps> = ({
  height = window.innerWidth > 600 ? '200px' : '150px',
  width = window.innerWidth > 600 ? '200px' : '150px',
  text = '',
  ...props
}) => (
  <button {...props}>Test</button>
  // <div 
  // <svg
  //   xmlns="http://www.w3.org/2000/svg"
  //   width={width}
  //   height={height}
  //   viewBox="0 0 420 450"
  //   fill="none"
  //   preserveAspectRatio="none"
  //   {...props}
  // >
  //   <path
  //     d="M343.454,170.099c0.01-0.583,0.022-1.165,0.022-1.75c0-55.728-45.177-100.905-100.905-100.905c-48.025,0-88.209,33.551-98.403,78.492c-9.505-5.321-20.454-8.368-32.122-8.368c-36.407,0-65.92,29.514-65.92,65.92c0,1.488,0.067,2.959,0.164,4.423C19.262,217.944,0,243.959,0,274.479c0,39.207,31.784,70.991,70.991,70.991h253.183c49.009,0,88.739-39.73,88.739-88.739C412.913,214.343,383.192,178.903,343.454,170.099z"
  //     fill={theme.cloudColor}
  //   />
  //   <path
  //     d="M344.267 268.232L371.449 248.232L344.267 228.232"
  //     stroke="#627264"
  //     strokeWidth="2"
  //   />
  //   <text
  //     x="205px"
  //     y="259px"
  //     textAnchor="middle"
  //     height={height}
  //     width={width}
  //     fontFamily="Futura-PT-Book"
  //     fontSize="35"
  //     fill="black"
  //   >
  //     {text}
  //   </text>
  // </svg>
);

export default SvgCloudIcon;
