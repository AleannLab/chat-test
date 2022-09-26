import React from 'react';
import { Box, Typography } from '@material-ui/core';

const TabHeader = ({ title, children }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      marginBottom={1.5}
    >
      <Typography variant="h3" color="textPrimary">
        {title}
      </Typography>
      {children}
    </Box>
  );
};

export default TabHeader;
