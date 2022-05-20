import React from "react";
import { Box } from "@mui/material";
import { BeanstalkPalette } from "components/App/muiTheme";

const AccordionWrapper : React.FC = ({ children }) => (
  // <Box
  //   sx={{
  //     // display: 'inline-block',
  //     p: '2px', // 0.2*10px
  //     // background: `linear-gradient(90deg, rgba(70, 185, 85, 1) 0%, rgba(123, 97, 255, 1) 36.58%, rgba(31, 120, 180, 1) 96.2%);`,
  //     borderRadius: '20px',
  //     'backgroundImage': 'linear-gradient(90deg, rgba(70, 185, 85, 1) 0%, rgba(123, 97, 255, 1) 36.58%, rgba(31, 120, 180, 1) 96.2%)',
  //     'backgroundOrigin': 'border-box',
  //     'backgroundClip': 'content-box, border-box',
  //     overflow: 'hidden'
  //   }}
  // >
  //   <Box sx={{ backgroundColor: 'white' }}>
  //     {children}
  //   </Box>
  // </Box>
  <Box>
    {children}
  </Box>
);

export default AccordionWrapper;