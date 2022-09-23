import React, { useEffect, useState } from 'react';
import styles from './ButtonStyledRadioButton.module.css';

export default function ButtonStyledRadioButton(props) {
  const options = props.component.values || [];
  const [checked, setChecked] = useState('');
  const [initialLoad, setInitialLoad] = useState(false);
  const colWidth = props.component.attributes.buttonColWidth || 6;
  function setValue(option) {
    setChecked(option);
    console.log(checked);
  }

  /**
   * setTimeout is used as the data is not immediately loaded in the object
   */
  useEffect(() => {
    setTimeout(() => {
      setChecked(props.everything.dataForSetting);
      setInitialLoad(true);
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    /**
     * Only set state after the component is initially loaded to avoid setting undefined values
     */
    if (initialLoad) {
      props.onChange(checked);
    }
  }, [checked]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="container">
      <div className="row justify-content-around">
        {options.map((option, i) => {
          const cssClass =
            checked !== option.value ? 'btn-secondary' : 'btn-primary';
          return (
            <div
              key={i}
              className={`col-sm-${colWidth} ${styles.radiobuttonSpacing}`}
            >
              <button
                className={`btn ${cssClass} ${styles.radiobutton}`}
                key={option.value}
                onClick={() => setValue(option.value)}
              >
                {props.everything.t(option.label)}
              </button>
            </div>
          );
        })}
      </div>

      {/* <div id="donate">
                <label className="blue">
                    <input type="radio" className={styles.radioOveride} name="toggle" />
                    <span className={styles.spanOveride}>$20</span>
                </label>
                <label className="green">
                    <input type="radio" className={styles.radioOveride} name="toggle" />
                    <span>$50</span>
                </label>
                <label className="yellow"><input type="radio" className={styles.radioOveride} name="toggle" /><span>$100</span></label>
                <label className="pink"><input type="radio" className={styles.radioOveride} name="toggle" /><span>$500</span></label>
                <label className="purple"><input type="radio" className={styles.radioOveride} name="toggle" /><span>$1000</span></label>
            </div> */}
    </div>
  );
}
