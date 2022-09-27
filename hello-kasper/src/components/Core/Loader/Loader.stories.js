import React, { useState } from 'react';
import Loader from '.';
import Button from '@material-ui/core/Button';

export default {
  title: 'Loader',
  component: Loader,
};

export const Main = (args) => {
  return (
    <Loader {...args}>
      <h2
        style={{
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        Div content
      </h2>
    </Loader>
  );
};

// Default arg values
Main.args = {
  show: false,
  message: 'Loading and please wait...',
  showMessage: true,
};

export const WithoutMessage = () => {
  const [showLoader, setShowLoader] = useState(false);

  const handleShowLoader = () => {
    setShowLoader(true);
    setTimeout(() => {
      setShowLoader(false);
      // setActiveStep(step);
    }, 2000);
  };

  return (
    <>
      <Loader
        show={showLoader}
        message="Loading and please wait..."
        showMessage={false}
      >
        <h2
          style={{
            textAlign: 'center',
            padding: '1rem',
          }}
        >
          Div content
        </h2>
      </Loader>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        onClick={handleShowLoader}
      >
        Show Loader
      </Button>
    </>
  );
};
