import styles from './index.module.css';
import { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ChromePicker } from 'react-color';
import { Popover, Typography, Button } from '@material-ui/core';
import { useStores } from 'hooks/useStores';
import Loader from './Loader';

const BrandColor = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [pickerColor, setPickerColor] = useState(null);
  const { notification, officeProfile } = useStores();

  useEffect(() => {
    setSelectedColor(officeProfile.data.office_brand_color);
    setPickerColor(officeProfile.data.office_brand_color);
  }, [officeProfile.data]);

  const showColorPicker = useMemo(() => {
    return Boolean(anchorEl);
  }, [anchorEl]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = async () => {
    setSelectedColor(pickerColor);
    handleClose();
    setBrandLogo();
  };

  const setBrandLogo = async () => {
    try {
      await officeProfile.updateBrandColor(pickerColor);
      notification.showSuccess('Brand color updated successfully');
      await officeProfile.fetchData();
    } catch (error) {
      notification.showError(
        'An unexpected error occurred while attempting to update brand color',
      );
    }
  };

  return (
    <div className={`d-flex flex-column align-items-start ${props.className}`}>
      {!officeProfile.loaded || officeProfile.isLoading.office_brand_color ? (
        <Loader />
      ) : (
        <div className="d-flex flex-column align-items-center">
          <div
            onClick={handleClick}
            className={styles.brandColorView}
            style={{ backgroundColor: selectedColor }}
          ></div>
          <Typography
            variant="p"
            color="textPrimary"
            className={styles.brandColorText}
          >
            {selectedColor}
          </Typography>
        </div>
      )}

      <Popover
        open={showColorPicker}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <ChromePicker
          color={pickerColor}
          onChange={(color) => setPickerColor(color.hex)}
          className={styles.colorPicker}
          disableAlpha
        />
        <div className="p-4 pt-2 d-flex flex-row justify-content-between">
          <Button variant="outlined" color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="secondary" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </Popover>
    </div>
  );
};

export default observer(BrandColor);
