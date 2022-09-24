import React from 'react';
import OuterLayout from 'layouts/LayoutOuter';
import ForgotPasswordForm from 'components/Auth/FormForgotPassword';

export default function ForgotPassword() {
  return <OuterLayout Content={ForgotPasswordForm} />;
}
