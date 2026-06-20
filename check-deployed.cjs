const { chromium } = require('playwright')

async function check() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const errors = []
  const consoleMsgs = []
  const failedRequests = []

  page.on('console', msg => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => errors.push(err.message))
  page.on('requestfailed', req => failedRequests.push(`${req.url()} - ${req.failure()?.errorText}`))

  console.log('Navigating to deployed site...')
  await page.goto('https://guanwenjie928.github.io/zhique-words/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  
  // Wait a bit for React to render
  await page.waitForTimeout(5000)

  // Check if root has content
  const rootHTML = await page.evaluate(() => {
    const root = document.getElementById('root')
    return root ? root.innerHTML.length : -1
  })
  console.log('Root innerHTML length:', rootHTML)

  // Check page title
  const title = await page.title()
  console.log('Page title:', title)

  // Check body text
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500))
  console.log('Body text:', bodyText)

  // Screenshot
  await page.screenshot({ path: 'deployed-check.png', fullPage: true })
  console.log('Screenshot saved: deployed-check.png')

  console.log('\n=== Console Messages ===')
  consoleMsgs.forEach(m => console.log(m))
  
  console.log('\n=== Page Errors ===')
  errors.forEach(e => console.log(e))

  console.log('\n=== Failed Requests ===')
  failedRequests.forEach(r => console.log(r))

  await browser.close()
}

check().catch(e => { console.error('Fatal:', e.message); process.exit(1) })
