
import { ServiceDocument } from "../src";

const schema = require('./schema_sd.json')

describe('metadata', () => {

    it('xml', () => {


        var m = ServiceDocument.processMetadataJson(schema, {
            context: 'http://127.0.0.1/odata/$metadata'
        })

        JSON.stringify(m.document(), null, 4)


    })

    it('defineEntities', () => {
        var m = ServiceDocument.defineEntities({
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
        }, {
            context: 'http://127.0.0.1/odata/$metadata'
        })

        JSON.stringify(m.document(), null, 4)


    })


})


describe('metadata tests', () => {

    it('process', () => {
        var m = ServiceDocument.defineEntities({
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
        },
            {
                context: 'http://127.0.0.1/odata/$metadata'
            })

        const data = m.document()
        expect(m instanceof ServiceDocument).toEqual(true)
        expect(typeof data).toEqual('object')
        expect(data['@odata.context']).toEqual('http://127.0.0.1/odata/$metadata')

        expect(data.value).toMatchObject([
            {
                name: 'Articles',
                kind: 'EntitySet',
                url: 'Articles'
            },
            {
                name: 'Categories',
                kind: 'EntitySet',
                url: 'Categories'
            }
        ])
    })

    it('requestHandler', () => {
        var m = ServiceDocument.defineEntities({
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

        expect(m instanceof ServiceDocument).toEqual(true)


        var isHeaderSetCalled = false;
        var middleware = m.requestHandler()
        middleware({
            protocol: 'http',
            get: function () {
                return 'localhost:1234'
            },
            originalUrl: '/odata/'
        }, {
            set: function (key, value) {
                expect(key).toEqual('OData-Version')
                expect(value).toEqual('4.0')

                isHeaderSetCalled = true
            },

            json: function (data) {
                expect(typeof data).toEqual('object')
                expect(data['@odata.context']).toEqual('http://localhost:1234/odata/$metadata')

                expect(data.value).toMatchObject([
                    {
                        name: 'Articles',
                        kind: 'EntitySet',
                        url: 'Articles'
                    },
                    {
                        name: 'Categories',
                        kind: 'EntitySet',
                        url: 'Categories'
                    }
                ])


                expect(isHeaderSetCalled).toEqual(true)
            }
        })
    })
})