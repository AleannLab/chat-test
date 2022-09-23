import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import MentionInputField from 'components/Core/Formik/MentionInputField';
import SelectField from 'components/Core/Formik/SelectField';
import TextInputField from 'components/Core/Formik/TextInputField';
import Modal from 'components/Core/Modal';
import { Form, Formik, Field } from 'formik';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import Checkbox from 'components/Core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import * as Yup from 'yup';
import styles from './index.module.css';
import { makeStyles } from '@material-ui/styles';
import Tabs from 'components/Core/Tabs';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import EmailReminderPreview from './EmailReminderPreview';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import TagsInputField from 'components/Core/Formik/TagsInputField';

const useStyles = makeStyles({
  removeBottomPadding: {
    padding: '8px 8px 0px 8px !important',
  },
  removeTopPadding: {
    padding: '5px 8px 8px 11px !important',
  },
  customPaddingDurationTypeButton: {
    '&.MuiButton-outlined': {
      padding: '6px 19px 5px !important',
    },
  },
});

const TabBody = ({
  isSubmitting,
  tags,
  formattedMessage,
  setTemplatePreview,
  messagePreview,
  styles,
  customMessage,
  onOpenPreviewEmail,
}) => {
  return (
    <>
      {customMessage === 'customEmail' && (
        <Grid
          item
          xs={12}
          className={`${styles.px25} ${styles.customMarginEmailSubject}`}
        >
          <TextInputField
            fieldLabel="EMAIL SUBJECT LINE"
            fieldName="emailSubject"
            type="text"
            required
            disabled={isSubmitting}
          />
        </Grid>
      )}
      <Grid item xs={12} className={`${styles.px25} mt-2`}>
        <MentionInputField
          disabled={isSubmitting}
          fieldLabel={`CUSTOMIZE YOUR ${
            customMessage === 'customEmail' ? 'EMAIL' : 'SMS'
          } BELOW`}
          tagLabel="PLACE CURSOR IN DESIRED POSITION AND CLICK FIELD VARIABLE TO ADD"
          fieldName={customMessage}
          tags={tags}
          formattedMessage={formattedMessage}
          setTemplatePreview={setTemplatePreview}
        />
      </Grid>

      <Grid item xs={12} className={`${styles.px25} mt-3`}>
        {customMessage === 'customEmail' ? (
          <Button
            className={`secondary-btn`}
            variant="outlined"
            color="secondary"
            size="medium"
            onClick={() => onOpenPreviewEmail()}
          >
            Preview Email
          </Button>
        ) : (
          <>
            <span className={styles.labelText}>MESSAGE PREVIEW</span>
            <div className={styles.messagePreview}>{messagePreview}</div>
          </>
        )}
      </Grid>
    </>
  );
};

