import { Edm } from '../edm';
import { XmlMetadata } from './xmlMetadata';
import { defineEntities } from './defineEntities';
import { Request, Response, RequestHandler } from 'express';
import { LRUMap } from '@newdash/newdash/functional/LRUMap';
import { jsonStringify } from './JsonCreator';

export type Format = 'xml' | 'json' | 'application/json' | 'application/xml'


export class ServiceMetadata {

  static loadFromJson(json: object, options?: any) {
    return ServiceMetadata.processMetadataJson(json, options);
  }

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

  private _cache: LRUMap;

  private options: any;

  constructor(edmx: Edm.Edmx, options?: Object) {
    this.edmx = edmx;
    this.options = options;
    this._cache = new LRUMap();
  }

  private _tryGetCache<T>(key: string, producer: () => T): T {
    if (!this._cache.has(key)) {
      this._cache.set(key, producer());
    }
    return this._cache.get(key);
  }

  public getAllEntityTypes(): Array<Edm.EntityType> {
    return this._tryGetCache('_all_models_', () => {
      const rt = [];

      this.edmx.dataServices.schemas.forEach((schema) => {
        schema.entityTypes.forEach((entityType) => {
          rt.push(entityType);
        });
      });

      return rt;
    });
  }

  public getEntityTypeByName(modelName: string): Edm.EntityType {
    return this._tryGetCache(
      `_model_${modelName}_`,
      () => {
        for (const model of this.getAllEntityTypes()) {
          if (model.name === modelName) {
            return model;
          }
          return null;
        }
      }
    );
  }


  public getAllEntitySets(): Array<Edm.EntitySet> {
    return this._tryGetCache('_all_models_', () => {
      const rt = [];

      this.edmx.dataServices.schemas.forEach((schema) => {
        schema.entityContainer.forEach((container) => {
          container.entitySets.forEach((entitySet) => {
            rt.push(entitySet);
          });
        });
      });

      return rt;
    });
  }

  public getEntitySetByName(entitySetName: string): Edm.EntitySet {
    return this._tryGetCache(
      `_es_${entitySetName}_`,
      () => {
        for (const es of this.getAllEntitySets()) {
          if (es.name === entitySetName) {
            return es;
          }
          return null;
        }
      }
    );
  }


  document(format: Format = 'xml'): any {
    switch (format) {
      case 'json':
      case 'application/json':
        return jsonStringify(this.edmx);
      case 'xml':
      case 'application/xml':
        return this.process(this.edmx, this.options);
      default:
        throw Error(`not support document type for ${format}`);
    }
  }

  process(edmx: Edm.Edmx, options?: Object): any {
    const xmlMetadata = new XmlMetadata(options, edmx);
    return xmlMetadata.processMetadata();
  }


  /**
   * create metadata handler for express
   *
   * @param format
   */
  public requestHandler(format?: Format) {

    return (req: Request, res: Response, __: RequestHandler) => {
      switch (req.get('Accept')) {
        case 'application/json': case 'json':
          res.set('Content-Type', 'application/json');
          res.send(this.document('application/json'));
          break;
        default:
          res.set('Content-Type', 'application/xml');
          res.send(this.document('application/xml'));
          break;
      }

    };
  }

}
