import useMediaQuery from '@material-ui/core/useMediaQuery';

export default () => {
  return {
    isDesktop: useMediaQuery('(min-width: 992px)'),
    isTablet: useMediaQuery('(min-width: 768px, max-width: 991px)'),
    isMobile: useMediaQuery('(max-width:600px)'),
  };
};
