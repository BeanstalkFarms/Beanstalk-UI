import React from 'react';
import { Box, Grid } from '@mui/material';

type ContentSectionProps = {
  id?: string;
}

const ContentSection : React.FC<ContentSectionProps> = ({ id, children }) => (
  <Box id={id} className="AppContent">
    <Grid
      container
      spacing={3}
      justifyContent="center"
    >
      {children}
    </Grid>
  </Box>
);

export default ContentSection;
