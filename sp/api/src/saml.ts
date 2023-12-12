import { readFileSync } from 'fs';
import { ServiceProvider, Constants, SamlLib, IdentityProvider } from 'samlify';
import { addMinutes } from 'date-fns';
import { generateRequestID } from './helpers';

export const createTemplateCallback = (idp: any, sp: any, email: any) => (template: any) => {
    const assertionConsumerServiceUrl = sp.entityMeta.getAssertionConsumerService(Constants.wording.binding.post)

    const nameIDFormat = idp.entitySetting.nameIDFormat
    const selectedNameIDFormat = Array.isArray(nameIDFormat) ? nameIDFormat[0] : nameIDFormat

    const id = generateRequestID()
    const now = new Date()
    const fiveMinutesLater = addMinutes(now, 5)

    const tagValues = {
        ID: id,
        AssertionID: generateRequestID(),
        Destination: assertionConsumerServiceUrl,
        Audience: sp.entityMeta.getEntityID(),
        EntityID: sp.entityMeta.getEntityID(),
        SubjectRecipient: assertionConsumerServiceUrl,
        Issuer: idp.entityMeta.getEntityID(),
        IssueInstant: now.toISOString(),
        AssertionConsumerServiceURL: assertionConsumerServiceUrl,
        StatusCode: 'urn:oasis:names:tc:SAML:2.0:status:Success',
        ConditionsNotBefore: now.toISOString(),
        ConditionsNotOnOrAfter: fiveMinutesLater.toISOString(),
        SubjectConfirmationDataNotOnOrAfter: fiveMinutesLater.toISOString(),
        NameIDFormat: selectedNameIDFormat,
        NameID: email,
        InResponseTo: 'null',
        AuthnStatement: '',
        attrFirstName: 'Jon',
        attrLastName: 'Snow',
    }

    return {
        id,
        context: SamlLib.replaceTagsByValue(template, tagValues)
    }
}

// Todo call this dynamically based on url for sp
export const sp = ServiceProvider({
    metadata: readFileSync(__dirname + '/../metadata/sp-metadata.xml')
});

export const idp = IdentityProvider({
    metadata: readFileSync(__dirname + '/../metadata/idp-metadata.xml'),
    privateKey: readFileSync(__dirname + '/../keys/idp/private_key.pem'),
    privateKeyPass: 'jXmKf9By6ruLnUdRo90G',
    isAssertionEncrypted: false,
    loginResponseTemplate: {
        context: '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="{ID}" Version="2.0" IssueInstant="{IssueInstant}" Destination="{Destination}" InResponseTo="{InResponseTo}"><saml:Issuer>{Issuer}</saml:Issuer><samlp:Status><samlp:StatusCode Value="{StatusCode}"/></samlp:Status><saml:Assertion ID="{AssertionID}" Version="2.0" IssueInstant="{IssueInstant}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Issuer>{Issuer}</saml:Issuer><saml:Subject><saml:NameID Format="{NameIDFormat}">{NameID}</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData NotOnOrAfter="{SubjectConfirmationDataNotOnOrAfter}" Recipient="{SubjectRecipient}" InResponseTo="{InResponseTo}"/></saml:SubjectConfirmation></saml:Subject><saml:Conditions NotBefore="{ConditionsNotBefore}" NotOnOrAfter="{ConditionsNotOnOrAfter}"><saml:AudienceRestriction><saml:Audience>{Audience}</saml:Audience></saml:AudienceRestriction></saml:Conditions>{AttributeStatement}</saml:Assertion></samlp:Response>',
        attributes: [
            { name: 'firstName', valueTag: 'firstName', nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic', valueXsiType: 'xs:string' },
            { name: 'lastName', valueTag: 'lastName', nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic', valueXsiType: 'xs:string' },
        ],
    }
});