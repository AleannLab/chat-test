import React from 'react';
import ReactDOM from 'react-dom';
import { ReactComponent } from '@formio/react';
import settingsForm from './RadioButton.settingsForm';
// import Modal from 'components/Core/Modal';
// import Button from '@material-ui/core/Button';
// import Checkbox from 'components/Core/Checkbox';
// import FormGroup from '@material-ui/core/FormGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
import ButtonStyledRadioButton from './ButtonStyledRadioButton';

export default class Toggle extends ReactComponent {
  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return {
      title: 'Button Styled Radio',
      icon: 'square',
      group: 'Basic',
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
      type: 'buttonStyledRadioButton',
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
      <ButtonStyledRadioButton
        component={this.component} // These are the component settings if you want to use them to render the component.
        // value={this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        everything={this} // Sending everything to the component to perform operations using settimeout
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
