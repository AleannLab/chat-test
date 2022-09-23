import baseEditForm from 'formiojs/components/_classes/component/Component.form';

export default (...extend) => {
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
        ignore: true,
        components: [],
      },
      {
        key: 'validation',
        ignore: true,
        components: [],
      },
      {
        key: 'api',
        ignore: false,
        components: [],
      },
      {
        key: 'conditional',
        ignore: true,
        components: [],
      },
      {
        key: 'logic',
        ignore: true,
        components: [],
      },
      {
        key: 'layout',
        ignore: true,
        components: [],
      },
      {
        key: 'addons',
        ignore: true,
        components: [],
      },
    ],
    ...extend,
  );
};
