import React, { useState } from 'react';
import styles from './index.module.css';
import Draggable from 'react-draggable';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import CloseIcon from '@material-ui/icons/Close';
import DialerRoundButton from '../DialerRoundButton';
import CallIcon from '@material-ui/icons/Call';
import BackspaceIcon from '@material-ui/icons/Backspace';
import CancelIcon from '@material-ui/icons/Cancel';
import Input from '@material-ui/core/Input';
import PhoneNumber from 'awesome-phonenumber';
import { useStores } from 'hooks/useStores';
import { checkSignificantLength, normalizeNumber } from 'helpers/misc';
import Users from '../Users';

const TABS = [
  { id: 1, label: 'users' },
  { id: 2, label: 'keypad' },
];

const CallDialPad = ({ onClose }) => {
  const { dialer } = useStores();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');

  var ayt = PhoneNumber.getAsYouType('US');

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(ayt.reset(normalizeNumber(event.target.value)));
  };

  const handleKeyPress = (event) => {
    if (!dialer.activeCallLine) {
      if (phoneNumber.length > 0 && event.key === 'Enter') {
        handleStartCall();
      }
    } else {
      const validDigits = normalizeNumber(event.key);
      if (validDigits) {
        dialer.activeCallLine.sendDigits(validDigits);
      }
    }
  };

  const appendPhoneNumber = (number) => {
    if (dialer.activeCallLine) {
      dialer.activeCallLine.sendDigits(number.toString());
    }

    setPhoneNumber(ayt.reset(normalizeNumber(`${phoneNumber}${number}`)));
  };

  const resetPhoneNumber = () => {
    setPhoneNumber(ayt.reset(''));
  };

  const handleBackSpaceClick = () => {
    var nums = [...phoneNumber];
    nums.pop();
    setPhoneNumber(ayt.reset(normalizeNumber(nums.join(''))));
  };

  const handleStartCall = () => {
    let phone = new PhoneNumber(normalizeNumber(phoneNumber), 'US');
    // console.log("handleStartCall", phone, phone ? phone.getNumber() : normalizeNumber(phoneNumber));
    // dialer.dial({ phone: phone ? phone.getNumber() : normalizeNumber(phoneNumber) });
    dialer.startCall(
      phone
        ? checkSignificantLength(phone, phoneNumber)
        : normalizeNumber(phoneNumber),
    );
    // dialer.dialCall({ target: phone ? phone.getNumber() : normalizeNumber(phoneNumber) });
    onClose();
  };

  return (
    <Draggable handle=".dragger" defaultPosition={{ x: 10, y: -340 }}>
      <div className={styles.container}>
        <div className={styles.dialPadHeader}>
          <div
            className={`dragger ${styles.dragger} ${styles.dialPadHeaderIcon}`}
          >
            <DragIndicatorIcon />
          </div>
          <div className={styles.dialPadLabel}></div>
          <div
            onClick={onClose}
            className={`ms-auto ${styles.dialPadHeaderIcon}`}
          >
            <CloseIcon className={styles.cursorPointer} />
          </div>
        </div>

        <div className={styles.tabHeaderBar}>
          {TABS.map((tab, index) => (
            <div
              key={index}
              className={`${styles.tabHeaderItem} ${
                activeTabIndex === index ? styles.active : ''
              }`}
              onClick={() => setActiveTabIndex(index)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: activeTabIndex === 0 ? 'block' : 'none' }}>
            <Users
              icon={<CallIcon />}
              onSubmit={(user) => {
                console.log('DIAL', user);
                // Dial the user
                dialer.startCallUser(user);
                // dialer.dialCall({ sipUserName: user.sip_username });
                onClose();
              }}
            />
          </div>
          <div style={{ display: activeTabIndex === 1 ? 'block' : 'none' }}>
            <div className={styles.numPad}>
              <div className="d-flex flex-row align-items-center">
                <Input
                  id="standard-adornment-weight"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  onKeyPress={handleKeyPress}
                  className={styles.phoneInput}
                  autoFocus
                  placeholder={PhoneNumber.getExample('US').getNumber(
                    'national',
                  )}
                  inputProps={{ min: 0, style: { textAlign: 'center' } }}
                />
                <CancelIcon
                  fontSize="small"
                  className={styles.cursorPointer}
                  style={{ color: 'grey' }}
                  onClick={resetPhoneNumber}
                />
              </div>
              <div className="mt-3">
                <div className="d-flex flex-row">
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(1)}
                  >
                    1
                  </div>
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(2)}
                  >
                    2
                  </div>
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(3)}
                  >
                    3
                  </div>
                </div>
                <div className="d-flex flex-row">
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(4)}
                  >
                    4
                  </div>
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(5)}
                  >
                    5
                  </div>
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(6)}
                  >
                    6
                  </div>
                </div>
                <div className="d-flex flex-row">
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(7)}
                  >
                    7
                  </div>
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(8)}
                  >
                    8
                  </div>
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(9)}
                  >
                    9
                  </div>
                </div>
                <div className="d-flex flex-row">
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber('*')}
                  >
                    *
                  </div>
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber(0)}
                  >
                    0
                  </div>
                  <div
                    className={styles.numPadKey}
                    onClick={() => appendPhoneNumber('#')}
                  >
                    #
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 row no-gutters align-items-center">
              <div className="col-4" />
              <div className="col-4 d-flex justify-content-center">
                <DialerRoundButton
                  icon={<CallIcon />}
                  backgroundColor={
                    phoneNumber || phoneNumber.trim().length > 0
                      ? '#1ABA17'
                      : '#ffffff45'
                  }
                  onClick={
                    phoneNumber || phoneNumber.trim().length > 0
                      ? handleStartCall
                      : null
                  }
                />
              </div>
              <div className="col-4 d-flex justify-content-center">
                {(phoneNumber || phoneNumber.trim().length > 0) && (
                  <BackspaceIcon
                    fontSize="small"
                    className={styles.cursorPointer}
                    onClick={handleBackSpaceClick}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default CallDialPad;
