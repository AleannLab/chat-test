const search = (value, rows, setRows) => {
  const newValue = value.toLowerCase();
  if (newValue) {
    const newTableRows = rows.filter(({ displayName }) =>
      displayName?.toLowerCase()?.includes(newValue),
    );
    setRows(newTableRows);
  } else {
    setRows(rows);
  }
};

export { search };
