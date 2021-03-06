# OData(V4) Metadata

[![npm (scoped)](https://img.shields.io/npm/v/@odata/metadata)](https://www.npmjs.com/package/@odata/metadata)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Soontao/odata-v4-metadata/Node%20CI?label=nodejs)](https://github.com/Soontao/odata-v4-metadata/actions?query=workflow%3A%Node+CI%22)
[![Codecov](https://codecov.io/gh/Soontao/odata-v4-metadata/branch/master/graph/badge.svg)](https://codecov.io/gh/Soontao/odata-v4-metadata)


This library implements the EDM and EMDX classes from the OData CSDL V4. 

## Features

- Edm and Edmx classes
- will provide Validation logic - based on specs (-on the way)
- will Download and parse metadata from $metadata document or uri endpoint

## Usage

```
$ npm install @odata/metadata
```

then just

```js
import { Edm } from '@odata/metadata'

let entityType = new edm.EntityType({
   name: "Orders", 
   property: [{ name:"OrderID", type: Edm.Integer }]
})
entityType.properties.push(new Edm.Property(...))
```
