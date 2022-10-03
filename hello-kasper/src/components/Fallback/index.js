import React, { useCallback } from "react";
import { Box, Button, Typography } from "@material-ui/core";
// import  ErrorIcon  from 'assets/images/coffee-spill.svg';

export default function Fallback({ error = "", resetError }) {
  const reset = useCallback(() => {
    resetError && typeof resetError === "function"
      ? resetError()
      : window.location.reload();
  }, [resetError]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      flexDirection="column"
    >
      {/* <ErrorIcon width="20rem" height="20rem" className="mb-4" /> */}
      <Typography variant="h4" color="primary">
        Oops! Something went wrong
      </Typography>
      <Typography variant="body1" color="primary">
        {error.toString()}
      </Typography>
      <Button
        onClick={reset}
        variant="contained"
        color="secondary"
        className="mt-4"
      >
        Click here to reset
      </Button>
    </Box>
  );
}
