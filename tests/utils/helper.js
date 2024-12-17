export default async function handleConsentButton(page) {
  const oneTrustButton = await page
    .waitForSelector("#onetrust-accept-btn-handler", { timeout: 5000 })
    .catch(() => null);
  if (oneTrustButton) {
    await oneTrustButton.click();
    console.log("OneTrust consent button clicked.");
  } else {
    console.log("OneTrust consent button not found.");
  }
}

export default async function clickButton(page, selector, buttonName) {
  try {
    const button = await page.waitForSelector(selector, { timeout: 10000 });
    await button.click();
    console.log(`${buttonName} clicked.`);
  } catch (error) {
    console.log(`${buttonName} not found:`, error);
  }
}

export default async function navigateToMakeupSection(page) {
  try {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector(".Avatar button", { timeout: 60000 });
    const shopButton = await page.waitForSelector(".PrimaryLinks li button", {
      timeout: 10000,
    });
    await shopButton.click();
    console.log("Shop button clicked.");
    const makeUpSelector =
      '[aria-label="Shop"] [aria-controls="4466ab94-a0b4-4219-980d-52485f16e739"]';
    // const makeUpSelector = '[aria-label="Shop"] [aria-controls="734438bb-f9f7-4596-a360-fc2b34a333c0"]'; // stress
    await (await page.waitForSelector(makeUpSelector)).click();
    console.log("Makeup section clicked.");
  } catch (error) {
    console.log("Error finding Shop button:", error);
  }
}
export default async function navigateToFoundation(page) {
  try {
    await page.waitForLoadState("domcontentloaded");
    const foundationButton = await page.waitForSelector(
      ".NavigationLinksSubGroup__item a",
      { timeout: 20000 }
    );
    await Promise.all([
      foundationButton.click(),
      page.waitForNavigation({ waitUntil: "networkidle" }),
    ]);
    console.log("Foundation link clicked.");

    const PDPageLink = await page.waitForSelector(".ProductCard a", {
      timeout: 40000,
    });
    await PDPageLink.click();
    console.log("Product detail page link clicked.");
  } catch (error) {
    console.log("Error navigating to Foundation:", error);
  }
}

export default async function signIn(page, email, password, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.locator('[aria-label="Email address"]').type(email);
      await page.locator('[aria-label="Password"]').type(password);
      await clickButton(page, ".SignIn__submit button", "Sign In");
      return true;
    } catch (error) {
      console.log(`Sign In attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        console.log("Max retries reached. Exiting sign-in process.");
        await page.screenshot({ path: "sign_in_error.png" });
        return false;
      } else {
        console.log("Retrying...");
        await page.waitForTimeout(1000);
      }
    }
  }
}

export default async function checkTheLoggedInUserIcon(page) {
  try {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector(".Avatar button", { timeout: 20000 });
    console.log("User icon is visible.");
  } catch (error) {
    console.error("Error checking the logged-in user icon:", error);
    await page.close();
  }
}

export default async function clickButtonWithRetries(page, selector, maxRetries = 3) {
  // Initial wait for the button to be available
  await page.waitForSelector(selector, { timeout: 20000 });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Calculate the timeout for the current attempt
      const attemptTimeout = 10000 + (attempt - 1) * 10000;
      const button = await page.waitForSelector(selector, {
        timeout: attemptTimeout,
      });
      await button.click();
      console.log(`Button clicked successfully on attempt ${attempt}.`);
      return true; // Return true on success
    } catch (error) {
      console.log(`Attempt ${attempt} to click button failed:`, error);
      if (attempt === maxRetries) {
        console.log("Max retries reached. Exiting button click process.");

        return false; // Return false on failure
      }
      await page.waitForTimeout(1000); // Wait before retrying
    }
  }
}

export default function  formUrl(environment,domain,ephemeral,page){
  if(environment === 'qa1'){
    if(ephemeral){
       return `${domain}?User-Agent=gomez&env=qaephemeral-${ephemeral}`;
    }
    else if(page){
     return `${domain}${page}?User-Agent=gomez&env=`;
  } 
  else{
   return `${domain}?User-Agent=gomez `;
  }
}else{
    if(page){
     return `${domain}${page}`;
    }
    else{
      return `${domain}`;
    }
  }
}
