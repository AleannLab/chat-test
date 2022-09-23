function createStringFromTemplate(template, variables) {
  return template.replace(
    new RegExp('{([^{]+)}', 'g'),
    function (_unused, varName) {
      return variables.find((v) => v.variable === `{${varName}}`)?.value || '';
    },
  );
}

export const replaceVariables = (message, variables) => {
  if (message === undefined) {
    return '';
  }
  return createStringFromTemplate(message, variables);
};
