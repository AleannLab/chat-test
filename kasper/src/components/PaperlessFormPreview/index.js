import React, { useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { observer } from 'mobx-react';
import Modal from 'components/Core/Modal';
import Loader from 'components/Core/Loader';
import FormStepperPreview from './FormStepperPreview';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';
import PDFViewer from 'components/Core/PDFViewer';

const PaperlessFormPreview = () => {
  const { paperlessForm } = useStores();
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const formInfo =
    paperlessForm.selectedFormForPreview ||
    paperlessForm.selectedSections.filter((a) => a)[
      paperlessForm.selectedSections.filter((a) => a).length - 1
    ];
  return (
    <>
      <div className={styles.root}>
        <div className={styles.headerContainer}>
          <div className={styles.headerText}>Preview</div>
        </div>
        {paperlessForm.selectedSections.length > 0 ? (
          <div>
            <div className={styles.sectionName}>{formInfo?.form?.name}</div>
            <div className={styles.formInfo}>
              {
                <div
                  style={{
                    visibility:
                      formInfo?.form?.formKey === 'formConsentDisclosure'
                        ? 'hidden'
                        : 'visible',
                  }}
                >
                  <span className={styles.sectionFieldLabel}>Filled out: </span>
                  <span className={styles.sectionFieldValue}>
                    {paperlessForm.filledOutCount} times
                  </span>
                </div>
              }
            </div>
          </div>
        ) : null}
        <div className={styles.previewContainer}>
          <div className={styles.previewWrapper}>
            {paperlessForm.selectedSections.length > 0 ? (
              <FormStepperPreview
                formInfo={formInfo}
                setShowPrintPreview={setShowPrintPreview}
              />
            ) : (
              <Loader />
            )}
          </div>
        </div>
      </div>

      {showPrintPreview ? (
        <Modal
          size="lg"
          allowClosing={!paperlessForm.generatingPdf}
          header=""
          onClose={() => setShowPrintPreview(false)}
          body={
            <div
              style={{
                height: '74vh',
              }}
            >
              {
                <PDFViewer
                  showControls={true}
                  loading={paperlessForm.generatingPdf}
                  file={paperlessForm.generatedPdfUrl}
                  renderMode="canvas"
                  scale={2}
                />
              }
            </div>
          }
        />
      ) : null}
    </>
  );
};

export default observer(PaperlessFormPreview);
