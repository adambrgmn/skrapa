import { NextApiRequest, NextApiResponse } from 'next';
import Yup from 'yup';

interface Body {
  links: string[];
}
interface Request extends NextApiRequest {
  body: Body;
}

const schema = Yup.object<Body>({
  links: Yup.array(Yup.string())
    .min(1, 'At least one link needs to be provided')
    .max(10, 'No more than ten links are allowed per request')
    .required('An array of links must be provided'),
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
