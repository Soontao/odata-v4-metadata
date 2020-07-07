import { Edm } from '../edm';
import { XmlMetadata } from './xmlMetadata';
import { defineEntities } from './defineEntities';
import { Request, Response, RequestHandler, json } from 'express';
import { jsonStringify } from './JsonCreator';

type Format = 'xml' | 'json' | 'application/json' | 'application/xml'

export class ServiceMetadata {

  static processMetadataJson(json, options?: Object) {
    const edmx = new Edm.Edmx(json);
    return new this(edmx, options);
  }

  static processEdmx(edmx: Edm.Edmx, options?: Object) {
    return new this(edmx, options);
  }

  static defineEntities(entityConfig: Object, options?: Object) {
    const json = defineEntities(entityConfig);
    const edmx = new Edm.Edmx(json);
    return new this(edmx, options);
  }

  public edmx: Edm.Edmx;

  private options: any;

  constructor(edmx: Edm.Edmx, options?: Object) {
    this.edmx = edmx;
    this.options = options;
  }

  document(format: Format = 'xml') {
    switch (format) {
      case 'json':
      case 'application/json':
        return jsonStringify(this.edmx);
      default:
        return this.process(this.edmx, this.options);
    }
  }

  process(edmx: Edm.Edmx, options?: Object): string {
    const xmlMetadata = new XmlMetadata(options, edmx);
    return xmlMetadata.processMetadata();
  }

  requestHandler(format?: Format) {
    return (_: Request, res: Response, __: RequestHandler) => {
      res.set('Content-Type', 'application/xml');
      res.send(this.document(format));
    };
  }

}
