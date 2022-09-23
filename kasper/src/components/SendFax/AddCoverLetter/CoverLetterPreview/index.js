import Modal from 'components/Core/Modal';
import React from 'react';
import { useQuery } from 'react-query';
import PDFViewer from 'components/Core/PDFViewer';
import { useStores } from 'hooks/useStores';

const CoverLetterPreview = ({ tokens, onClose }) => {
  const { fax } = useStores();

  const { data, isFetching } = useQuery(['faxPreview', tokens], () =>
    fax.previewFax(tokens),
  );

  return (
    <Modal
      allowClosing={!isFetching}
      header="Cover letter preview"
      onClose={onClose}
      body={
        <div
          style={{
            height: '600px',
            marginTop: '2em',
            border: '1px solid #999',
          }}
        >
          {<PDFViewer loading={isFetching} file={data} />}
        </div>
      }
    />
  );
};

export default CoverLetterPreview;
