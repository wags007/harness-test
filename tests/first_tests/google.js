import { check, sleep } from 'k6';
import { browser } from 'k6/browser';
import { Trend, Rate } from 'k6/metrics';

const url = __ENV.BASE_URL || 'https://www.google.com';
const iterationsCount = __ENV.iterations || 10;
const responseTimeTrend = new Trend('total_action_time', true);
const successRate = new Rate('successful_requests');

export const options = {
    scenarios: {
      homepage: {
        iterations: iterationsCount,
        executor: 'shared-iterations',
        options: {
          browser: {
            type: 'chromium',
          },
        },
      },
    },
  };


export default async function () {
    const page = await browser.newPage();

    try {
        const res = await page.goto(url, 
          {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          timeout: 6000,
          waitUntil: "networkidle",
        });
        // Wait until we can find the search input field and click in it to create INP 
        await page.locator('[aria-label="Search"]').click();
      
        // Mark the time when the page was visited        
        await page.evaluate(() => window.performance.mark('page-visit'));
        // Perform some actions
        await page.evaluate(() => window.performance.mark('action-completed'));

        // Get time difference between visiting the page and completing the actions
        await page.evaluate(() =>
        window.performance.measure('total-action-time', 'page-visit', 'action-completed')
        );
        const totalActionTime = await page.evaluate(
            () =>
              JSON.parse(JSON.stringify(window.performance.getEntriesByName('total-action-time')))[0]
                .duration
          );

        responseTimeTrend.add(totalActionTime);
        successRate.add(res.status() === 200);
        check(res, {
          'is status 200': (r) => res.status() === 200,
        });
    } finally {
        await page.close();
    }
    console.log("url is:" + url);
  
  sleep(1);
}
