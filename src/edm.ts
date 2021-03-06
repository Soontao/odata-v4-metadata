import { LRUMap } from '@newdash/newdash/functional/LRUMap';
import * as metacode from './metacode';

const { jsonProperty } = metacode;

/**
 * Entity Data Model
 */
export namespace Edm {

  export class PrimitiveType {

    constructor(public className: string) { }
    /**
     * @returns edm type code
     */
    toString() { return this.className; }
    /**
     * create value based current type
     *
     * @param value
     * @returns
     */
    createValue(value: any) {
      return new PrimitiveTypeValue(value, this);
    }

  }

  /**
   * primitive literal with value
   */
  export class PrimitiveTypeValue {

    private type: PrimitiveType;

    private value: any;

    constructor(value: any, type: PrimitiveType) {
      this.value = value;
      this.type = type;
    }

    /**
     * get the primitive literal type
     *
     * @returns
     */
    public getType() {
      return this.type;
    }

    public getValue() {
      return this.value;
    }

  }


  export const Binary = new PrimitiveType('Edm.Binary');
  export const Boolean = new PrimitiveType('Edm.Boolean');
  export const Byte = new PrimitiveType('Edm.Byte');
  export const Date = new PrimitiveType('Edm.Date');
  /**
   * @since odata v2
   */
  export const DateTime = new PrimitiveType('Edm.DateTime');
  export const DateTimeOffset = new PrimitiveType('Edm.DateTimeOffset');
  export const Decimal = new PrimitiveType('Edm.Decimal');
  export const Double = new PrimitiveType('Edm.Double');
  export const Duration = new PrimitiveType('Edm.Duration');
  export const Guid = new PrimitiveType('Edm.Guid');
  export const Int16 = new PrimitiveType('Edm.Int16');
  export const Int32 = new PrimitiveType('Edm.Int32');
  export const Int64 = new PrimitiveType('Edm.Int64');
  export const SByte = new PrimitiveType('Edm.SByte');
  export const Single = new PrimitiveType('Edm.Single');
  export const Stream = new PrimitiveType('Edm.Stream');
  export const String = new PrimitiveType('Edm.String');
  export const TimeOfDay = new PrimitiveType('Edm.TimeOfDay');
  export const Geography = new PrimitiveType('Edm.Geography');
  export const GeographyPoint = new PrimitiveType('Edm.GeographyPoint');
  export const GeographyLineString = new PrimitiveType('Edm.GeographyLineString');
  export const GeographyPolygon = new PrimitiveType('Edm.GeographyPolygon');
  export const GeographyMultiPoint = new PrimitiveType('Edm.GeographyMultiPoint');
  export const GeographyMultiLineString = new PrimitiveType('Edm.GeographyMultiLineString');
  export const GeographyMultiPolygon = new PrimitiveType('Edm.GeographyMultiPolygon');
  export const GeographyCollection = new PrimitiveType('Edm.GeographyCollection');
  export const Geometry = new PrimitiveType('Edm.Geometry');
  export const GeometryPoint = new PrimitiveType('Edm.GeometryPoint');
  export const GeometryLineString = new PrimitiveType('Edm.GeometryLineString');
  export const GeometryPolygon = new PrimitiveType('Edm.GeometryPolygon');
  export const GeometryMultiPoint = new PrimitiveType('Edm.GeometryMultiPoint');
  export const GeometryMultiLineString = new PrimitiveType('Edm.GeometryMultiLineString');
  export const GeometryMultiPolygon = new PrimitiveType('Edm.GeometryMultiPolygon');
  export const GeometryCollection = new PrimitiveType('Edm.GeometryCollection');


  const MemberAttribute = metacode.MemberAttribute;
  const parse = metacode.parse;
  const required = metacode.required;
  const defaultValue = metacode.defaultValue;
  const parseAs = metacode.parseAs;
  const AttributeFunctionChain = metacode.AttributeFunctionChain;
  const mapArray = (sourceField, factory) => new metacode.AttributeFunctionChain(
    (d, i) => d[sourceField],
    (props, i) => Array.isArray(props) ? props : (props ? [props] : []),
    (props, i) => props.map((prop) => factory(prop, i)));

