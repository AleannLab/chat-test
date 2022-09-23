import React, { useEffect, useState, useRef, createRef } from 'react';
import Grid from '@material-ui/core/Grid';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Scrollbars } from 'react-custom-scrollbars';
import Divider from '@material-ui/core/Divider';
import moment from 'moment';
import { observer } from 'mobx-react';
import html2pdf from 'html2pdf.js';

import FormNamesSkeleton from './FormNamesSkeleton';
import Checkbox from 'components/Core/Checkbox';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';

const FormData = () => {
  const [selectedForm, setSelectedForm] = useState('');
  const { patientData, notification } = useStores();
  const [elRefs, setElRefs] = useState([]);
  const [formRefs, setFormRefs] = useState([]);
  const ref = useRef();
  const appendRef = useRef();

  useEffect(() => {
    if (patientData.selectAll) {
      patientData.allFormsData.forEach((data) => {
        data.isSelected = true;
      });
    } else if (!patientData.isIncompleteSelected && !patientData.selectAll) {
      patientData.allFormsData.forEach((data) => {
        data.isSelected = false;
      });
    }
  }, [patientData.selectAll]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (patientData.allFormsData.length > 0) {
      setElRefs((elRefs) =>
        Array(patientData.allFormsData.length)
          .fill()
          .map((_, i) => elRefs[i] || createRef()),
      );

      setFormRefs((formRefs) =>
        Array(patientData.allFormsData.length)
          .fill()
          .map((_, i) => formRefs[i] || createRef()),
      );
    }
  }, [patientData.allFormsData.length]);

  useEffect(() => {
    if (patientData.isPrintingSection) {
      let emptyCount = 0;
      let refIds = [];
      patientData.allFormsData.forEach((form, i) => {
        if (form.isSelected === false) {
          emptyCount += 1;
        } else {
          refIds.push(i);
        }
      });
      if (emptyCount === patientData.allFormsData.length) {
        notification.showError('Select at least one form');
      } else {
        notification.showInfo('Generating PDF');
        const opt = {
          margin: [0, 6],
          pagebreak: {
            mode: ['avoid-all', 'css', 'legacy'],
          },
          filename: 'pd1.pdf',
          image: { type: 'png' },
          html2canvas: { scale: 1 },
        };
        const worker = new html2pdf.Worker();
        refIds.forEach((id) => {
          let ele = formRefs[id].current.cloneNode(true);
          appendRef.current.appendChild(ele);
        });
        worker
          .set(opt)
          .from(appendRef.current)
          .save()
          .then(() => {
            notification.hideNotification();
          });
      }
    }
    if (patientData.isPrintingCompleteForm) {
      if (patientData.emptyFormData) {
        notification.showError('Form data is empty');
      } else {
        notification.showInfo('Generating PDF');
        const opt = {
          margin: 6,
          filename: 'pd1.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { dpi: 192, scale: 2, letterRendering: true },
          jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
        };
        const worker = new html2pdf.Worker();
        worker
          .set(opt)
          .from(ref.current)
          .save()
          .then(() => {
            notification.hideNotification();
          });
      }
    }
    patientData.setIsPrintingCompleteForm(false);
    patientData.setIsPrintingSection(false);
  }, [patientData.isPrintingCompleteForm, patientData.isPrintingSection]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToElement = (i) => {
    elRefs[i].current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleFormSelect = (formKey) => {
    patientData.selectForm(formKey);
    const count = patientData.formSelectCount();
    if (count === patientData.allFormsData.length) {
      patientData.toggleIsIncompleteSelected(false);
      patientData.toggleSelectAll(true);
    }
    if (patientData.selectAll && count < patientData.allFormsData.length) {
      patientData.toggleIsIncompleteSelected(true);
      patientData.toggleSelectAll(false);
    }
  };

  return (
    <Grid container style={{ height: '479px', padding: '1rem 2.5rem' }}>
      <Grid item xs={12} sm={3}>
        <Scrollbars renderTrackHorizontal={(props) => <div {...props} />}>
          {patientData.allFormsData.length > 0 && !patientData.emptyFormData ? (
            patientData.allFormsData.map((formItem, i) => (
              <div
                key={formItem.formkey}
                className={
                  selectedForm === formItem.formKey
                    ? styles.formNameContainerSelected
                    : styles.formNameContainerUnselected
                }
              >
                <span
                  className={styles.formName}
                  onClick={() => {
                    setSelectedForm(formItem.formKey);
                    scrollToElement(i);
                  }}
                >
                  {formItem.name}
                </span>
              </div>
            ))
          ) : patientData.emptyFormData ? (
            <span className={styles.emptyFormNames}>Empty</span>
          ) : (
            <div>
              <FormNamesSkeleton count={6} />
            </div>
          )}
        </Scrollbars>
      </Grid>
      <Grid item xs={12} sm={9}>
        <Scrollbars
          style={{ marginLeft: '1rem' }}
          renderTrackHorizontal={(props) => <div {...props} />}
        >
          <Grid
            container
            className="ps-1 pe-3"
            style={{ marginTop: '-1rem' }}
            ref={ref}
          >
            {patientData.allFormsData.length > 0 &&
            !patientData.emptyFormData ? (
              patientData.allFormsData.map((formData, i) => (
                <Grid key={i} item xs={12} className="mt-3" ref={formRefs[i]}>
                  <Grid container className="align-items-center">
                    <Grid item xs={6} className="d-flex">
                      <FormGroup>
                        {
                          <FormControlLabel
                            key={formData.formKey}
                            control={
                              <Checkbox
                                checked={formData.isSelected}
                                onChange={() =>
                                  handleFormSelect(formData.formKey)
                                }
                              />
                            }
                            label={
                              <span
                                className={styles.checkboxLabel}
                                ref={elRefs[i]}
                              >
                                {formData.name}
                              </span>
                            }
                          />
                        }
                      </FormGroup>
                    </Grid>
                    <Grid item xs={4} />
                    <Grid item xs={2}>
                      {formData.data.length > 0 ? (
                        <span className={styles.updated}>Updated</span>
                      ) : null}
                    </Grid>
                  </Grid>
                  <Divider />
                  {formData.data?.map((data, i) => (
                    <Grid key={i} container>
                      <Grid container className="mt-2">
                        <Grid item xs={5}>
                          <span className={styles.key}>{data.label}</span>
                        </Grid>
                        <Grid
                          item
                          xs={5}
                          className="d-flex justify-content-center"
                        >
                          <span className={styles.value}>
                            {typeof data.value === 'boolean' ? (
                              <span>
                                {data.value.toString().charAt(0).toUpperCase() +
                                  data.value.toString().slice(1)}
                              </span>
                            ) : data.value.length === 0 ? (
                              <span className={styles.noData}>N/A</span>
                            ) : typeof data.value === 'string' &&
                              !data.value.includes('data:') ? (
                              data.value
                            ) : (
                              <div className={styles.signatureContainer}>
                                <img
                                  alt="Signature"
                                  src={data.value}
                                  className={styles.signature}
                                />
                              </div>
                            )}
                          </span>
                        </Grid>
                        <Grid item xs={2}>
                          {data.updateTime !== null ? (
                            data.updateTime.length !== 0 ? (
                              <span className={styles.value}>
                                {moment(data.updateTime).format('M/D/YYYY')}
                              </span>
                            ) : (
                              <span className={styles.value}>NA</span>
                            )
                          ) : (
                            <span className={styles.value}>NA</span>
                          )}
                        </Grid>
                        <Grid item xs={12} className="mt-3 mb-2">
                          <Divider />
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              ))
            ) : patientData.emptyFormData ? (
              <span className={styles.emptyForms}>Empty</span>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  height: '100%',
                  flexDirection: 'column',
                  marginTop: '1rem',
                }}
              >
                <FormNamesSkeleton count={6} />
              </div>
            )}
          </Grid>
          {patientData.isPrintingSection && <div ref={appendRef} />}
        </Scrollbars>
      </Grid>
    </Grid>
  );
};

export default observer(FormData);
