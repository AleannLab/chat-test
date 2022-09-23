import React from 'react';
import { Form } from '@formio/react';
import '../Styles/index.css';
import MedicalFormJson from './MedicalForm';

// import "formiojs/dist/formio.builder.css";

export default function MedicalHistoryForm() {
  return <Form src={MedicalFormJson} onSubmit={console.log} />;
}
