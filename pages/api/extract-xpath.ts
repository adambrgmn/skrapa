import { NextApiRequest, NextApiResponse } from 'next';
import Yup from 'yup';
import { reWebURL } from '../../utils/isValidUrl';

interface Body {
  url: string;
  xpath: string;
}

interface Request extends NextApiRequest {
  body: Body;
}

const schema = Yup.object<Body>({
  url: Yup.string()
    .matches(reWebURL, 'The url provided is not valid')
    .required(),
  xpath: Yup.string().required(
    'You need to provide an xpath to extract from the url',
  ),
});

export default async (req: Request, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(403);

  try {
    const body = await schema.validate(req.body);
    res.status(200).json({ body });
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