const AddReminder = ({
  isEditing,
  submitReminder,
  onClose,
  editingData,
  isDuplicating,
}) => {
  const [individualMessagePreview, setIndividualMessagePreview] = useState('');
  const [familyMessagePreview, setFamilyMessagePreview] = useState();
  const [individualTemplatePreview, setIndividualTemplatePreview] =
    useState('');
  const [familyTemplatePreview, setFamilyTemplatePreview] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [emailTemplatePreview, setEmailTemplatePreview] = useState('');
  const [showEmailReminderPreview, setShowEmailReminderPreview] =
    useState(false);
  const { hygieneReminder } = useStores();
  const { recallTypeData } = hygieneReminder;

  const classes = useStyles();

  const { data, isLoading: isLoadingRecallType } = useQuery(
    ['recallTypeFetchData'],
    () => {
      return hygieneReminder.fetchRecallTypeData();
    },
  );
  const transformedRecallTypeData = useMemo(() => {
    return recallTypeData.map((recallType) => ({
      ...recallType,
      name: recallType.description,
    }));
  }, [recallTypeData]);

  const dateOptions = [
    { id: 1, label: 'Before Due Date', value: 'before' },
    { id: 2, label: 'After Due Date', value: 'after' },
  ];

  const periodOptions = [
    { id: 1, label: 'Day(s)', value: 'days' },
    { id: 3, label: 'Month(s)', value: 'months' },
  ];

  const defaultTags = [
    { id: 'firstName', display: 'First Name' },
    { id: 'preferredName', display: 'Preferred Name' },
    { id: 'practicePhone', display: 'Practice Phone' },
    { id: 'dueDate', display: 'Due Date' },
    { id: 'onlineSchedulingLink', display: 'Online Scheduling Link' },
  ];
  const tags = {
    Family: [
      { id: 'firstNames', display: 'First Names' },
      { id: 'preferredNames', display: 'Preferred Names' },
      { id: 'practicePhone', display: 'Practice Phone' },
      { id: 'dueDates', display: 'Due Dates' },
      { id: 'onlineSchedulingLink', display: 'Online Scheduling Link' },
    ],
  };
  const defaultValues = [
    { id: '{{firstName}}', value: 'John' },
    { id: '{{lastName}}', value: 'Doe' },
    { id: '{{preferredName}}', value: 'JD' },
    { id: '{{practicePhone}}', value: '888-777-6666' },
    { id: '{{dueDate}}', value: '10/10/2022 & 10:30AM' },
    { id: '{{dueDates}}', value: '10/10/2022 & 10:30AM' },
    { id: '{{firstNames}}', value: 'John' },
    { id: '{{preferredNames}}', value: 'John, Jessica, and Lewis' },
    {
      id: '{{onlineSchedulingLink}}',
      value: `${window.location.host}/schedule-appointment`,
    },
    { id: '{{dateTime}}', value: '10/10/2022 & 10:30AM' },
    { id: '{{month}}', value: 'April' },
    { id: '{{day}}', value: 'Monday' },
    { id: '{{dayOfMonth}}', value: '9' },
    { id: '{{time}}', value: '10:30am' },
  ];
  const reminderTypeOptions = [
    {
      id: 1,
      label: 'SMS',
      value: 'SMS',
    },
    { id: 2, label: 'Email', value: 'EMAIL' },
  ];

  const formattedIndividualMessage = (message) => {
    setIndividualTemplatePreview(message);
    defaultValues.forEach((d) => {
      if (message.includes(d.id)) {
        message = message.replaceAll(d.id, d.value);
      }
    });
    setIndividualMessagePreview(message);
  };

  const formattedFamilyMessage = (message) => {
    setFamilyTemplatePreview(message);
    defaultValues.forEach((d) => {
      if (message.includes(d.id)) {
        message = message.replaceAll(d.id, d.value);
      }
    });
    setFamilyMessagePreview(message);
  };

  const formattedEmail = (message) => {
    setEmailTemplatePreview(message);
    defaultValues.forEach((d) => {
      if (message.includes(d.id)) {
        message = message.replaceAll(d.id, d.value);
      }
    });
    setEmailPreview(message);
  };
  const setMessageFieldsSampleVal = (message = '', tags, callback) => {
    tags.forEach((d) => {
      if (message.includes(`{{${d.id}}}`)) {
        message = message.replaceAll(`{{${d.id}}}`, `{${d.display}}`);
      }
    });
    callback(message);
  };
  useEffect(() => {
    if (isEditing || isDuplicating) {
      formattedIndividualMessage(editingData.customIndividualMessage);
      formattedFamilyMessage(editingData.customFamilyMessage);
      formattedEmail(editingData.customEmail);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  let initialValues;
  if (isEditing || isDuplicating) {
    initialValues = {
      ...editingData,
    };
  } else {
    initialValues = {
      reminderName: '',
      dueDate: 'before',
      durationType: 'days',
      period: 2,
      customIndividualMessage: '',
      customFamilyMessage: '',
      reminderType: [],
      customEmail: '',
      emailSubject: '',
      recallType: [],
    };
  }
  const validateMessageLength = (value) => {
    if (value === undefined || value === null) {
      return true;
    }
    return value?.toString().length <= 320;
  };
  const validationSchema = Yup.object({
    reminderName: Yup.string().trim().required('Required'),
    dueDate: Yup.string().required('Required'),
    durationType: Yup.string().required('Required'),
    period: Yup.number()
      .min(1, 'Period should be greater than 0')
      .required('Required')
      .when('durationType', {
        is: 'months',
        then: Yup.number().max(24, 'Months should be equal to or less than 24'),
      })
      .test(
        'is-decimal',
        "Period shouldn't contain decimal points",
        (value) => !(value + '').match(/^\d*\.{1}\d*$/),
      ),

    reminderType: Yup.array()
      .min(1)
      .required('at least one item needs to be here'),
    customIndividualMessage: Yup.string().when(
      'reminderType',
      (reminderType, validationSchema) => {
        return reminderType.includes('SMS')
          ? validationSchema.required('Individual SMS Message is required')
          : validationSchema.notRequired();
      },
    ),
    customFamilyMessage: Yup.string()
      .when('reminderType', (reminderType, validationSchema) => {
        return reminderType.includes('SMS')
          ? validationSchema.required('Family SMS Message is required')
          : validationSchema.notRequired();
      })
      .test(
        'length',
        'Message can be less or equal to 320 characters',
        validateMessageLength,
      ),
    customEmail: Yup.string()
      .test(
        'length',
        'Message can be less or equal to 320 characters',
        validateMessageLength,
      )
      .when('reminderType', (reminderType, validationSchema) => {
        return reminderType.includes('EMAIL')
          ? validationSchema.required('Email Message is required')
          : validationSchema.notRequired();
      }),
    emailSubject: Yup.string().when(
      'reminderType',
      (reminderType, validationSchema) => {
        return reminderType.includes('EMAIL')
          ? validationSchema.required('Email Subject is required')
          : validationSchema.notRequired();
      },
    ),
  });

  const handleSubmitForm = (values) => {
    const {
      reminderName,
      dueDate,
      durationType,
      period,
      reminderType,
      emailSubject,
      recallType,
    } = values;
    let channel = '';
    const templates = {};
    if (reminderType.length === 2) {
      channel = 'SMS_EMAIL';
      templates.SMS = {};
      if (individualTemplatePreview != '') {
        templates.SMS['individual'] = individualTemplatePreview;
      }

      if (familyTemplatePreview != '') {
        templates.SMS['family'] = familyTemplatePreview;
      }
      if (emailTemplatePreview != '') {
        templates.EMAIL = {};
        templates.EMAIL['subject'] = emailSubject;
        templates.EMAIL['body'] = emailTemplatePreview;
      }
    } else if (reminderType.includes('SMS')) {
      channel = 'SMS';
      templates.SMS = {};
      if (individualTemplatePreview != '') {
        templates.SMS['individual'] = individualTemplatePreview;
      }
      if (familyTemplatePreview != '') {
        templates.SMS['family'] = familyTemplatePreview;
      }
    } else if (reminderType.includes('EMAIL')) {
      channel = 'EMAIL';
      templates.EMAIL = { subject: '', body: '' };
      if (emailSubject != '') {
        templates.EMAIL['subject'] = emailSubject;
      }
      if (emailTemplatePreview != '') {
        templates.EMAIL['body'] = emailTemplatePreview;
      }
    }
    const payload = {
      name: reminderName,
      reminderType: 'hygiene',
      pivotDate: dueDate,
      channel,
      recallTypeIds: recallType.map((recallType) => recallType.id),
      templates,
      durationType: durationType,
      enabled: true,
      duration: period,
    };
    if (isEditing) {
      payload.id = editingData.id;
      submitReminder(payload);
    } else {
      submitReminder(payload);
    }
  };

  return (
    <>
      <Modal
        size="sm"
        header={
          isEditing
            ? 'Edit Reminder'
            : isDuplicating
            ? 'Duplicate Reminder'
            : 'Add Reminder'
        }
        enableMargin={false}
        body={
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmitForm}
            validationSchema={validationSchema}
          >
            {({ isSubmitting, values, setFieldValue }) => {
              useMemo(() => {
                if (editingData?.recallType && recallTypeData) {
                  const recallTypeIdsMap = editingData.recallType?.reduce(
                    (prev, curr) => ({ ...prev, [curr]: 1 }),
                    {},
                  );

                  setFieldValue(
                    'recallType',
                    recallTypeData
                      ?.filter((recallType) => recallTypeIdsMap[recallType.id])
                      ?.map((el) => ({ ...el, name: el.description })) || [],
                  );
                }
              }, [recallTypeData, editingData?.recallType]);
              useEffect(() => {
                if (isEditing || isDuplicating) {
                  setMessageFieldsSampleVal(
                    editingData?.customIndividualMessage,
                    defaultTags,
                    (val) => setFieldValue('customIndividualMessage', val),
                  );
                  setMessageFieldsSampleVal(
                    editingData?.customFamilyMessage,
                    tags.Family,
                    (val) => setFieldValue('customFamilyMessage', val),
                  );
                  setMessageFieldsSampleVal(
                    editingData?.customEmail,
                    defaultTags,
                    (val) => setFieldValue('customEmail', val),
                  );
                }
              }, []);
              return (
                <Form>
                  <div className={styles.container}>
                    <Grid
                      container
                      spacing={2}
                      direction="row"
                      className={`${styles.px55} m-0 w-100`}
                    >
                      <Grid item xs={12}>
                        <TextInputField
                          fieldLabel="REMINDER NAME"
                          fieldName="reminderName"
                          type="text"
                          required
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TagsInputField
                          fieldName="recallType"
                          fieldLabel="RECALL TYPE"
                          placeholder=""
                          suggestions={transformedRecallTypeData}
                          allowNew={false}
                          suggestionsLimit={recallTypeData.length}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        className={classes.removeBottomPadding}
                      >
                        <span className={styles.labelText}>REMINDER TIME</span>
                      </Grid>
                      <Grid item xs={2}>
                        <TextInputField
                          mt={0}
                          fieldName="period"
                          type="number"
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <ButtonGroup
                          color="primary"
                          aria-label="outlined primary button group"
                          className={styles.durationButtonGroup}
                        >
                          {periodOptions.map((item) => (
                            <Button
                              key={item.value}
                              onClick={() =>
                                setFieldValue('durationType', item.value)
                              }
                              className={`
                              ${
                                values.durationType === item.value &&
                                styles.selectedButton
                              } ${classes.customPaddingDurationTypeButton}
                            `}
                            >
                              {item.label}
                            </Button>
                          ))}
                        </ButtonGroup>
                      </Grid>
                      <Grid item xs={5}>
                        <SelectField
                          mt={0}
                          mb={0}
                          disabled={isSubmitting}
                          fieldName="dueDate"
                          options={dateOptions.map((item) => (
                            <MenuItem value={item.value} key={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        className={classes.removeBottomPadding}
                      >
                        <span className={styles.reminderTypeLabelText}>
                          Reminder Type
                        </span>
                      </Grid>
                      {reminderTypeOptions.map((opt) => (
                        <Grid
                          item
                          xs={4}
                          key={opt.id}
                          className={classes.removeTopPadding}
                        >
                          <Field
                            type="checkbox"
                            name="reminderType"
                            value={opt.value}
                            key={opt.id}
                            as={FormControlLabel}
                            control={
                              <Checkbox
                                checked={values.reminderType.includes(
                                  opt.value,
                                )}
                              />
                            }
                            label={opt.label}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    {values.reminderType.length > 0 && (
                      <Grid
                        container
                        direction="row"
                        className={styles.paddingTop10}
                      >
                        <Grid item xs={12}>
                          <Tabs
                            className="add-reminder-tabs"
                            panelClassName="tab-panel-container"
                            config={[
                              ...(values.reminderType.includes(
                                reminderTypeOptions[0].value,
                              )
                                ? [
                                    {
                                      index: 0,
                                      label: 'Individual SMS',
                                      body: (
                                        <TabBody
                                          isSubmitting={isSubmitting}
                                          tags={defaultTags}
                                          formattedMessage={
                                            formattedIndividualMessage
                                          }
                                          setTemplatePreview={
                                            setIndividualTemplatePreview
                                          }
                                          messagePreview={
                                            individualMessagePreview
                                          }
                                          styles={styles}
                                          customMessage="customIndividualMessage"
                                        />
                                      ),
                                    },
                                    {
                                      index: 1,
                                      label: 'Family SMS',
                                      body: (
                                        <TabBody
                                          isSubmitting={isSubmitting}
                                          tags={tags.Family}
                                          formattedMessage={
                                            formattedFamilyMessage
                                          }
                                          setTemplatePreview={
                                            setFamilyTemplatePreview
                                          }
                                          messagePreview={familyMessagePreview}
                                          styles={styles}
                                          customMessage="customFamilyMessage"
                                        />
                                      ),
                                    },
                                  ]
                                : []),
                              ...(values.reminderType.includes(
                                reminderTypeOptions[1].value,
                              )
                                ? [
                                    {
                                      index:
                                        values.reminderType.length === 1
                                          ? 0
                                          : 2,
                                      label: 'Email',
                                      body: (
                                        <TabBody
                                          isSubmitting={isSubmitting}
                                          tags={defaultTags}
                                          formattedMessage={formattedEmail}
                                          setTemplatePreview={
                                            setEmailTemplatePreview
                                          }
                                          messagePreview={emailPreview}
                                          styles={styles}
                                          customMessage="customEmail"
                                          classes={classes}
                                          setShowEmailReminderPreview
                                          onOpenPreviewEmail={() =>
                                            setShowEmailReminderPreview(true)
                                          }
                                        />
                                      ),
                                    },
                                  ]
                                : []),
                            ]}
                            defaultTabIndex={0}
                            customStyle={true}
                          />
                        </Grid>
                      </Grid>
                    )}
                    <div className={`${styles.footer} mb-5 ${styles.px55}`}>
                      <Button
                        className="primary-btn me-auto"
                        variant="outlined"
                        color="primary"
                        onClick={onClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="secondary-btn"
                        variant="contained"
                        color="secondary"
                        disabled={isSubmitting || !values.reminderType.length}
                      >
                        {isEditing
                          ? 'Save'
                          : isDuplicating
                          ? 'Duplicate'
                          : 'Add'}
                      </Button>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        }
        onClose={onClose}
      />

      {showEmailReminderPreview === true && (
        <EmailReminderPreview
          onClose={() => setShowEmailReminderPreview(false)}
          emailReminderData={emailPreview}
        />
      )}
    </>
  );
};

export default AddReminder;
