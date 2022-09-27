import React from 'react';
import OuterLayout from 'layouts/LayoutOuter';
import FormResetForgotPassword from 'components/Auth/FormResetForgotPassword';

export default function ResetForgotPassword() {
  return <OuterLayout Content={FormResetForgotPassword} />;
}
