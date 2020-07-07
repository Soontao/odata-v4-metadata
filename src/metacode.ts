function isFunction(o: any) {
  return 'function' === typeof o;
}
function isUndefined(o: any) {
  return o === undefined;
}

const definitionPropName = 'definition';

export class MemberAttribute {
  constructor(protected attributeName: string) { }

  private registerMember(target: Object, key: string) {
    const def = target[definitionPropName] = target[definitionPropName] || {};
    const md = (def.members || []);
    if (md.indexOf(key) < 0) {
      md.push(key);
    }

    def.members = md;
  }

  getDecoratorValue(target:Object, key:string, presentedValue?: any) {
    return presentedValue;
  }

  decorate(value?:any):Function {
    return (target:Object, key: string, descriptor?: Object) => {
      this.registerMember(target, key);
      const decoratorValue = this.getDecoratorValue(target, key, value);

      target[definitionPropName][this.attributeName] = target[definitionPropName][this.attributeName] || {};
      target[definitionPropName][this.attributeName][key] = decoratorValue;
    };
  }

  get decorator(): Function {
    return this.decorate();
  }

  static getMembers(target: Function | Object) {
    return target[definitionPropName].members;
  }

  static getAttributeValue(target: Object, memberName: string, attributeName: string) {
    return ((target[definitionPropName] || {})[attributeName] || {})[memberName];
  }

}

export class AttributeFunctionChain {
    private steps: Array<Function> = []
    constructor(...steps: Array<Function>) {
      this.steps = steps;
    }

    invoke(definition, instance) {
      let result = definition;
      this.steps.forEach((fn) => {
        result = fn(result, instance);
      });
      return result;
    }
}

export class ParseAttribute extends MemberAttribute {
  constructor() {
    super('serialize');
  }

  getDecoratorValue(target:Object, key:string, presentedValue?: any) {
    if (!isUndefined(presentedValue)) {
      return presentedValue;
    }
    return new AttributeFunctionChain(
      (d) => d[key]
    );
  }


}

export const required = new MemberAttribute('required').decorate(true);
export const defaultValueAttribute = new MemberAttribute('defaultValue');
export const defaultValue = defaultValueAttribute.decorate.bind(defaultValueAttribute);
export const parseAttribute = new ParseAttribute();
export const parse = parseAttribute.decorator;
export const parseAs = parseAttribute.decorate.bind(parseAttribute);
export const typeArgument = new MemberAttribute('typeArgument');

