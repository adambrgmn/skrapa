import { NextApiRequest, NextApiResponse } from 'next';
import * as Yup from 'yup';
import fetch from 'isomorphic-unfetch';
import { reWebURL } from '../../utils/isValidUrl';
import { extractSelector } from '../../utils/html';
import { isValidationError } from '../../utils';

const schema = Yup.object<Body>({
  url: Yup.string()
    .matches(reWebURL, 'The url provided is not valid')
    .required(),
  selector: Yup.string().required(
    'You need to provide a selector to extract from the url',
  ),
});

export default async (
  req: NextApiRequest & { body: Body },
  res: NextApiResponse<Response | ErrorResponse>,
) => {
  if (req.method !== 'POST') return res.status(403);

  try {
    const body = await schema.validate(req.body);

    const html = await fetch(body.url).then(r => r.text());
    const content = extractSelector(html, body.selector);

    return res.status(200).json({ content });
  } catch (error) {
    if (isValidationError(error)) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export interface Body {
  url: string;
  selector: string;
}

export interface Response {
  content: string;
}

export interface ErrorResponse {
  message: string;
}
