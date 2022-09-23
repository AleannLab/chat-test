import React from 'react';
import { Box } from '@material-ui/core';

export default function List({
  loading,
  loaded,
  loadingMore,
  data,
  emptyMessage,
  render: RenderItem,
  renderLoading: RenderLoading,
  customFunc,
  skeletonItems = 10,
  rowKey,
  ...props
}) {
  if (!loaded || (loading && data?.length === 0)) {
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
      {(data || []).map((props) => (
        <RenderItem key={rowKey(props)} {...props} />
      ))}
      {loading && loadingMore}
    </>
  );
}
