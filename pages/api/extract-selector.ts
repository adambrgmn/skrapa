import { NextApiRequest, NextApiResponse } from 'next';
import * as Yup from 'yup';
import fetch from 'isomorphic-unfetch';
import { reWebURL } from '../../utils/isValidUrl';
import { extractSelector } from '../../utils/html';

interface Body {
  url: string;
  selector: string;
}

interface Request extends NextApiRequest {
  body: Body;
}

const schema = Yup.object<Body>({
  url: Yup.string()
    .matches(reWebURL, 'The url provided is not valid')
    .required(),
  selector: Yup.string().required(
    'You need to provide a selector to extract from the url',
  ),
});

export default async (req: Request, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(403);

  try {
    const body = await schema.validate(req.body);

    const html = await fetch(body.url).then(r => r.text());
    const content = extractSelector(html, body.selector);

    res.status(200).json({ content });
  } catch (error) {
    if (isValidationError(error)) {
      return res.status(400).json({ error });
    }

    return res.status(500).json({ status: 'Internal Server Error', error });
  }
};

const isValidationError = (err: any): err is Yup.ValidationError => {
  return err.name === 'ValidationError';
};
