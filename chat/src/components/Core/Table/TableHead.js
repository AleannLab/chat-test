import React, { useState } from 'react';
import styles from './index.module.css';
import PropTypes from 'prop-types';
import TableHead from '@material-ui/core/TableHead';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Checkbox from 'components/Core/Checkbox';
import FilterMenu from './FilterMenu';

const CheckboxRow = ({
  numSelected,
  isSelectable,
  allowSelectAll,
  rowCount,
  onSelectAllClick,
}) => {
  return (
    <>
      {isSelectable ? (
        allowSelectAll ? (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all desserts',
              }}
            />
          </TableCell>
        ) : (
          <TableCell padding="checkbox" />
        )
      ) : null}
    </>
  );
};

function EnhancedTableHead({
  columns,
  rows,
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  allowSelectAll,
  isSelectable,
  cellWidth,
  filterConfig,
  onFilterChange,
  isPositionLeft = true,
}) {
  const [ascIcon, setAscIcon] = useState(false);
  const [descIcon, setDescIcon] = useState(false);
  const [defaultIcon, setDefaultIcon] = useState(true);
  const Icon = () => {
    return (
      <span className={styles.iconSpan}>
        {descIcon ? (
          <ArrowDropUp fontSize="12" className={styles.dropUpActive} />
        ) : (
          !defaultIcon && (
            <ArrowDropUp fontSize="12" className={styles.dropUpInActive} />
          )
        )}
        {defaultIcon ? (
          <>
            <ArrowDropUp fontSize="12" className={styles.defaultDropUp} />
            <ArrowDropDown fontSize="12" className={styles.defaultDropDown} />
          </>
        ) : null}

        {ascIcon ? (
          <ArrowDropDown fontSize="12" className={styles.ascDropDown} />
        ) : (
          !defaultIcon && (
            <ArrowDropDown fontSize="12" className={styles.dropDownInActive} />
          )
        )}
      </span>
    );
  };

  const createSortHandler = (property, order) => (event) => {
    switch (order) {
      case 'asc': {
        setAscIcon(true);
        setDefaultIcon(false);
        setDescIcon(false);
        break;
      }
      case 'desc': {
        setDescIcon(true);
        setDefaultIcon(false);
        setAscIcon(false);
        break;
      }
    }
    onRequestSort(event, property);
  };

  return (
    <TableHead style={{ position: 'relative', zIndex: 8 }}>
      <TableRow>
        {isPositionLeft && (
          <CheckboxRow
            numSelected={numSelected}
            isSelectable={isSelectable}
            allowSelectAll={allowSelectAll}
            rowCount={rowCount}
            onSelectAllClick={onSelectAllClick}
          />
        )}
        {columns.map((headCell) => {
          const filterValues =
            !!headCell.showFilter &&
            !!headCell.filterValues &&
            headCell.filterValues.map((data) => ({
              label: data,
              value: data,
            }));
          return (
            <TableCell
              width={headCell.width}
              key={headCell.id}
              align={headCell.align}
              padding="default"
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {/*  className="d-flex" removed to make the align prop apply here */}
              <div>
                {headCell.canSort ? (
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id, order)}
                    IconComponent={Icon}
                  >
                    {headCell.label}
                  </TableSortLabel>
                ) : (
                  headCell.label
                )}
                {!!filterValues && (
                  <span className={styles.filerIconContainer}>
                    <FilterMenu
                      value={filterConfig.value}
                      onChangeValue={(value) =>
                        onFilterChange(headCell.id, value)
                      }
                      menuItems={filterValues}
                    />
                  </span>
                )}
              </div>
            </TableCell>
          );
        })}
        {!isPositionLeft && (
          <CheckboxRow
            numSelected={numSelected}
            isSelectable={isSelectable}
            allowSelectAll={allowSelectAll}
            rowCount={rowCount}
            onSelectAllClick={onSelectAllClick}
          />
        )}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  isSelectable: PropTypes.bool.isRequired,
  cellWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default EnhancedTableHead;
