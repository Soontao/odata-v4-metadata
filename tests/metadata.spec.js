import { ServiceMetadata } from "../src";
import * as fs from "fs";

describe('metadata', () => {

  const schema = require('./schema_meta.json')

  it('processMetadataJson', () => {
    const m = ServiceMetadata.processMetadataJson(schema)
    expect(m.document()).not.toBeUndefined()
    expect(m.document("json")).not.toBeUndefined()
    const p = JSON.parse(m.document("json"))
    const pm = ServiceMetadata.processMetadataJson(p)
    // expect(p).toMatchObject(schema)

  });

  it('defineEntities', () => {
    var m = ServiceMetadata.defineEntities({
      namespace: 'JayData.Entities',
      containerName: 'Container',
      entities: [
        {
          name: 'Article',
          collectionName: 'Articles',
          keys: ['Id'],
          computedKey: true,
          properties: {
            Id: 'Edm.Int32',
            Title: 'Edm.String',
            Body: 'Edm.String'
          },
          annotations: [
            { name: 'UI.DisplayName', value: 'Arts' },
            { property: 'Id', name: 'UI.ReadOnly', value: 'true' },
            { property: 'Title', name: 'UI.DisplayName', value: 'Article Title' },
          ]
        },
        {
          name: 'Category',
          collectionName: 'Categories',
          keys: ['Id'],
          computedKey: true,
          properties: {
            Id: 'Edm.Int32',
            Title: 'Edm.String'
          }
        }
      ]
    })

    expect(m.document()).not.toBeUndefined()
    expect(m.document("json")).not.toBeUndefined()

  })
})