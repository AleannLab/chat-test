const process = require('process');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env-test') });
const { test, expect } = require('@playwright/test');
const { login } = require(path.join(
  process.cwd(),
  '/playwright/components/commonActions',
)); // path has to be altered based on your folder structure

test('Test Login', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(`/dashboard/office-task`);
});
