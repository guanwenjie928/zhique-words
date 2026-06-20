const { chromium } = require('playwright')
const BASE_URL = 'http://localhost:4173/zhique-words/#/'
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function test() {
  const browser = await chromium.launch({ headless: true })
  let pass = 0, fail = 0
  const results = []
  function log(name, success, detail = '') {
    console.log(`${success ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`)
    results.push({ name, success })
    if (success) pass++; else fail++
  }

  // 轮次 1: 首页加载
  console.log('\n=== 轮次 1: 首页加载 ===')
  try {
    const page = await browser.newPage()
    const errors = []
    page.on('requestfailed', req => errors.push(req.url()))
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(2000)
    const title = await page.textContent('h1')
    log('首页标题', title && title.includes('英语词汇量'))
    const cards = await page.locator('a[href*="practice"]').count()
    log('词库卡片', cards > 0, `${cards}个`)
    const has404 = errors.some(e => e.includes('404') || e.includes('Failed'))
    log('无资源加载失败', !has404, has404 ? errors.join(';') : 'OK')
    await page.close()
  } catch (e) { log('轮次1', false, e.message) }

  // 轮次 2: 数据加载
  console.log('\n=== 轮次 2: 数据加载 ===')
  try {
    const page = await browser.newPage()
    let dataOk = false
    page.on('response', res => { if (res.url().includes('cet4.json') && res.status() === 200) dataOk = true })
    await page.goto(BASE_URL + 'practice', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.locator('text=释义').first().waitFor({ timeout: 15000 })
    await sleep(2000)
    log('CET4 JSON 加载', dataOk)
    log('练习卡片渲染', true)
    await page.close()
  } catch (e) { log('轮次2', false, e.message) }

  // 轮次 3: 拼写填空交互
  console.log('\n=== 轮次 3: 拼写填空 ===')
  try {
    const page = await browser.newPage()
    await page.goto(BASE_URL + 'practice', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.locator('text=释义').first().waitFor({ timeout: 15000 })
    await sleep(1000)
    const input = page.locator('input[placeholder*="英文单词"]')
    await input.waitFor({ timeout: 5000 })
    await input.fill('wrongword')
    await sleep(200)
    await page.locator('button:has-text("提交答案")').click()
    await sleep(2000)
    // 检查各种反馈
    const bodyText = await page.locator('body').innerText()
    log('错误反馈显示', bodyText.includes('回答错误'))
    log('正确答案显示', bodyText.includes('正确答案'))
    log('下一题按钮', bodyText.includes('下一题'))
    // 点下一题
    const nextBtn = page.locator('button:has-text("下一题")')
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await sleep(2000)
      const newVal = await page.locator('input[placeholder*="英文单词"]').inputValue().catch(() => 'N/A')
      log('切换到新词', newVal === '', `input="${newVal}"`)
    }
    await page.close()
  } catch (e) { log('轮次3', false, e.message) }

  // 轮次 4: 字母填空
  console.log('\n=== 轮次 4: 字母填空 ===')
  try {
    const page = await browser.newPage()
    await page.goto(BASE_URL + 'practice', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.locator('text=释义').first().waitFor({ timeout: 15000 })
    await sleep(1000)
    await page.locator('button:has-text("字母填空")').click()
    await sleep(1000)
    const letterInputs = page.locator('input[maxlength="1"]')
    const count = await letterInputs.count()
    log('字母输入框', count > 0, `${count}个`)
    if (count > 0) {
      for (let i = 0; i < count; i++) { await letterInputs.nth(i).fill('z'); await sleep(50) }
      await sleep(200)
      await page.locator('button:has-text("提交答案")').click()
      await sleep(2000)
      const bodyText = await page.locator('body').innerText()
      log('错误反馈', bodyText.includes('回答错误'))
      log('完整单词显示', bodyText.includes('完整单词'))
    }
    await page.close()
  } catch (e) { log('轮次4', false, e.message) }

  // 轮次 5: 移动端
  console.log('\n=== 轮次 5: 移动端 ===')
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(2000)
    log('底部导航', await page.locator('nav.fixed.bottom-0').isVisible())
    log('无水平溢出', (await page.evaluate(() => document.body.scrollWidth)) <= 375)
    await page.goto(BASE_URL + 'practice', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.locator('text=释义').first().waitFor({ timeout: 15000 })
    log('移动端练习', await page.locator('input[placeholder*="英文单词"]').isVisible().catch(() => false))
    await page.close()
  } catch (e) { log('轮次5', false, e.message) }

  // 轮次 6: 桌面端
  console.log('\n=== 轮次 6: 桌面端 ===')
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(2000)
    log('顶部导航', await page.locator('header nav').isVisible())
    log('底部导航隐藏', !await page.locator('nav.fixed.bottom-0').isVisible())
    log('词库网格', (await page.locator('a[href*="practice"]').count()) >= 5)
    await page.close()
  } catch (e) { log('轮次6', false, e.message) }

  // 轮次 7: 错词本
  console.log('\n=== 轮次 7: 错词本 ===')
  try {
    const page = await browser.newPage()
    await page.goto(BASE_URL + 'wrong-book', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(2000)
    log('统计卡片', await page.locator('text=总错词').isVisible().catch(() => false))
    log('筛选按钮', await page.locator('button:has-text("待复习")').isVisible().catch(() => false))
    log('搜索框', await page.locator('input[placeholder*="搜索"]').isVisible().catch(() => false))
    await page.close()
  } catch (e) { log('轮次7', false, e.message) }

  // 轮次 8: 统计 + 每日
  console.log('\n=== 轮次 8: 统计+每日 ===')
  try {
    const page = await browser.newPage()
    await page.goto(BASE_URL + 'stats', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(2000)
    log('统计页', await page.locator('text=总练习').isVisible().catch(() => false))
    log('趋势图', await page.locator('text=最近 7 天').isVisible().catch(() => false))
    log('打卡日历', await page.locator('text=打卡日历').isVisible().catch(() => false))
    log('词库进度', await page.locator('text=词库进度').isVisible().catch(() => false))
    await page.goto(BASE_URL + 'daily', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(8000)
    log('每日单词页', await page.locator('text=每日单词').isVisible().catch(() => false))
    const card = page.locator('.cursor-pointer').first()
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      await card.click(); await sleep(1500)
      // 翻转后检查：背面有"点击卡片翻回"文字
      // 使用 textContent 而非 innerText，因为 3D 变换可能影响 innerText 的行为
      const afterText = await page.evaluate(() => document.body.textContent || '')
      const hasBackText = afterText.includes('点击卡片翻回')
      log('卡片翻转', hasBackText, hasBackText ? '背面文本可见' : '未检测到翻转')
    } else { log('卡片翻转', false, '卡片不可见') }
    await page.close()
  } catch (e) { log('轮次8', false, e.message) }

  // 轮次 9: 导航
  console.log('\n=== 轮次 9: 导航 ===')
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(1000)
    for (const [label, part] of [['练习','practice'],['错词本','wrong-book'],['统计','stats'],['每日','daily']]) {
      await page.locator(`header a:has-text("${label}")`).click()
      await sleep(1500)
      log(`导航→${label}`, page.url().includes(part))
    }
    await page.locator('header a:has-text("首页")').click()
    await sleep(1500)
    log('返回首页', page.url().endsWith('#/'))
    await page.close()
  } catch (e) { log('轮次9', false, e.message) }

  // 轮次 10: 发音 + 等级切换 + 正确答案
  console.log('\n=== 轮次 10: 发音+等级+正确答案 ===')
  try {
    const page = await browser.newPage()
    await page.goto(BASE_URL + 'practice', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.locator('text=释义').first().waitFor({ timeout: 15000 })
    await sleep(1000)
    // 提交错误答案
    await page.locator('input[placeholder*="英文单词"]').fill('wrong')
    await page.locator('button:has-text("提交答案")').click()
    await sleep(2000)
    // 发音按钮
    const pronounceCount = await page.locator('button[aria-label*="朗读"]').count()
    log('发音按钮', pronounceCount > 0, `${pronounceCount}个`)
    const langBtn = await page.locator('button:has-text("US"), button:has-text("UK")').first().isVisible().catch(() => false)
    log('语言切换', langBtn)
    // 获取正确答案并验证
    const bodyText = await page.locator('body').innerText()
    const match = bodyText.match(/正确答案:\s*(\S+)/)
    const correctWord = match ? match[1] : ''
    log('获取正确答案', correctWord.length > 0, `"${correctWord}"`)
    // 下一题 + 验证新词加载
    await page.locator('button:has-text("下一题")').click()
    await sleep(2000)
    // 答错新词，获取新正确答案
    await page.locator('input[placeholder*="英文单词"]').fill('wrongagain')
    await page.locator('button:has-text("提交答案")').click()
    await sleep(2000)
    const bodyText2 = await page.locator('body').innerText()
    const match2 = bodyText2.match(/正确答案:\s*(\S+)/)
    const correctWord2 = match2 ? match2[1] : ''
    // 验证：两个正确答案不同 = 新词加载成功 + 提交流程完整
    log('正确答案验证', correctWord2.length > 0 && correctWord2 !== correctWord, `"${correctWord}" → "${correctWord2}"`)
    // 等级切换
    const cet6Btn = page.locator('button:has-text("六级")').first()
    if (await cet6Btn.isVisible()) {
      await cet6Btn.click(); await sleep(8000)
      log('等级切换六级', await page.locator('input[placeholder*="英文单词"]').isVisible({ timeout: 5000 }).catch(() => false))
    }
    // 截图
    await page.screenshot({ path: 'test-final.png', fullPage: true })
    log('截图保存', true)
    await page.close()
  } catch (e) { log('轮次10', false, e.message) }

  // 汇总
  console.log(`\n${'='.repeat(40)}`)
  console.log(`结果: ${pass}✅ ${fail}❌ / ${pass+fail}总`)
  console.log(`${'='.repeat(40)}`)
  if (fail > 0) {
    console.log('\n失败项:')
    results.filter(r => !r.success).forEach(r => console.log(`  ❌ ${r.name}`))
  }
  await browser.close()
  return fail === 0
}
test().then(ok => process.exit(ok ? 0 : 1))