  const primitiveAnnotationValue = (sourceField) => new metacode.AttributeFunctionChain(
    (d, i) => {
      if (d['collection'] && d['collection'][0] && Array.isArray(d['collection'][0][sourceField]) && !d[sourceField]) {
        return d['collection'][0][sourceField].map((x) => x.text);
      }
      const props = d[sourceField];
      if (Array.isArray(props)) {
        return props.filter((x) => 'text' in x).map((x) => x.text)[0];
      }
      return props;

    });


  const annotationTypeSelector = (source) => {
    for (const i in AnnotationTypes) {
      if (i in source || (source['collection'] && source['collection'][0] && i in source['collection'][0])) {
        return AnnotationTypes[i];
      }
    }
    return Annotation;
  };


  export class EdmItemBase {

    constructor(definition?: any, public parent?: EdmItemBase) {
      definition && this.loadFrom(definition);
    }

    private _cache: LRUMap;

    protected _tryGetCache<T>(key: string, producer: () => T): T {
      // lazy create cache
      if (this._cache === undefined) {
        this._cache = new LRUMap();
      }
      if (!this._cache.has(key)) {
        this._cache.set(key, producer());
      }
      return this._cache.get(key);
    }

    public getAnnotationsByTerm(term: string) {
      return this._tryGetCache(`_type_${term}_`, () => {
        const rt = [];
        this['annotations']?.map?.((annotation: Annotation) => {
          if (annotation.term === term) {
            rt.push(rt);
          }
        });
        return rt;
      });
    }


    loadFrom(definition) {

      const proto = Object.getPrototypeOf(this);
      MemberAttribute.getMembers(proto).forEach((membername) => {
        const parser = MemberAttribute.getAttributeValue(proto, membername, 'serialize');
        if (parser) {
          const v = parser.invoke(definition, this);
          this[membername] = v;
        }
      });
    }

  }


  export class Property extends EdmItemBase {
    @parse
    @required
    public name: string


    @parse
    @required
    public type: string;

    @parse
    @defaultValue(true)
    public nullable: boolean;

    @parse
    public maxLength: number;

    @parse
    public precision: number;

    @parse
    public scale: number;

    @parse
    public unicode: boolean;

    @parse
    @defaultValue(0)
    public SRID: number;

    @parse
    public defaultValue: any;

