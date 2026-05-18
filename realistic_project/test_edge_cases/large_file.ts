// 测试超大文件性能
@Entry
@Component
export struct LargePage {
  @State message: string = 'Hello'
  
  build() {
    Column() {
      Text(this.message)
      Button('Click me')
        .onClick(() => {
          this.message = 'Clicked!'
        })
    }
    .width('100%')
    .height('100%')
  }
}

// 模拟一个大文件
export class DataManager001 { store() { return 1; } }
export class DataManager002 { store() { return 2; } }
export class DataManager003 { store() { return 3; } }
export class DataManager004 { store() { return 4; } }
export class DataManager005 { store() { return 5; } }
export class DataManager006 { store() { return 6; } }
export class DataManager007 { store() { return 7; } }
export class DataManager008 { store() { return 8; } }
export class DataManager009 { store() { return 9; } }
export class DataManager010 { store() { return 10; } }
