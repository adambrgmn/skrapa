import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
import { createReadStream } from 'fs';
import { parseStream, extractUrls } from '../../utils/sheet';

const parseRequest = (
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (error, fields, files) => {
      if (error) return reject(error);
      return resolve({ fields, files });
    });
  });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(403).json({ status: 'Forbidden' });
  }

  try {
    const { files } = await parseRequest(req);
    const fileStream = createReadStream(files.workbook.path);
    const workbook = await parseStream(fileStream);
    const links = extractUrls(workbook);

    return res.status(200).json({ links });
  } catch (error) {
    res.status(500).json({ status: 'Internal Server Error', error });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
