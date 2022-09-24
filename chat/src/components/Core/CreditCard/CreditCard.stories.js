import React from 'react';
import CreditCard from '.';
import { Grid } from '@material-ui/core';

export default {
  title: 'Credit Card',
  component: CreditCard,
};

export const Main = (args) => {
  return <CreditCard {...args} />;
};

// Default arg values
Main.args = {
  name: 'Rishi V',
  number: '4111 1111 1111 1111',
  expiry: '10/20',
  cvc: '242',
  preview: true,
};

export const Masked = () => {
  return (
    <CreditCard
      name="Rishi V"
      number="**** **** **** 1111"
      expiry="10/20"
      cvc="242"
      preview={true}
      issuer="mastercard"
    />
  );
};

export const SupportedCards = () => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={4}>
        <CreditCard
          name="Rishi V"
          number="5555 4444 3333 1111"
          expiry="10/20"
          cvc="737"
        />
      </Grid>

      <Grid item xs={4}>
        <CreditCard
          name="Rishi V"
          number="4111 1111 1111 1111"
          expiry="10/20"
          cvc="737"
        />
      </Grid>

      <Grid item xs={4}>
        <CreditCard
          name="Rishi V"
          number="3700 0000 0000 002"
          expiry="10/20"
          cvc="737"
        />
      </Grid>

      <Grid item xs={4}>
        <CreditCard
          name="Rishi V"
          number="3600 666633 3344"
          expiry="10/20"
          cvc="737"
        />
      </Grid>

      <Grid item xs={4}>
        <CreditCard
          name="Rishi V"
          number="6011 6011 6011 6611"
          expiry="10/20"
          cvc="737"
        />
      </Grid>

      <Grid item xs={4}>
        <CreditCard
          name="Rishi V"
          number="5066 9911 1111 1118"
          expiry="10/20"
          cvc="737"
        />
      </Grid>

      <Grid item xs={4}>
        <CreditCard
          name="Rishi V"
          number="6250 9460 0000 0016"
          expiry="10/20"
          cvc="737"
        />
      </Grid>

      <Grid item xs={4}>
        <CreditCard
          name="Rishi V"
          number="6062 8288 8866 6688"
          expiry="10/20"
          cvc="737"
        />
      </Grid>
    </Grid>
  );
};
