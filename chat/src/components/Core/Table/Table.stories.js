import React, { useState } from 'react';
import Table from '.';

export default {
  title: 'Table',
  component: Table,
};

const tableColumns = [
  {
    id: 'firstname',
    numeric: false,
    disablePadding: false,
    label: 'First Name',
  },
  {
    id: 'lastname',
    numeric: false,
    disablePadding: false,
    label: 'Last name',
  },
  {
    id: 'company',
    numeric: false,
    disablePadding: false,
    label: 'Company',
  },
  {
    id: 'faxNumber',
    numeric: false,
    disablePadding: false,
    label: 'Fax Number',
  },
];

function createData(id, firstname, lastname, company, faxNumber) {
  return { id, firstname, lastname, company, faxNumber };
}

const tableRows = [
  createData(1, 'Demi', 'Wilkinson', 'Company name 1', ' +1 (555) 444-3331'),
  createData(2, 'Bill', 'Wood', 'Company name 1', ' +1 (555) 444-3332'),
  createData(3, 'Olive', 'Mathews', 'Company name 2', ' +1 (555) 444-3333'),
  createData(4, 'Mark', 'Delgado', 'Company name 2', ' +1 (555) 444-3334'),
  createData(5, 'Heather', 'Kim', 'Company name 2', ' +1 (555) 444-3335'),
  createData(6, 'Hannah', 'Kelley', 'Company name 3', ' +1 (555) 444-3336'),
  createData(7, 'Raymond', 'Carr', 'Company name 4', ' +1 (555) 444-3337'),
  createData(8, 'Theresa', 'Stone', 'Company name 4', ' +1 (555) 444-3338'),
  createData(
    9,
    'Christopher',
    'Russell',
    'Company name 5',
    '+1 (555) 444-3339',
  ),
  createData(10, 'Judy', 'Carpenter', 'Company name 5', ' +1 (555) 444-3340'),
];

export const Main = (args) => {
  return <Table columns={tableColumns} rows={tableRows} {...args} />;
};

// Default arg values
Main.args = {
  selected: [],
  sortBy: '',
  sortOrder: 'asc',
  enableSearchBar: false,
  allowSelectAll: true,
  height: 400,
  width: '100%',
  isSelectable: true,
  isEmpty: false,
  emptyText: 'No Data',
  hideSelectionColor: false,
};

export const ColumnSorting = () => {
  return <Table columns={tableColumns} rows={tableRows} height={400} />;
};

export const SearchBar = () => {
  return (
    <Table
      columns={tableColumns}
      rows={tableRows}
      enableSearchBar
      height={400}
    />
  );
};

export const RowSelect = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <>
      <Table
        columns={tableColumns}
        rows={tableRows}
        height={400}
        selected={selectedRows}
        onRowSelect={(rowIds) => setSelectedRows(rowIds)}
      />
      <h4>Selected rows : {selectedRows.join(', ')}</h4>
    </>
  );
};

export const TableWithLoader = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  return (
    <>
      <Table
        columns={tableColumns}
        rows={[]}
        height={400}
        selected={selectedRows}
        onRowSelect={(rowIds) => setSelectedRows(rowIds)}
      />
    </>
  );
};

export const DisableSelectAll = () => {
  return (
    <Table
      columns={tableColumns}
      rows={tableRows}
      height={400}
      allowSelectAll={false}
    />
  );
};

export const ColumnFiltering = () => {
  const tableColumnsForFiltering = [
    {
      id: 'firstname',
      numeric: false,
      disablePadding: false,
      label: 'First Name',
    },
    {
      id: 'lastname',
      numeric: false,
      disablePadding: false,
      label: 'Last name',
    },
    {
      id: 'company',
      numeric: false,
      disablePadding: false,
      label: 'Company',
      showFilter: true,
      filterValues: [
        'Company name 1',
        'Company name 2',
        'Company name 3',
        'Company name 4',
        'Company name 5',
      ],
    },
    {
      id: 'faxNumber',
      numeric: false,
      disablePadding: false,
      label: 'Fax Number',
    },
  ];

  return (
    <Table
      columns={tableColumnsForFiltering}
      rows={tableRows}
      height={400}
      allowSelectAll={false}
    />
  );
};
