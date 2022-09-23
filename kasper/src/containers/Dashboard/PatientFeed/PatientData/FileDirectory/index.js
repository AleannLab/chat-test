import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
// import moment from "moment";

import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import Table from 'components/Core/Table';
import FileOther from 'assets/images/file-other.svg';
import FilePDF from 'assets/images/file-pdf.svg';
import styles from './index.module.css';
import { convertCustomTime } from 'helpers/timezone';
import Loader from 'components/Core/Loader';

const FileDirectory = () => {
  const { patientData, utils, patientFile } = useStores();
  const authToken = useAuthToken();

  useEffect(() => {
    if (patientFile.patientFileUploaded) {
      patientFile.setPatientFileUploaded(false);
    }
    refreshFiles(patientData.selectedPatient.id);
  }, [patientData.selectedPatient, patientFile.patientFileUploaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshFiles = async (patientId) => {
    patientFile.fetchList({ patient_id: patientId }).then(() => {
      if (patientFile.data.length === 0) {
        patientFile.setEmptyPatientFiles(true);
      } else {
        patientFile.setEmptyPatientFiles(false);
      }
    });
  };

  const tableColumns = [
    {
      id: 'file',
      numeric: false,
      disablePadding: false,
      label: 'File',
      width: '10%',
    },
    {
      id: 'name',
      numeric: false,
      disablePadding: false,
      label: 'Name',
      width: '25%',
    },
    {
      id: 'type',
      numeric: false,
      disablePadding: false,
      label: 'Type',
      width: '10%',
    },
    {
      id: 'category',
      numeric: false,
      disablePadding: false,
      label: 'Category',
      width: '15%',
      showFilter: false,
      /* Despite filter being disabled, keeping values for future use cases */
      filterValues: [
        'Other',
        'Marketing',
        'Medical History',
        'Profile Information',
        'Dental History',
      ], // TODO: These values should be fetched from backend, keeping it static for now because we do not have any API for this
    },
    {
      id: 'date',
      numeric: false,
      disablePadding: false,
      label: 'Date',
      width: '20%',
    },
    {
      id: 'action',
      numeric: false,
      disablePadding: false,
      label: 'Action',
      width: '20%',
    },
  ];

  function createData(id, fileName, category, fileDate, actionType) {
    const name = fileName ? fileName.split('.')[0] : 'NA';
    const type = fileName ? fileName.split('.')[1] : 'NA';
    const date = convertCustomTime({
      dateTime: fileDate,
      format: 'MM/DD/YYYY',
    });
    const url = utils.prepareMediaUrl({ uuid: id, authToken });
    const action = (
      <a
        style={{ color: '#F4266E', textDecoration: 'none' }}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {actionType}
      </a>
    );
    let file = '';
    if (type === 'png' || type === 'jpg' || type === 'jpeg') {
      file = (
        <img
          src={url}
          alt="file preview"
          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
        />
      );
    } else if (type === 'pdf') {
      file = (
        <img
          src={FilePDF}
          alt="file preview"
          style={{ width: '48px', height: '48px' }}
        />
      );
    } else {
      file = (
        <img
          src={FileOther}
          alt="file preview"
          style={{ width: '48px', height: '48px' }}
        />
      );
    }

    return { id, file, name, type, category, date, action };
  }

  let rows = patientFile.data.map((id) => {
    const file = patientFile.get([{}, id]);
    return createData(
      file.uuid,
      file.description,
      file.category_name,
      file.datetime,
      'Download',
    );
  });

  return patientFile.emptyPatientFiles ? (
    <div className={styles.emptyContainer}>
      <span className={styles.noFilesText}>No files are uploaded</span>
    </div>
  ) : (
    <div style={{ height: 450 }}>
      <Loader show={patientFile.loading} showMessage={false}>
        <Table
          isSelectable={false}
          columns={tableColumns}
          rows={rows}
          sortBy={tableColumns[0].id}
          allowSelectAll={false}
        />
      </Loader>
    </div>
  );
};

export default observer(FileDirectory);
