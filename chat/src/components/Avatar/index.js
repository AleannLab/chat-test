import React from 'react';
import PropTypes from 'prop-types';
import { Avatar } from '@material-ui/core';
import { generateColor } from 'helpers/misc';

const CustomAvatar = ({
  id,
  src,
  firstName,
  lastName,
  mobileNo,
  width,
  height,
  className,
  letterFontSize,
  customLetter,
  ...props
}) => {
  // console.log({id, color: generateColor(id)})
  return src ? (
    <Avatar
      src={src}
      style={{ width, height }}
      className={className}
      {...props}
    />
  ) : (
    <Avatar
      style={{
        backgroundColor: generateColor(id) || '#FFFFFF',
        width,
        height,
      }}
      className={className}
      {...props}
    >
      <span
        style={{
          fontSize: letterFontSize,
        }}
      >
        {(!!firstName && firstName.length) ||
        (!!lastName && lastName.length) ? (
          <>
            {!!firstName && firstName.length
              ? firstName.charAt(0).toLocaleUpperCase()
              : ''}
            {!!lastName && lastName.length
              ? lastName.charAt(0).toLocaleUpperCase()
              : ''}
          </>
        ) : mobileNo ? (
          mobileNo?.slice(-2)
        ) : customLetter ? (
          customLetter
        ) : (
          '?'
        )}
      </span>
    </Avatar>
  );
};

CustomAvatar.propTypes = {
  /** id is required to generate color based on it if src (image url) is not present */
  id: PropTypes.number.isRequired,
  /** src is the image url for Avatar */
  src: PropTypes.string,
  /** Name for first letter */
  firstName: PropTypes.string,
  /** Name for second letter */
  lastName: PropTypes.string,
  /** If firstName and lastName do not exist, fallback to mobileNo */
  mobileNo: PropTypes.string,
  /** Width of Avatar. Can be number which defaults to px or specify in px/rem */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Height of Avatar. Can be number which defaults to px or specify in px/rem */
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** className to override default styles if required */
  className: PropTypes.string,
  /** Font size of letters displayed inside the Avatar. Can be number which defaults to px or specify in px/rem */
  letterFontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Custom letter to show in case none of the criteria's are satisfied */
  customLetter: PropTypes.string,
};

CustomAvatar.defaultProps = {
  id: 0,
  src: null,
  firstName: null,
  lastName: null,
  mobileNo: null,
  width: 40,
  height: 40,
  className: null,
  letterFontSize: '0.85rem',
  customLetter: null,
};

export default CustomAvatar;
