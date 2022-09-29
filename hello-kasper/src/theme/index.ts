import { createTheme } from '@material-ui/core/styles';
import shadows from './shadows';

const brandKasperPrimary = {
  0: '#ffffff',
  50: '#f0f3f8',
  //   100: "#e1bee7",
  //   200: "#",
  300: '#243656',
  400: '#293D63 ',
  500: '#0D2145',
  //   600: "#8e24aa",
  //   700: "#7b1fa2",
  800: '#02122F',
  //   900: "#4a148c",
  //   A100: "#ea80fc",
  //   A200: "#e040fb",
  //   A400: "#d500f9",
  //   A700: "#aa00ff",
};

const brandKasperSecondary = {
  50: '#fee5ee',
  100: '#fcbed4',
  200: '#fa93b7',
  300: '#f7679a',
  400: '#f64784',
  500: '#f4266e',
  600: '#f32266',
  700: '#f11c5b',
  800: '#ef1751',
  900: '#ec0d3f',
  A100: '#ffffff',
  A200: '#ffe4e9',
  A400: '#F4266E',
  A700: '#D81B5D',
  contrastDefaultColor: 'light',
};

const theme = createTheme({
  palette: {
    primary: brandKasperPrimary,
    secondary: brandKasperSecondary,
    background: {
      default: brandKasperPrimary[50],
      paper: brandKasperPrimary[0],
    },
  },
  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1200,
    drawer: 1100,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  typography: {
    fontFamily: "'Montserrat'",
    caption: {
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '0.8rem',
      lineHeight: '13px',
      color: '#999999',
    },
    h1: {
      fontWeight: 'bold',
      fontSize: '2.5rem',
      fontFamily: 'Playfair Display',
      color: '#0D2145',
    },
    h2: {
      paddingBottom: '10px',
      fontWeight: 'bold',
      fontSize: '2rem',
      fontFamily: 'Playfair Display',
      color: '#0D2145',
    },
    h3: {
      // paddingBottom: "10px",
      fontWeight: 'bold',
      fontSize: '1.5rem',
      fontFamily: 'Playfair Display',
      color: '#FFFFFF',
    },
    h4: {
      color: '#FFFFFF',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      fontFamily: 'Playfair Display',
      textDecoration: 'none',
    },
    h5: {
      color: 'rgb(217, 217, 219)',
      fontSize: '1rem',
      fontWeight: 'bold',
      fontFamily: 'Playfair Display',
      textDecoration: 'none',
    },
    h6: {
      color: '#02122F',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      fontFamily: 'Playfair Display',
      textDecoration: 'none',
    },
    button: {
      color: '#777777',
    },
    // allVariants: {
    //   fontFamily: ,
    // },
  },
  overrides: {
    MuiBadge: {
      badge: {
        alignContent: 'center',
        alignItems: 'center',
        backgroundAttachment: 'scroll',
        backgroundClip: 'border-box',
        backgroundColor: 'rgb(255, 0, 0)',
        backgroundImage: 'none',
        backgroundOrigin: 'padding-box',
        backgroundPositionX: '0%',
        backgroundPositionY: '0%',
        backgroundRepeatX: '',
        backgroundRepeatY: '',
        backgroundSize: 'auto',
        borderBottomColor: 'rgb(13, 33, 69)',
        borderBottomLeftRadius: '3px',
        borderBottomRightRadius: '3px',
        borderBottomStyle: 'solid',
        borderBottomWidth: '1.11111px',
        borderImageOutset: '0',
        borderImageRepeat: 'stretch',
        borderImageSlice: '100%',
        borderImageSource: 'none',
        borderImageWidth: '1',
        borderLeftColor: 'rgb(13, 33, 69)',
        borderLeftStyle: 'solid',
        borderLeftWidth: '1.11111px',
        borderRightColor: 'rgb(13, 33, 69)',
        borderRightStyle: 'solid',
        borderRightWidth: '1.11111px',
        borderTopColor: 'rgb(13, 33, 69)',
        borderTopLeftRadius: '3px',
        borderTopRightRadius: '3px',
        borderTopStyle: 'solid',
        borderTopWidth: '1.11111px',
        boxShadow: 'none',
        boxSizing: 'border-box',
        color: 'rgb(255, 255, 255)',
        cursor: 'pointer',
        direction: 'ltr',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        fontSize: '7.5px',
        fontWeight: 500,
        height: '11.9965px',
        justifyContent: 'center',
        left: '0px',
        letterSpacing: '0.16px',
        lineHeight: '7.5px',
        marginLeft: '2px',
        marginTop: '4px',
        minWidth: '15px',
        paddingBottom: '0px',
        paddingLeft: '6px',
        paddingRight: '6px',
        paddingTop: '0px',
        position: 'absolute',
        textAlign: 'left',
        textSizeAdjust: '100%',
        top: '0px',
        transform: 'matrix(1, 0, 0, 1, -8.33333, -5.55556)',
        transformOrigin: '0px 0px',
        transitionDelay: '0s',
        transitionDuration: '0.225s',
        transitionProperty: 'transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        width: '16.9965px',
        zIndex: 1,
        WebkitFontSmoothing: 'antialiased',
        WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
      },
    },
    MuiAppBar: {
      root: {
        height: '64px',
        background: '#0D2145',
        boxShadow: '0px 0.5px 7px rgba(30, 31, 35, 0.13)',
      },
    },
    MuiButton: {
      root: {
        fontSize: '1rem !important',
        textTransform: 'none',
        '&:focus': {
          outline: '0px',
        },
        '&.Mui-disabled': {
          opacity: 0.5,
        },
        '&:hover': {
          boxShadow: 'none !important',
        },
      },
      sizeLarge: {
        fontSize: '1.15rem',
      },
      contained: {
        boxShadow: 'none !important',
        '&.Mui-disabled': {
          background: brandKasperSecondary['200'],
          color: '#fff',
        },
        '& .Mui-focusVisible': {
          background: brandKasperSecondary['A700'],
        },
        '&:hover': {
          background: brandKasperSecondary['A700'],
        },
      },
      outlined: {
        border: '1px solid #9a9a9a !important',
        color: '#02122F !important',
      },
      outlinedPrimary: {
        minWidth: '120px',
      },
      outlinedSecondary: {
        border: '1px solid #F4266E !important',
        color: '#02122F !important',
        minWidth: '120px',
      },
      containedSecondary: {
        minWidth: '120px',
      },
    },
    MuiOutlinedInput: {
      root: {
        backgroundColor: '#ffffff',
      },
      input: {
        color: '#02122F',
        fontSize: '14px',
        fontFamily: 'Montserrat',
        fontWeight: 'normal',
        '&.Mui-disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
        padding: '11px 14px',
      },
      multiline: {
        padding: '0px 0px !important',
      },
      adornedEnd: {
        padding: '0px 4px',
      },
    },
    MuiSelect: {
      root: {
        color: '#02122f',
        fontSize: '14px',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontFamily: 'Montserrat',
        padding: '10px',
        lineHeight: '17px',
      },
      iconOutlined: {
        height: '25px',
        width: '25px',
        color: '#0D2145',
      },
      icon: {
        height: '25px',
        width: '25px',
        color: '#0D2145',
      },
    },

    MuiDrawer: {
      paper: {
        zIndex: 20,
        borderRight: '1px solid #0D2145',
        // borderRight: "1px solid rgba(0, 0, 0, 0.12)!important"
        border: 'none!important',
        // maxWidth:"200px"
      },
    },
    MuiChip: {
      root: {
        backgroundColor: '#F8F8F8',
        borderRadius: '4px',
        border: ' 1px solid #D2D2D2',
        color: '#02122F',
        fontFamily: 'Montserrat',
        fontSize: '14px',
        fontWeight: 'normal',
      },
      deleteIcon: {
        height: '15px',
        width: '15px',
        color: '#9A9A9A',
      },
    },

    MuiTextField: {
      root: {
        '&.Mui-focused': {
          border: 'none',
        },
      },
    },

    MuiTooltip: {
      tooltip: {
        background: '#F4266E !important',
        fontSize: '0.78rem',
        maxWidth: 150,
        opacity: 0.9,
        fontWeight: 'normal',
      },
      arrow: {
        color: '#F4266E !important',
      },
    },

    MuiDialog: {
      root: {
        overflow: 'auto',
      },
      container: {
        height: 'auto',
      },
      paperWidthSm: {
        maxWidth: '640px',
      },
    },

    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
    },

    // MuiAutocomplete: {
    //   popper: {
    //     boxShadow:
    //       '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
    //   },
    //   paper: {
    //     margin: '0px',
    //   },
    // },

    MuiTypography: {
      body1: {
        fontFamily: 'Montserrat !important',
        letterSpacing: '0ch !important',
      },
    },

    MuiCollapse: {
      entered: {
        overflow: 'auto',
      },
    },

    MuiFormLabel: {
      root: {
        marginBottom: '0.5rem',
      },
    },
  },
  shadows,
});

export default theme;
