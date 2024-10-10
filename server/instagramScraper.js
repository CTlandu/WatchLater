const puppeteer = require('puppeteer');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 });

async function scrapeInstagramProfile(username) {
  const cacheKey = `instagram_${username}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('使用缓存的Instagram数据:', username);
    return cachedData;
  }

  console.log('获取Instagram用户数据:', username);
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });
  const page = await browser.newPage();

  try {
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);

    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    console.log('正在访问Instagram Reels页面...');
    await page.goto(`https://www.instagram.com/${username}/reels/`, { waitUntil: 'networkidle2' });

    console.log('处理登录弹窗...');
    await handleLoginPopup(page);

    console.log('等待页面加载...');
    await waitForSelector(page, 'header section', 60000);

    // 添加短暂等待
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('获取用户信息和Reels信息...');
    const result = await getUserInfoAndReels(page);

    console.log('所有数据获取成功:', result);

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('获取Instagram数据时出错:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function handleLoginPopup(page) {
  try {
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
    console.log('检测到登录弹窗，尝试关闭...');
    await page.click('button[aria-label="关闭"]');
    console.log('成功关闭登录弹窗');
  } catch (error) {
    console.log('没有检测到登录弹窗或关闭失败，继续执行...');
  }
}

async function waitForSelector(page, selector, timeout) {
  try {
    await page.waitForSelector(selector, { timeout });
  } catch (error) {
    console.error(`等待选择器 "${selector}" 超时`);
    throw error;
  }
}

async function getUserInfoAndReels(page) {
  return await page.evaluate(() => {
    const header = document.querySelector('header section');
    let avatarUrl = '';

    const profileImg = document.querySelector('img[alt*="的头像"]');
    if (profileImg && profileImg.src) {
      avatarUrl = profileImg.src;
    }

    const statsElements = header.querySelectorAll('ul li');

    const extractNumber = (text) => {
      const match = text.match(/([\d,.]+)\s*([KMkm万])?/);
      if (match) {
        let num = parseFloat(match[1].replace(/,/g, ''));
        const unit = match[2] ? match[2].toLowerCase() : null;
        if (unit === 'k' || unit === '千') {
          num *= 1000;
        } else if (unit === 'm' || unit === '百万') {
          num *= 1000000;
        } else if (unit === '万') {
          num *= 10000;
        }
        return Math.round(num);
      }
      return 0;
    };

    const profileInfo = {
      avatar: avatarUrl,
      followers: extractNumber(statsElements[1] ? statsElements[1].textContent : '0'),
      posts: extractNumber(statsElements[0] ? statsElements[0].textContent : '0'),
      following: extractNumber(statsElements[2] ? statsElements[2].textContent : '0'),
    };

    const reelsContainer = document.querySelector('div._ac7v._aang');
    let reelsInfo = [];
    if (reelsContainer) {
      const reels = reelsContainer.querySelectorAll('div._aabd._aa8k._al3l');
      reelsInfo = Array.from(reels)
        .slice(0, 3)
        .map((reel) => {
          const link = reel.querySelector('a');
          const img = reel.querySelector('img');
          const viewCount = reel.querySelector('span.html-span.xdj266r');

          let reelId = '';
          if (link && link.href) {
            const match = link.href.match(/\/reel\/([^/]+)\//);
            reelId = match ? match[1] : '';
          }

          return {
            id: reelId,
            thumbnail: img ? img.src : '',
            url: `https://www.instagram.com/reel/${reelId}/`,
            views: viewCount ? viewCount.textContent : 'N/A',
          };
        });
    }

    return {
      ...profileInfo,
      recentReels: reelsInfo,
    };
  });
}

module.exports = { scrapeInstagramProfile };
