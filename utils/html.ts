import cheerio from 'cheerio';

export const extractSelector = (html: string, selector: string) => {
  const $ = cheerio.load(html);
  const nodes = $(selector);
  return nodes.text().trim();
};
