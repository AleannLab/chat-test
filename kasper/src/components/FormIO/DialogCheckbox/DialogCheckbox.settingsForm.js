import baseEditForm from 'formiojs/components/_classes/component/Component.form';

export default function (...extend) {
  return baseEditForm(
    [
      {
        key: 'display',
        components: [
          {
            type: 'textfield',
            input: true,
            label: 'Dialog Title',
            weight: 12,
            key: 'dlgTitle', // This will be available as component.myCustomSetting
          },
        ],
      },
      {
        key: 'data',
        components: [
          {
            key: 'dataType',
            ignore: true,
          },
        ],
      },
    ],
    ...extend,
  );
}
