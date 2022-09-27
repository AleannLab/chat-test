export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const serializeToQueryString = function (obj, prefix) {
  var str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + '[' + p + ']' : p,
        v = obj[p];
      str.push(
        v !== null && typeof v === 'object'
          ? serializeToQueryString(v, k)
          : encodeURIComponent(k) + '=' + encodeURIComponent(v),
      );
    }
  }
  return str.length > 0 ? `?${str.join('&')}` : '';
};

/**
 * Generate random GUID
 */
export const guidGenerator = () => {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    S4() +
    S4()
  );
};

/**
 * Avatar Color generator
 */
export const generateColor = (id, shadePercent = -20) => {
  // Do not delete this code, keeping it for future reference
  // const color =
  //   '#' +
  //   Math.floor(id * 123450)
  //     .toString(16)
  //     .slice(0, 6);
  // return shadeColor(color, shadePercent);

  let color = '#5B90BB';
  switch (+id.toString().split('').pop()) {
    case 0:
    case 1:
      color = '#5A9B68';
      break;
    case 2:
    case 3:
      color = '#0D5CA4';
      break;
    case 4:
    case 5:
      color = '#9D53A6';
      break;
    case 6:
    case 7:
      color = '#9B8052';
      break;
    case 8:
      color = '#A67165';
      break;
    case 9:
      color = '#5B90BB';
      break;
    default:
      break;
  }
  return color;
};

/**
 * Generate shade for given color and percentage
 */
export const shadeColor = (color, percent) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const RR =
    R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
  const GG =
    G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
  const BB =
    B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);

  return '#' + RR + GG + BB;
};

/**
 * Convert given number to currency with provided optional prefix symbol
 * @param {number} number
 * @param {string=} currency
 * @returns {string} currency equivalent for provided number and currency type
 */
export const convertToCurrency = (number, currency = 'USD') => {
  return number.toLocaleString('en-US', { style: 'currency', currency });
};

/**
 *
 * @param {number} num
 * @param {number} fixed
 * @returns {number} a fixed decimal value without rounding
 */
export const toFixedWithoutRounding = (num, fixed) => {
  if (typeof num !== 'number') return 0;
  var re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
};

/**
 * @param {number} value
 * @returns {number}
 */
export const sanitizeNumber = (value) => {
  value = +value;
  return +(value != null && value >= 0 ? toFixedWithoutRounding(value, 2) : 0);
};

/**
 * @param {number} numerator
 * @param {number} denominator
 * @returns {number|null}
 */
export const divideIfNotZero = (numerator, denominator) => {
  if (denominator === 0 || isNaN(denominator)) {
    return null;
  } else {
    return numerator / denominator;
  }
};

export const normalizeNumber = (value) => {
  if (!value) return '';
  const res = [];
  value.split('').forEach((character) => {
    switch (character.toLowerCase()) {
      case '*':
      case '#':
      case '+':
      case '1':
      case '0':
        res.push(character);
        break;
      case '2':
      case 'a':
      case 'b':
      case 'c':
        res.push('2');
        break;
      case '3':
      case 'd':
      case 'e':
      case 'f':
        res.push('3');
        break;
      case '4':
      case 'g':
      case 'h':
      case 'i':
        res.push('4');
        break;
      case '5':
      case 'j':
      case 'k':
      case 'l':
        res.push('5');
        break;
      case '6':
      case 'm':
      case 'n':
      case 'o':
        res.push('6');
        break;
      case '7':
      case 'p':
      case 'q':
      case 'r':
      case 's':
        res.push('7');
        break;
      case '8':
      case 't':
      case 'u':
      case 'v':
        res.push('8');
        break;
      case '9':
      case 'w':
      case 'x':
      case 'y':
      case 'z':
        res.push('9');
        break;
      default:
        break;
    }
  });
  return res.join('');
};

export const convertHexToRGBA = (hexCode, opacity = 1) => {
  let hex = hexCode.replace('#', '');

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  if (opacity > 1 && opacity <= 100) {
    opacity = opacity / 100;
  }

  return `rgba(${r},${g},${b},${opacity})`;
};

export const secondsToMmss = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

