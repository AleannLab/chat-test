import PhoneNumber from 'awesome-phonenumber';
import * as Yup from 'yup';
export const emailValidation = Yup.string()
  .email('Not a proper email address')
  .required('Required');

export const passwordValidation = Yup.string().required('Required');

export const planeNumber = (number) => new PhoneNumber(number, 'US');

export const checkHwNumber = (number) =>
  new RegExp(/([A-Za-z])\w+/g).test(number);
