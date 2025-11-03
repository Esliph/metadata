import { DecoratorMetadata, Metadata } from '../index'

const metadata = new Metadata()

function Class(value?: any) {
    return DecoratorMetadata.Create.Class({ value, key: 'class' })
}

function Attribute(value?: any) {
    return DecoratorMetadata.Create.Attribute({ value, key: 'attribute' })
}

function Method(value?: any) {
    return DecoratorMetadata.Create.Method({ value, key: 'method' })
}

function Parameter(value?: any) {
    return DecoratorMetadata.Create.Parameter({ value, key: 'param' })
}

@Class('Class')
class ABC {
    @Attribute('Attribute')
    number: number

    constructor() {
        this.number = 0
    }

    @Method('Method')
    abc(@Parameter('Parameter') b: any) { }
}

console.log(Metadata.Get.Class('class', ABC))
console.log(metadata.Get.Class('class', ABC))
console.log(Metadata.Get.Parameter('param', ABC, 'abc', 0))
console.log(metadata.Get.Parameter('param', ABC, 'abc', 0))
console.log(Metadata.Get.Method('method', ABC, 'abc'))
console.log(metadata.Get.Method('method', ABC, 'abc'))
console.log(Metadata.Get.Attribute('attribute', ABC, 'number'))
console.log(metadata.Get.Attribute('attribute', ABC, 'number'))