export const secondsToHhMmss = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(11, 19);

export const regions = [
  { name: 'ALABAMA', abbreviation: 'AL' },
  { name: 'ALASKA', abbreviation: 'AK' },
  { name: 'AMERICAN SAMOA', abbreviation: 'AS' },
  { name: 'ARIZONA', abbreviation: 'AZ' },
  { name: 'ARKANSAS', abbreviation: 'AR' },
  { name: 'CALIFORNIA', abbreviation: 'CA' },
  { name: 'COLORADO', abbreviation: 'CO' },
  { name: 'CONNECTICUT', abbreviation: 'CT' },
  { name: 'DELAWARE', abbreviation: 'DE' },
  { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC' },
  { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM' },
  { name: 'FLORIDA', abbreviation: 'FL' },
  { name: 'GEORGIA', abbreviation: 'GA' },
  { name: 'GUAM', abbreviation: 'GU' },
  { name: 'HAWAII', abbreviation: 'HI' },
  { name: 'IDAHO', abbreviation: 'ID' },
  { name: 'ILLINOIS', abbreviation: 'IL' },
  { name: 'INDIANA', abbreviation: 'IN' },
  { name: 'IOWA', abbreviation: 'IA' },
  { name: 'KANSAS', abbreviation: 'KS' },
  { name: 'KENTUCKY', abbreviation: 'KY' },
  { name: 'LOUISIANA', abbreviation: 'LA' },
  { name: 'MAINE', abbreviation: 'ME' },
  { name: 'MARSHALL ISLANDS', abbreviation: 'MH' },
  { name: 'MARYLAND', abbreviation: 'MD' },
  { name: 'MASSACHUSETTS', abbreviation: 'MA' },
  { name: 'MICHIGAN', abbreviation: 'MI' },
  { name: 'MINNESOTA', abbreviation: 'MN' },
  { name: 'MISSISSIPPI', abbreviation: 'MS' },
  { name: 'MISSOURI', abbreviation: 'MO' },
  { name: 'MONTANA', abbreviation: 'MT' },
  { name: 'NEBRASKA', abbreviation: 'NE' },
  { name: 'NEVADA', abbreviation: 'NV' },
  { name: 'NEW HAMPSHIRE', abbreviation: 'NH' },
  { name: 'NEW JERSEY', abbreviation: 'NJ' },
  { name: 'NEW MEXICO', abbreviation: 'NM' },
  { name: 'NEW YORK', abbreviation: 'NY' },
  { name: 'NORTH CAROLINA', abbreviation: 'NC' },
  { name: 'NORTH DAKOTA', abbreviation: 'ND' },
  { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP' },
  { name: 'OHIO', abbreviation: 'OH' },
  { name: 'OKLAHOMA', abbreviation: 'OK' },
  { name: 'OREGON', abbreviation: 'OR' },
  { name: 'PALAU', abbreviation: 'PW' },
  { name: 'PENNSYLVANIA', abbreviation: 'PA' },
  { name: 'PUERTO RICO', abbreviation: 'PR' },
  { name: 'RHODE ISLAND', abbreviation: 'RI' },
  { name: 'SOUTH CAROLINA', abbreviation: 'SC' },
  { name: 'SOUTH DAKOTA', abbreviation: 'SD' },
  { name: 'TENNESSEE', abbreviation: 'TN' },
  { name: 'TEXAS', abbreviation: 'TX' },
  { name: 'UTAH', abbreviation: 'UT' },
  { name: 'VERMONT', abbreviation: 'VT' },
  { name: 'VIRGIN ISLANDS', abbreviation: 'VI' },
  { name: 'VIRGINIA', abbreviation: 'VA' },
  { name: 'WASHINGTON', abbreviation: 'WA' },
  { name: 'WEST VIRGINIA', abbreviation: 'WV' },
  { name: 'WISCONSIN', abbreviation: 'WI' },
  { name: 'WYOMING', abbreviation: 'WY' },
];

export const checkSignificantLength = (phone, phoneNumber) => {
  return phone.getNumber('significant')?.length === 3
    ? normalizeNumber(phoneNumber)
    : phone.getNumber();
};
