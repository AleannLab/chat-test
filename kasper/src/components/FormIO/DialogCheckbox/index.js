import React, { Component } from 'react';
import styles from './index.module.css';
import ReactDOM from 'react-dom';
import { ReactComponent } from '@formio/react';
import settingsForm from './DialogCheckbox.settingsForm';
import Modal from 'components/Core/Modal';
import Checkbox from 'components/Core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

/**
 * An example React component
 *
 * Replace this with your custom react component. It needs to have two things.
 * 1. The value should be stored is state as "value"
 * 2. When the value changes, call props.onChange(null, newValue);
 *
 * This component is very simple. When clicked, it will set its value to "Changed".
 */
class ToggleCustomComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      isOpen: false,
      checked: '',
    };
  }

  handleApply = (e) => {
    let that = this.props.parent;
    this.props.component.calculateValue = this.state.value;
    this.setState({ isOpen: !this.state.isOpen });
    let payload = {
      whole: this.state.value,
      action: 'apply',
    };
    that.emit(that.interpolate(that.component.key + ':apply'), payload);
    that.events.emit(that.interpolate(that.component.key + ':apply'), payload);
    that.emit('customEvent', {
      type: that.interpolate(that.component.key + ':apply'),
      component: that.component,
      data: payload,
      event: e,
    });
  };

  setValue(value, e) {
    let that = this.props.parent;
    console.log('that', that);

    if (this.state.value.includes(value.value)) {
      let newArray = this.state.value.filter((el) => el !== value.value);
      that.emit(that.interpolate(that.component.key + ':remove'), {
        whole: newArray,
        action: 'remove',
        category: value.value,
      });
      that.events.emit(that.interpolate(that.component.key + ':remove'), {
        whole: newArray,
        action: 'remove',
        category: value.value,
      });
      that.emit('customEvent', {
        type: that.interpolate(that.component.key + ':remove'),
        component: that.component,
        data: {
          whole: newArray,
          action: 'remove',
          category: value.value,
        },
        event: e,
      });
      this.setState({ value: newArray });
    } else {
      this.setState(
        (previousState) => ({
          value: [...previousState.value, value.value],
        }),
        () => {
          that.emit(that.interpolate(that.component.key + ':add'), {
            whole: this.state.value,
            action: 'add',
            category: value.value,
          });
          that.events.emit(that.interpolate(that.component.key + ':add'), {
            whole: this.state.value,
            action: 'add',
            category: value.value,
          });
          that.emit('customEvent', {
            type: that.interpolate(that.component.key + ':add'),
            component: that.component,
            data: {
              whole: this.state.value,
              action: 'add',
              category: value.value,
            },
            event: e,
          });
        },
      );
    }
  }

  render() {
    console.log('this.props.parent.events', this.props.parent.events);
    if (this.state.isOpen === false) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state.value = [];
    }
    return (
      <>
        <button
          className={`secondary-btn w-100 ${styles.formButton}`}
          onClick={() => {
            this.setState({ isOpen: !this.state.isOpen });
          }}
          fullWidth
        >
          {this.props.component.label || 'View More '}
        </button>
        {this.state.isOpen && (
          <Modal
            size="sm"
            header={
              <h4>
                <strong>
                  {this.props.component.dlgTitle || 'Please Select'}
                </strong>
              </h4>
            }
            body={
              <div className={styles.container}>
                <div id="data-container" className={styles.conditionsList}>
                  {this.props.component.values
                    ? this.props.component.values.map((value, i) => (
                        <div id="dialog-data" key={i}>
                          <FormGroup>
                            <FormControlLabel
                              value={value.value}
                              control={
                                <Checkbox
                                  onChange={(e) => this.setValue(value, e)}
                                />
                              }
                              label={
                                <span style={{ fontFamily: 'Montserrat' }}>
                                  {value.label}
                                </span>
                              }
                            />
                          </FormGroup>
                        </div>
                      ))
                    : null}
                </div>

                <div className={styles.footer}>
                  <button
                    className={`secondary-btn mt-3 mx-auto ${styles.formButton}`}
                    onClick={this.handleApply}
                  >
                    Apply
                  </button>
                </div>
              </div>
            }
          />
        )}
      </>
    );
  }
}

export default class Toggle extends ReactComponent {
  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return {
      title: 'DialogCheckBox',
      icon: 'square',
      group: 'Data',
      documentation: '',
      weight: -10,
      schema: Toggle.schema(),
    };
  }

  /**
   * This function is the default settings for the component. At a minimum you want to set the type to the registered
   * type of your component (i.e. when you call Components.setComponent('type', MyComponent) these types should match.
   *
   * @param sources
   * @returns {*}
   */
  static schema() {
    return ReactComponent.schema({
      type: 'dialogCheckBox',
      label: 'Default Label',
    });
  }

  /*
   * Defines the settingsForm when editing a component in the builder.
   */
  static editForm = settingsForm;

  /**
   * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
   *
   * @param DOMElement
   * #returns ReactInstance
   */
  attachReact(element) {
    // eslint-disable-next-line react/no-render-return-value
    return ReactDOM.render(
      <ToggleCustomComp
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        parent={this}
      />,
      element,
    );
  }

  /**
   * Automatically detach any react components.
   *
   * @param element
   */
  detachReact(element) {
    if (element) {
      ReactDOM.unmountComponentAtNode(element);
    }
  }
}
