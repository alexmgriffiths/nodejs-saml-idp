import express, { json, urlencoded, Express, Request, Response } from 'express';
import { Constants, setSchemaValidator, IdentityProvider, ServiceProvider } from 'samlify';
import cors from 'cors';
import * as validator from '@authenio/samlify-xsd-schema-validator';
import { readFileSync } from 'fs';

const app: Express = express();

app.use(json());
app.use(urlencoded({extended: true}));
app.use(cors());

setSchemaValidator(validator);

app.get('/api/version', (_req: Request, res: Response) => {
    return res.status(200).json({status: 200, version: '1.0.0'});
});

const idp = IdentityProvider({
    metadata: readFileSync(__dirname + '/../metadata/idp-metadata.xml'),
});

const sp = ServiceProvider({
    metadata: readFileSync(__dirname + '/../metadata/sp-metadata.xml')
});

app.post('/api/sso/saml2/sp/acs', async (req, res) => {
    try {
        const parseResult = await sp.parseLoginResponse(idp, Constants.wording.binding.post, req)
        return res.status(200).send(parseResult.extract.attributes);
    } catch (e) {
        console.log(e)
        return res.status(500).send()
    }
});

app.listen(5001, () => {
    console.log("App listening on port 5001");
});