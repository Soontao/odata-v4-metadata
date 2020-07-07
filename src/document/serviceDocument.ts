// @ts-nocheck
import { Edm, ServiceMetadata, Format } from '../index';
import { JsonDocument } from './JsonDocument';
import { Request, Response, RequestHandler } from 'express';
export class ServiceDocument extends ServiceMetadata {

  constructor(edmx: Edm.Edmx, options?: Object) {
    super(edmx, options);
  }

  document(format?: Format) {
    switch (format) {
      case 'xml':
        throw new Error('Not implemented');
      default:
        const jsonDocument = new JsonDocument(this.options, this.edmx);
        return jsonDocument.processMetadata();
    }
  }

  process(edmx: Edm.Edmx, options?: Object) {
    const jsonDocument = new JsonDocument(options, edmx);
    this.data = jsonDocument.processMetadata();
  }

  requestHandler(format?: string) {
    return (req: Request, res: Response, next: RequestHandler) => {
      res.set('OData-Version', '4.0');

      const data = this.document(format);
      if (!data['@odata.context']) {
        let url = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?').shift()}`;
        if (url.slice(-1) !== '/') { url += '/'; }
        data['@odata.context'] = `${url}$metadata`;
      }

      res.json(data);
    };
  }
}
