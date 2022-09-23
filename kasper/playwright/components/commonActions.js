const process = require('process');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env-test') });

const PLAYWRIGHT_LOGIN_USER = process.env.PLAYWRIGHT_LOGIN_USER;
const PLAYWRIGHT_LOGIN_PASS = process.env.PLAYWRIGHT_LOGIN_PASS;

const { expect } = require('@playwright/test');

async function login(page) {
  await page.goto(`/login`);
  await expect(page.locator('[placeholder="Enter email"]')).toBeVisible();
  await expect(page.locator('[placeholder="Enter password"]')).toBeVisible();
  await page.locator('[placeholder="Enter email"]').click();
  await page.locator('[placeholder="Enter email"]').fill(PLAYWRIGHT_LOGIN_USER);
  await page.locator('[placeholder="Enter password"]').click();
  await page
    .locator('[placeholder="Enter password"]')
    .fill(PLAYWRIGHT_LOGIN_PASS);
  await expect(page.locator('button:has-text("Log In")')).toBeVisible();
  await page.locator('button:has-text("Log In")').click();
  await page.waitForURL(`/dashboard/office-task`);
}

async function switchTabs(page, tab) {
  /* Pass in the tab name you wish to switch too, should be a string. */
  await expect(page.locator(`id="sidebar-${tab}"`)).toBeVisible();
  await page.locator(`id="sidebar-${tab}"`).click();
}

module.exports = { login, switchTabs };
