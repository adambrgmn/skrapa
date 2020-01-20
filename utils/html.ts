import cheerio from 'cheerio';

export const extractSelector = (html: string, selector: string) => {
  const $ = cheerio.load(html, { xmlMode: true });
  const nodes = $(selector);
  console.log(nodes);
  return nodes.text().trim();
};
