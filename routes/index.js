const express = require('express');
const Parser = require('rss-parser');
const mcache = require('memory-cache');

const router = express.Router();
const parser = new Parser();

const cache = (duration) => (req, res, next) => {
  const key = `__express__${req.originalUrl}` || req.url;
  const cachedBody = mcache.get(key);
  if (cachedBody) {
    res.send(cachedBody);
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  }
};

// https://inv01back.herokuapp.com/

function extractDate(mas = [], linkdom = '') {
  const masTmp = [];
  mas.forEach((item) => {
    masTmp.push({
      linkdom,
      title: item.title ? item.title : '',
      link: item.link ? item.link : '',
      img: item.enclosure ? item.enclosure.url : '',
      content: item.content ? item.content : '',
      contentSnippet: item.contentSnippet ? item.contentSnippet : '',
      date: item.isoDate ? new Date(item.isoDate).toLocaleDateString('ru') : '',
    });
  });
  return masTmp;
}

router.get('/api/rss', cache(3600), (req, res, next) => {
  (async () => {
    let mas = [];
    let rssMos = [];
    let rssLenta = [];

    try {
      rssMos = await parser.parseURL('https://www.mos.ru/rss');
    } catch (e) {
      console.log('ERROR: www.mos.ru/rss');
      return next(e);
    }
    try {
      rssLenta = await parser.parseURL('https://lenta.ru/rss/news');
    } catch (e) {
      console.log('ERROR: lenta.ru/rss/news');
      return next(e);
    }

    mas = extractDate(rssMos.items, 'www.mos.ru')
      .concat(extractDate(rssLenta.items, 'www.lenta.ru'));

    await res.json(mas.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate)));
  })();
});

module.exports = router;
