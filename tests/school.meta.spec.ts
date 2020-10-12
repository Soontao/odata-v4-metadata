import { ServiceMetadata } from "../src/service/metadata";

describe('School Metadata Test Suite', () => {

  const schema = require("./school.meta.json")

  it('should support find entity by Name', () => {

    const meta = ServiceMetadata.loadFromJson(schema)
    const classEntity = meta.getEntityTypeByName("Class")
    // expect(classEntity).not.toBeNull()
    // expect(meta.getEntityTypeByName("NotExist")).toBeNull()
    
  });


})
