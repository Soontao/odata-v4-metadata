import { ServiceMetadata } from "../src/service/metadata";

describe('School Metadata Test Suite', () => {

  const schema = require("./school.meta.json")

  it('should support find entity by Name', () => {

    const meta = ServiceMetadata.loadFromJson(schema)
    const classEntity = meta.getEntityTypeByName("Class")
    expect(classEntity).not.toBeNull()
    expect(classEntity.getAnnotationsByTerm("UI.FormField")).toHaveLength(0)
    expect(classEntity.getAnnotationsByTerm("UI.Label")).toHaveLength(1)
    const classIdProperty = classEntity.getPropertyByName("cid");
    expect(classIdProperty).not.toBeNull()
    expect(classIdProperty.getAnnotationsByTerm("UI.FormField")).toHaveLength(2)
    expect(meta.getEntityTypeByName("NotExist")).toBeNull()
    
  });


})
