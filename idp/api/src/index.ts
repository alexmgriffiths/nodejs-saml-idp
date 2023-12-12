import express, { Express, Request, Response } from 'express';
import { createTemplateCallback, idp, sp } from './saml';
import { Constants } from 'samlify';
import cors from 'cors';

const app: Express = express();
app.use(express.json());
app.use(cors());
app.get('/api/version', (_req: Request, res: Response) => {
    return res.status(200).json({status: 200, version: '1.0.0'});
});

app.post('/api/sso/saml2/idp/login', async (req: Request, res: Response) => {
    try {
        const user = { email: 'user@gmail.com' };
        const requestId = req.body.requestId;
        const info = { extract: { request: { id: requestId }}};
        const { context, entityEndpoint } = await idp.createLoginResponse(sp, info, Constants.wording.binding.post, user, createTemplateCallback(idp, sp, user.email));
        res.status(200).send({ samlResponse: context, entityEndpoint })
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

app.listen(5000, () => {
    console.log("App listening on port 5000");
});
