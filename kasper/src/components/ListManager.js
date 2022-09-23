import React from 'react';
import { observer } from 'mobx-react';
import { Box } from '@material-ui/core';

export default observer(function List({
  loading,
  loaded,
  loadingMore,
  data,
  emptyMessage,
  render: RenderItem,
  renderLoading: RenderLoading,
  customFunc,
  skeletonItems = 10,
  ...props
}) {
  if (!loaded || (loading && data.length === 0)) {
    return (
      <Box pt={0.5} m={0.5}>
        {[...Array(skeletonItems)].map((x, i) => (
          <React.Fragment key={i}>{RenderLoading}</React.Fragment>
        ))}
      </Box>
    );
  }
  // if(loading && data.length > 0) {
  //   return <LinearProgress />;
  // }

  if (emptyMessage && (!data || data.length === 0)) {
    return emptyMessage;
  }
  return (
    <>
      {data.map((datumId, index) => (
        <RenderItem
          key={`key-${index}`}
          id={datumId}
          payload={{ ...props }}
          customFunc={customFunc}
          index={index}
        />
      ))}
      {loading && loadingMore}
    </>
  );
});
