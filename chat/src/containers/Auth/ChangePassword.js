import React from 'react';
import OuterLayout from 'layouts/LayoutOuter';
import ChangePasswordForm from 'components/Auth/FormChangePassword';

export default function ChangePassword() {
  return <OuterLayout Content={ChangePasswordForm} />;
}
