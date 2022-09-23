import ReactDOM from 'react-dom';
import { ReactComponent } from '@formio/react';
import settingsForm from './ReferralComponent.settingsForm';
import ReferralComponent from './ReferralComponent';

export default class Referral extends ReactComponent {
  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return {
      title: 'Referred By',
      icon: 'table',
      group: 'Data',
      documentation: '',
      weight: -10,
      schema: Referral.schema(),
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
      type: 'referral',
      label: 'Referred By',
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
      <ReferralComponent
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.data} // The starting value of the component.
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
