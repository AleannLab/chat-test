import React from 'react';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import PropTypes from 'prop-types';

export default function CreditCard(props) {
  return <Cards {...props} />;
}

CreditCard.propTypes = {
  /** Name on card. */
  name: PropTypes.string.isRequired,
  /** Card number. */
  number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** Card expiry date. `10/20` or `012017` */
  expiry: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** Card CVC/CVV. */
  cvc: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** Focused card field. */
  focused: PropTypes.oneOf(['name', 'number', 'expiry', 'cvc']),
  /** Localization text (e.g. `{ valid: 'valid thru' }`). */
  locale: PropTypes.shape({
    valid: PropTypes.string,
  }),
  /** Placeholder text (e.g. `{ name: 'YOUR NAME HERE' }`). */
  placeholders: PropTypes.objectOf(PropTypes.string),
  /** To use the card to show scrambled data (e.g. `**** 4567`). */
  preview: PropTypes.bool,
  /** Set the issuer for the preview mode (e.g. `visa|mastercard|...`). */
  issuer: PropTypes.oneOf([
    'mastercard',
    'visa',
    'amex',
    'dinersclub',
    'discover',
    'elo',
    'unionpay',
    'hipercard',
  ]),
  /** If you want to limit the accepted cards (e.g. `['visa', 'mastercard']`. */
  acceptedCards: PropTypes.arrayOf(PropTypes.string),
  /** A callback function that will be called when the card number has changed with 2 parameters: `type ({ issuer: 'visa', maxLength: 19 }), isValid ({boolean})` */
  callback: PropTypes.func,
};

// CreditCard.defaultProps = {
//     defaultDisabled: false,
//     enableRipple: true,
// };
