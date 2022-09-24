import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

export default ({ columns, addCheckboxColumn }) => {
  const displayRows = 5;
  return [...new Array(displayRows)].map((arr, index) => (
    <TableRow key={index}>
      {addCheckboxColumn && (
        <TableCell>
          <Skeleton />
        </TableCell>
      )}
      {columns.map((column, index) => (
        <TableCell key={index}>
          <Skeleton />
        </TableCell>
      ))}
    </TableRow>
  ));
};
