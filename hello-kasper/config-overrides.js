const { addDecoratorsLegacy, useEslintRc, override } = require("customize-cra");

module.exports = override(addDecoratorsLegacy());
