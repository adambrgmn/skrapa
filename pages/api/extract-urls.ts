import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
import { createReadStream } from 'fs';
import { parseStream, extractUrls, SheetUrl } from '../../utils/sheet';

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

export default async (
  req: NextApiRequest & { body: Body },
  res: NextApiResponse<Response | ErrorResponse>,
) => {
  if (req.method !== 'POST') {
    return res.status(403).json({ message: 'Only method POST allowed' });
  }

  try {
    const { files } = await parseRequest(req);
    const fileStream = createReadStream(files.workbook.path);
    const workbook = await parseStream(fileStream);
    const urls = extractUrls(workbook);

    return res.status(200).json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export type Body = FormData;

export interface Response {
  urls: SheetUrl[];
}

export interface ErrorResponse {
  message: string;
}
