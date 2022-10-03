import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import PropTypes from 'prop-types';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import MuiTable from '@material-ui/core/Table';
import TableHead from './TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import SearchIcon from '@material-ui/icons/Search';
import Checkbox from 'components/Core/Checkbox';
import { Scrollbars } from 'react-custom-scrollbars';
import Skeleton from './Skeleton';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// Main table component
const Table = ({
  columns,
  rows: inputRows,
  selected,
  onRowSelect,
  sortBy,
  sortOrder,
  allowSelectAll,
  enableSearchBar,
  onSearch,
  height,
  width,
  isSelectable,
  disabled,
  isEmpty,
  emptyText,
  loadData,
  dataToFetch,
  isAlreadyAdded,
  hideSelectionColor,
  showHeader = true,
  noScroll = false,
  showSearchResultCount = false,
}) => {
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState(sortOrder);
  const [orderBy, setOrderBy] = useState(sortBy);
  const [searchText, setSearchText] = useState(null);
  const [filterConfig, setFilterConfig] = useState({
    colId: null,
    value: null,
  });
  const [isTableEmpty, setIsTableEmpty] = useState(null);

  useEffect(() => {
    setFilterConfig({
      colId: null,
      value: null,
    });
  }, []);

  useEffect(() => {
    setIsTableEmpty(isEmpty);
  }, [isEmpty]);

  useEffect(() => {
    if (searchText !== null) {
      const newFilteredRecords = inputRows.filter((obj) => {
        return Object.keys(obj).some((key) => {
          if (key === 'patient') {
            return Object.keys(obj[key]).some((nestedKey) => {
              if (nestedKey === 'props') {
                const filteredRows = Object.keys(obj[key][nestedKey]).some(
                  (val) =>
                    obj[key][nestedKey][val]
                      .toString()
                      .toLowerCase()
                      .includes(searchText.toLowerCase()),
                );
                setIsTableEmpty(!filteredRows.length);
                return filteredRows;
              }
              return [];
            });
          } else {
            return obj[key]
              .toString()
              .toLowerCase()
              .includes(searchText.toLowerCase());
          }
        });
      });
      // console.debug(newFilteredRecords);
      // const filteredRecords = inputRows.filter(o => Object.keys(o).some(k => o[k].toString().toLowerCase().includes(searchText.toLowerCase())));
      // console.debug(filteredRecords);
      const timeoutHandler = setTimeout(
        () => setRows([...newFilteredRecords]),
        100,
      );
      return () => clearTimeout(timeoutHandler);
    } else {
      setRows(inputRows);
    }
  }, [inputRows, searchText, enableSearchBar]);

  useEffect(() => {
    if (!!filterConfig && !!filterConfig.colId && !!filterConfig.value) {
      const { filterFunction } = columns.find(
        ({ id }) => id === filterConfig.colId,
      );
      let newFilteredRecords = [];
      if (filterFunction) {
        newFilteredRecords = filterFunction(inputRows, filterConfig.value);
      } else {
        newFilteredRecords = inputRows.filter(
          (row) => row[filterConfig.colId] === filterConfig.value,
        );
      }
      setRows([...newFilteredRecords]);
      setIsTableEmpty(!newFilteredRecords.length);
    } else {
      setRows(inputRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterConfig, columns]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (!onRowSelect) return;
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      onRowSelect(newSelecteds);
      return;
    }
    onRowSelect([]);
  };

  const handleClick = (event, name) => {
    if (!onRowSelect) return;

    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    onRowSelect(newSelected);
  };

  const handleFilterChange = (id, filterValue) => {
    if (filterConfig.colId === id && filterConfig.value === filterValue) {
      setFilterConfig({
        colId: null,
        value: null,
      });
    } else {
      setFilterConfig({
        colId: id,
        value: filterValue,
      });
    }
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  return (
    <div className={styles.root}>
      <Paper className={styles.paper} elevation={0}>
        {enableSearchBar && (
          <div className="d-flex align-items-center justify-content-between">
            <div
              className={`${
                showSearchResultCount ? styles.searchBarWidth : styles.searchBar
              }`}
            >
              <SearchIcon className="me-1" />
              <InputBase
                fullWidth
                placeholder="Search..."
                onChange={(e) =>
                  typeof onSearch === 'function'
                    ? onSearch(e.target.value)
                    : setSearchText(e.target.value)
                }
              />
            </div>
            {showSearchResultCount && searchText && (
              <span style={{ color: '#999999' }}>{rows.length} results</span>
            )}
          </div>
        )}
        <TableContainer style={{ height, width }}>
          {!noScroll ? (
            <Scrollbars
              style={{ height: '100%' }}
              renderTrackVertical={(props) => (
                <div {...props} className={styles.scrollbarVerticalTrack} />
              )}
              renderTrackHorizontal={(props) => <div {...props} />}
              onScroll={(event) => {
                if (
                  !dataToFetch.loading &&
                  event.target.scrollTop + event.target.clientHeight >=
                    event.target.scrollHeight - 500
                ) {
                  loadData();
                }
              }}
            >
              <MuiTable
                style={{
                  borderTop: showHeader ? 'none' : '1px solid #D2D2D2',
                }}
                className={styles.table}
                aria-labelledby="tableTitle"
                size="medium"
                aria-label="enhanced table"
                stickyHeader
              >
                {showHeader && (
                  <TableHead
                    cellWidth={Math.floor(100 / columns.length)}
                    columns={columns}
                    rows={rows}
                    numSelected={selected.length}
                    isSelectable={isSelectable}
                    order={order}
                    orderBy={orderBy}
                    onSelectAllClick={handleSelectAllClick}
                    onRequestSort={handleRequestSort}
                    rowCount={rows.length}
                    allowSelectAll={allowSelectAll}
                    enableSearchBar={enableSearchBar}
                    filterConfig={filterConfig}
                    onFilterChange={(id, filterValue) =>
                      handleFilterChange(id, filterValue)
                    }
                  />
                )}
                <TableBody>
                  {rows.length ? (
                    stableSort(rows, getComparator(order, orderBy)).map(
                      (row, index) => {
                        const isItemSelected = isSelected(row.id);
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={isItemSelected}
                            className={
                              hideSelectionColor
                                ? styles.hideSelectionColor
                                : ''
                            }
                          >
                            {isSelectable ? (
                              <TableCell padding="checkbox">
                                <Checkbox
                                  defaultDisabled={
                                    disabled ||
                                    (isAlreadyAdded && isAlreadyAdded(row.id))
                                  }
                                  checked={isItemSelected}
                                  inputProps={{ 'aria-labelledby': labelId }}
                                  onClick={(event) =>
                                    handleClick(event, row.id)
                                  }
                                />
                                {isAlreadyAdded && isAlreadyAdded(row.id) && (
                                  <small
                                    style={{
                                      color: '#FF4A4A',
                                      marginTop: '-5px',
                                    }}
                                  >
                                    Already added
                                  </small>
                                )}
                              </TableCell>
                            ) : null}
                            {Object.keys(row)
                              .filter(
                                (rowKey) =>
                                  rowKey !== 'user_id' &&
                                  rowKey !== 'id' &&
                                  rowKey !== 'statusName',
                              )
                              .map((rowKey, i) => (
                                <TableCell key={i} align={columns[i]?.align}>
                                  {row[rowKey]}
                                </TableCell>
                              ))}
                          </TableRow>
                        );
                      },
                    )
                  ) : isTableEmpty ? (
                    <TableRow>
                      <TableCell className={styles.emptyTextContainer}>
                        {emptyText}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <Skeleton
                      addCheckboxColumn={isSelectable}
                      columns={columns}
                    />
                  )}
                </TableBody>
              </MuiTable>
            </Scrollbars>
          ) : (
            <MuiTable
              style={{
                borderTop: showHeader ? 'none' : '1px solid #D2D2D2',
              }}
              className={styles.table}
              aria-labelledby="tableTitle"
              size="medium"
              aria-label="enhanced table"
              stickyHeader
            >
              {showHeader && (
                <TableHead
                  cellWidth={Math.floor(100 / columns.length)}
                  columns={columns}
                  rows={rows}
                  numSelected={selected.length}
                  isSelectable={isSelectable}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={rows.length}
                  allowSelectAll={allowSelectAll}
                  enableSearchBar={enableSearchBar}
                  filterConfig={filterConfig}
                  onFilterChange={(id, filterValue) =>
                    handleFilterChange(id, filterValue)
                  }
                />
              )}
              <TableBody>
                {rows.length ? (
                  stableSort(rows, getComparator(order, orderBy)).map(
                    (row, index) => {
                      const isItemSelected = isSelected(row.id);
                      const labelId = `enhanced-table-checkbox-${index}`;
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.id}
                          selected={isItemSelected}
                          className={
                            hideSelectionColor ? styles.hideSelectionColor : ''
                          }
                        >
                          {isSelectable ? (
                            <TableCell padding="checkbox">
                              <Checkbox
                                defaultDisabled={
                                  disabled ||
                                  (isAlreadyAdded && isAlreadyAdded(row.id))
                                }
                                checked={isItemSelected}
                                inputProps={{ 'aria-labelledby': labelId }}
                                onClick={(event) => handleClick(event, row.id)}
                              />
                              {isAlreadyAdded && isAlreadyAdded(row.id) && (
                                <small
                                  style={{
                                    color: '#FF4A4A',
                                    marginTop: '-5px',
                                  }}
                                >
                                  Already added
                                </small>
                              )}
                            </TableCell>
                          ) : null}
                          {Object.keys(row)
                            .filter(
                              (rowKey) =>
                                rowKey !== 'user_id' &&
                                rowKey !== 'id' &&
                                rowKey !== 'statusName',
                            )
                            .map((rowKey, i) => (
                              <TableCell key={i} align={columns[i]?.align}>
                                {row[rowKey]}
                              </TableCell>
                            ))}
                        </TableRow>
                      );
                    },
                  )
                ) : isTableEmpty ? (
                  <TableRow>
                    <TableCell className={styles.emptyTextContainer}>
                      {emptyText}
                    </TableCell>
                  </TableRow>
                ) : (
                  <Skeleton
                    addCheckboxColumn={isSelectable}
                    columns={columns}
                  />
                )}
              </TableBody>
            </MuiTable>
          )}
        </TableContainer>
      </Paper>
    </div>
  );
};

