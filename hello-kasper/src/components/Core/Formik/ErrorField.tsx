import React from 'react';
import { ErrorMessage } from 'formik';

const ErrorField = ({ fieldName }) => <ErrorMessage name={fieldName} />;

export default ErrorField;