    @parse
    public concurrencyMode: String

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class NavigationProperty extends EdmItemBase {
    @parse
    @required
    public name: string;


    @parse
    @required
    public type: string;

    @parse
    @defaultValue(true)
    public nullable: boolean;

    @parse
    public partner: string

    @parse
    public containsTarget: boolean

    @jsonProperty('referentialConstraint') @parseAs(mapArray('referentialConstraint', (prop, i) => new ReferentialConstraint(prop, i)))
    public referentialConstraints: Array<ReferentialConstraint>

    //TODO onDelete


    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class ReferentialConstraint extends EdmItemBase {
    @parse
    @required
    public property: string

    @parse
    @required
    public referencedProperty: string

  }

  export class PropertyRef extends EdmItemBase {
    @parse
    @required
    public name: string;

    @parse
    //@requiredIfContainerIsComplexType
    public alias: string;
  }

  export class Key extends EdmItemBase {

    @jsonProperty('propertyRef')
    @parseAs(mapArray('propertyRef', (prop, i) => new PropertyRef(prop, i)))
    public propertyRefs: Array<PropertyRef>

  }


  export class EntityType extends EdmItemBase {

    @parse
    @required
    public name: string;

    @parseAs(
      new AttributeFunctionChain(
        (d, i) => d.key,
        (props, i) => props ?? [],
        (props, i) => props?.map?.((prop) => new Key(prop, i)),
        (props) => props?.[0]
      )
    )
    @jsonProperty('key', (instance) => [instance.key])
    public key: Key;

    @parse
    public baseType: string;

    @parse
    public abstract: boolean;

    @parse
    public openType: boolean;

    @parse
    public hasStream: boolean;


    @jsonProperty('property') @parseAs(mapArray('property', (prop, i) => new Property(prop, i)))
    public properties: Array<Property>;

    @jsonProperty('navigationProperty') @parseAs(mapArray('navigationProperty', (prop, i) => new NavigationProperty(prop, i)))
    public navigationProperties: Array<NavigationProperty>;

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>


    public getPropertyByName(propertyName: string): Property {
      return this._tryGetCache(`_prop_${propertyName}_`, () => {
        for (const property of this.properties) {
          if (property.name === propertyName) {
            return property;
          }
          return null;
        }
      });
    }


  }

  export class ComplexType extends EdmItemBase {

    @parse
    @required
    public name: string;

    @parse
    public baseType: string;

    @parse
    public abstract: boolean;

    @parse
    public openType: boolean;

    @parse
    public hasStream: boolean;

    @jsonProperty('property') @parseAs(mapArray('property', (prop, i) => new Property(prop, i)))
    public properties: Array<Property>;

    @jsonProperty('navigationProperty') @parseAs(mapArray('navigationProperty', (prop, i) => new NavigationProperty(prop, i)))
    public navigationProperties: Array<NavigationProperty>;

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }
  export class Parameter extends EdmItemBase {

    @parse
    @required
    public name: string


    @parse
    @required
    public type: string;

    @parse
    @defaultValue(true)
    public nullable: boolean;

    @parse
    public maxLength: number;

    @parse
    public precision: number;

    @parse
    public scale: number;

    @parse
    public unicode: boolean;

    @parse
    @defaultValue(0)
    public SRID: number;

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>

    // according to specs there is no default value for params. but is that right?
    // @parse
    // public defaultValue: any;
  }
  export class ReturnType extends EdmItemBase {
    @parse
    public type: string

    @parse
    @defaultValue(true)
    public nullable: boolean

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class Invokable extends EdmItemBase { }

  export class Action extends Invokable {
    @parse
    @required
    public name: string

    @parse
    public isBound: boolean

    @parse
    public entitySetPath: string

    @jsonProperty('parameter') @parseAs(mapArray('parameter', (prop, i) => new Parameter(prop, i)))
    public parameters: Array<Parameter>

    @parseAs(new AttributeFunctionChain(
      (d, i) => d.returnType,
      (rt, i) => new ReturnType(rt, i)))

    public returnType: ReturnType

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }


  export class Function extends Invokable {
    @parse
    @required
    public name: string

    @parse
    public isBound: boolean

    @parse
    public entitySetPath: string

    @jsonProperty('parameter') @parseAs(mapArray('parameter', (prop, i) => new Parameter(prop, i)))
    public parameters: Array<Parameter>

    @parseAs(new AttributeFunctionChain(
      (d, i) => d.returnType,
      (rt, i) => new ReturnType(rt, i)))
    public returnType: ReturnType

    @parse
    public isComposable: boolean

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }
  export class Member extends EdmItemBase {
    @parse
    @required
    public name: string

    @parse
    public value: number

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class EnumType extends EdmItemBase {
    @parse
    @required
    public name: string

    @parse
    @required
    public namespace: string

    @parse
    //@oneOf(Edm.Byte, Edm.SByte, Edm.Int16, Edm.Int32, Edm.Int64)
    @defaultValue(Edm.Int32)
    public underlyingType: PrimitiveType

    @parse
    public isFlags: boolean

    @jsonProperty('member') @parseAs(mapArray('member', (prop, i) => new Member(prop, i)))
    public members: Array<Member>

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class EntitySet extends EdmItemBase {
    @parse
    @required
    public name: string

    @parse
    @required
    public entityType: string

    @jsonProperty<EntitySet>('annotation')
    @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class ActionImport extends EdmItemBase {
    @parse
    @required
    public name: string

    @parse
    @required
    public action: string

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class FunctionImport extends EdmItemBase {
    @parse
    @required
    public name: string

    @parse
    @required
    public function: string

    @parse
    @defaultValue(false)
    public includeInServiceDocument: boolean

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class EntityContainer extends EdmItemBase {
    @parse
    public name: string

    @jsonProperty('entitySet') @parseAs(mapArray('entitySet', (prop, i) => new EntitySet(prop, i)))
    public entitySets: Array<EntitySet>

    @jsonProperty('actionImport') @parseAs(mapArray('actionImport', (prop, i) => new ActionImport(prop, i)))
    public actionImports: Array<ActionImport>

    @jsonProperty('functionImport') @parseAs(mapArray('functionImport', (prop, i) => new FunctionImport(prop, i)))
    public functionImports: Array<FunctionImport>
  }

  // "Name", "UnderlyingType", "MaxLength", "Unicode", "Precision", "Scale", "SRID"
  export class TypeDefinition extends EdmItemBase {
    @parse
    public name: string

    @parse
    public underlyingType: PrimitiveType

    @parse
    public maxLength: number

    @parse
    public unicode: boolean

    @parse
    public precision: number

    @parse
    public scale: number

    @parse
    @defaultValue(0)
    public SRID: number;

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class Schema extends EdmItemBase {
    @parse
    @required
    public namespace: string

    @parse
    //@noneOf(["Edm", "odata", "System", "Transient")
    public alias: string

    @jsonProperty('enumType')
    @parseAs(mapArray('enumType', (prop, i) => new EnumType(prop, i)))
    public enumTypes: Array<EnumType>

    @jsonProperty('typeDefinition')
    @parseAs(mapArray('typeDefinition', (prop, i) => new TypeDefinition(prop, i)))
    public typeDefinitions: Array<TypeDefinition>

    @jsonProperty('complexType')
    @parseAs(mapArray('complexType', (prop, i) => new ComplexType(prop, i)))
    public complexTypes: Array<ComplexType>

    @jsonProperty('entityType')
    @parseAs(mapArray('entityType', (prop, i) => new EntityType(prop, i)))
    public entityTypes: Array<EntityType>

    @jsonProperty('action')
    @parseAs(mapArray('action', (prop, i) => new Action(prop, i)))
    public actions: Array<Action>

    @jsonProperty('function')
    @parseAs(mapArray('function', (prop, i) => new Edm.Function(prop, i)))
    public functions: Array<Edm.Function>

    @jsonProperty('entityContainer')
    @parseAs(mapArray('entityContainer', (prop, i) => new Edm.EntityContainer(prop, i)))
    public entityContainer: Array<Edm.EntityContainer>

    @jsonProperty('annotations') @parseAs(mapArray('annotations', (prop, i) => new Edm.Annotations(prop, i)))
    public annotations: Array<Edm.Annotations>

  }


  export class DataServices extends EdmItemBase {
    @jsonProperty('schema') @parseAs(mapArray('schema', (prop, i) => new Schema(prop, i)))
    public schemas: Array<Schema>
  }

  export class Reference extends EdmItemBase {
    @parse
    public uri: string

    @jsonProperty('include') @parseAs(mapArray('include', (prop, i) => new ReferenceInclude(prop, i)))
    public includes: Array<ReferenceInclude>
  }

  export class ReferenceInclude extends EdmItemBase {
    @parse
    public namespace: string

    @parse
    public alias: string
  }

  export class Edmx extends EdmItemBase {
    public version = '4.0'

    @parseAs(new AttributeFunctionChain(
      (edm) => new Edm.DataServices(edm.dataServices)
    ))
    public dataServices: DataServices

    @jsonProperty('reference') @parseAs(mapArray('reference', (prop, i) => new Reference(prop, i)))
    public references: Array<Edm.Reference>
  }

  export class Annotations extends EdmItemBase {
    @parse
    @required
    public target: string

    @parse
    public qualifier: string

    @jsonProperty('annotation') @parseAs(mapArray('annotation', (prop, i) => new (annotationTypeSelector(prop))(prop, i)))
    public annotations: Array<Edm.Annotation>
  }

  export class Annotation extends EdmItemBase {
    public annotationType: string = 'Unknown';

    @parse
    public term: string

    @parse
    public qualifier: string

    @parse
    public path: string
  }

  export class BinaryAnnotation extends Annotation {
    public annotationType: string = 'Binary';

    @parseAs(primitiveAnnotationValue('binary'))
    public binary: String
  }

  export class BoolAnnotation extends Annotation {
    public annotationType: string = 'Bool';

    @parseAs(primitiveAnnotationValue('bool'))
    public bool: String
  }

  export class DateAnnotation extends Annotation {
    public annotationType: string = 'Date';

    @parseAs(primitiveAnnotationValue('date'))
    public date: String
  }

  export class DateTimeOffsetAnnotation extends Annotation {
    public annotationType: string = 'DateTimeOffset';

    @parseAs(primitiveAnnotationValue('dateTimeOffset'))
    public dateTimeOffset: String
  }

  export class DecimalAnnotation extends Annotation {
    public annotationType: string = 'Decimal';

    @parseAs(primitiveAnnotationValue('decimal'))
    public decimal: String
  }

  export class DurationAnnotation extends Annotation {
    public annotationType: string = 'Duration';

    @parseAs(primitiveAnnotationValue('duration'))
    public duration: String
  }

  export class EnumMemberAnnotation extends Annotation {
    public annotationType: string = 'EnumMember';

    @parseAs(primitiveAnnotationValue('enumMember'))
    public enumMember: String
  }

  export class FloatAnnotation extends Annotation {
    public annotationType: string = 'Float';

    @parseAs(primitiveAnnotationValue('float'))
    public float: String
  }

  export class GuidAnnotation extends Annotation {
    public annotationType: string = 'Guid';

    @parseAs(primitiveAnnotationValue('guid'))
    public guid: String
  }

  export class IntAnnotation extends Annotation {
    public annotationType: string = 'Int';

    @parseAs(primitiveAnnotationValue('int'))
    public int: String
  }

  export class StringAnnotation extends Annotation {
    public annotationType: string = 'String';

    @parseAs(primitiveAnnotationValue('string'))
    public string: String
  }

  export class TimeOfDayAnnotation extends Annotation {
    public annotationType: string = 'TimeOfDay';

    @parseAs(primitiveAnnotationValue('timeOfDay'))
    public timeOfDay: String
  }

  export class PropertyPathAnnotation extends Annotation {
    public annotationType: string = 'PropertyPath';

    @jsonProperty<PropertyPathAnnotation>('propertyPath')
    @parseAs(primitiveAnnotationValue('propertyPath'))
    public propertyPaths: Array<string>

    public toJson() {
      return {
        term: this.annotationType,
        collection: [
          { propertyPath: this.propertyPaths?.map((s) => ({ text: s })) }
        ]
      };
    }

  }

  export class NavigationPropertyPathAnnotation extends Annotation {
    public annotationType: string = 'NavigationPropertyPath';

    @parseAs(primitiveAnnotationValue('propertyPath'))
    public navigationPropertyPaths: String
  }

  export class AnnotationPathAnnotation extends Annotation {
    public annotationType: string = 'AnnotationPath';

    @parseAs(primitiveAnnotationValue('annotationPath'))
    public annotationPaths: String
  }

  export class NullAnnotation extends Annotation {
    public annotationType: string = 'Null';

    @parseAs(primitiveAnnotationValue('null'))
    public null: Array<Object>
  }


  export const AnnotationTypes = {
    binary: BinaryAnnotation,
    bool: BoolAnnotation,
    date: DateAnnotation,
    dateTimeOffset: DateTimeOffsetAnnotation,
    decimal: DecimalAnnotation,
    duration: DurationAnnotation,
    enumMember: EnumMemberAnnotation,
    float: FloatAnnotation,
    guid: GuidAnnotation,
    int: IntAnnotation,
    string: StringAnnotation,
    timeOfDay: TimeOfDayAnnotation,
    propertyPath: PropertyPathAnnotation,
    navigationPropertyPath: NavigationPropertyPathAnnotation,
    annotationPath: AnnotationPathAnnotation,
    null: NullAnnotation
  };

  export const toAnnotationTypeKey = (value) => {
    for (const [key, type] of Object.entries(AnnotationTypes)) {
      if (value instanceof type) {
        return key;
      }
    }
  };

}