Table.propTypes = {
  /** Table columns */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      numeric: PropTypes.bool,
      disablePadding: PropTypes.bool,
      label: PropTypes.string,
      showFilter: PropTypes.bool,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      align: PropTypes.oneOf(['inherit', 'left', 'center', 'right', 'justify']),
      canSort: PropTypes.bool,
    }),
  ).isRequired,
  /** Table rows */
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** List of selected rows */
  selected: PropTypes.arrayOf(PropTypes.any),
  /** Callback function called on row selection */
  onRowSelect: PropTypes.func,
  /** Sort by column name */
  sortBy: PropTypes.string,
  /** Column sort order */
  sortOrder: PropTypes.oneOf(['asc', 'desc']),
  /** Flag to display local search input field above table */
  enableSearchBar: PropTypes.bool,
  /** Flag to allow to select all table rows */
  allowSelectAll: PropTypes.bool,
  /** Table height - if no prop provided then the table component will take its parent's height */
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Table width - if no prop provided then the table component will take its parent's width */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Flag to enable/disable row selection */
  isSelectable: PropTypes.bool,
  /** Tell table has no records */
  isEmpty: PropTypes.bool,
  /** Text to display when there are no records in the table */
  emptyText: PropTypes.string,
  /** Function to load more data on demand */
  loadData: PropTypes.func,
  /** Store object reference */
  dataToFetch: PropTypes.object,
  /** Flag to enable/disable highlighting of selected row(s) */
  hideSelectionColor: PropTypes.bool,
  /** Callback function called on table search */
  onSearch: PropTypes.func,
};

Table.defaultProps = {
  selected: [],
  onRowSelect: () => {},
  sortBy: '',
  sortOrder: 'asc',
  enableSearchBar: false,
  allowSelectAll: true,
  height: '100%',
  width: '100%',
  isSelectable: true,
  isEmpty: false,
  emptyText: 'No Data',
  loadData: () => {},
  dataToFetch: {},
  hideSelectionColor: false,
  onSearch: null,
};

export default Table;
