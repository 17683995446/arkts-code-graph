import router from '@system.router';
import prompt from '@system.prompt';
import fetch from '@system.fetch';

@Entry
@Component
struct MainPage {
  @State currentTab: number = 0;
  @State isLoading: boolean = false;
  @State userName: string = '';
  @State products: Product[] = [];

  aboutToAppear() {
    this.loadInitialData();
  }

  async loadInitialData() {
    this.isLoading = true;
    try {
      await this.fetchProducts();
      this.userName = 'Guest User';
    } catch (error) {
      prompt.showToast({ message: 'Failed to load data' });
    } finally {
      this.isLoading = false;
    }
  }

  async fetchProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.products = [
          { id: 1, title: 'Product 1', price: 99.99, stock: 10 },
          { id: 2, title: 'Product 2', price: 149.99, stock: 5 },
          { id: 3, title: 'Product 3', price: 299.99, stock: 0 }
        ];
        resolve();
      }, 1000);
    });
  }

  navigateToDetail(productId: number) {
    router.push({ uri: '/pages/ProductDetail', params: { id: productId } });
  }

  build() {
    Column() {
      this.renderHeader();
      this.renderTabBar();
      this.renderContent();
      this.renderBottomNav();
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f5f5')
  }

  @Builder
  renderHeader() {
    Row() {
      Text('My App')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
      Blank()
      Badge({ count: 3, style: { color: '#ffffff', fontSize: 10 } }) {
        Image('/assets/cart.png')
          .width(24)
          .height(24)
      }
      .onClick(() => router.push({ uri: '/pages/Cart' }))
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#ffffff')
  }

  @Builder
  renderTabBar() {
    Row() {
      ForEach(['Home', 'Products', 'Profile'], (tab: string, index: number) => {
        Column() {
          Text(tab)
            .fontSize(index === this.currentTab ? 16 : 14)
            .fontColor(index === this.currentTab ? '#00ff88' : '#999999')
          if (index === this.currentTab) {
            Divider()
              .width(40)
              .height(2)
              .backgroundColor('#00ff88')
              .margin({ top: 4 })
          }
        }
        .layoutWeight(1)
        .onClick(() => this.currentTab = index)
      })
    }
    .width('100%')
    .padding(vertical = 12)
    .backgroundColor('#ffffff')
  }

  @Builder
  renderContent() {
    if (this.isLoading) {
      LoadingProgress()
        .width(50)
        .height(50)
        .color('#00ff88')
    } else {
      List() {
        ForEach(this.products, (product: Product) => {
          ListItem() {
            ProductCard({ product: product })
              .onClick(() => this.navigateToDetail(product.id))
          }
        })
      }
      .width('100%')
      .height('100%')
      .padding(8)
    }
  }

  @Builder
  renderBottomNav() {
    Row() {
      NavDestination() {
        Text('Home')
      }
      NavDestination() {
        Text('Search')
      }
      NavDestination() {
        Text('Cart')
      }
      NavDestination() {
        Text('Profile')
      }
    }
    .width('100%')
    .height(60)
    .backgroundColor('#ffffff')
  }
}

@Component
struct ProductCard {
  @Prop product: Product;

  build() {
    Row() {
      Column() {
        Image(this.product.imageUrl || '/assets/placeholder.png')
          .width(80)
          .height(80)
          .borderRadius(8)
      }

      Column() {
        Text(this.product.title)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })

        Text(`$${this.product.price.toFixed(2)}`)
          .fontSize(18)
          .fontColor('#ff6600')
          .margin({ top: 8 })

        if (this.product.stock > 0) {
          Text(`In Stock: ${this.product.stock}`)
            .fontSize(12)
            .fontColor('#00ff88')
            .margin({ top: 4 })
        } else {
          Text('Out of Stock')
            .fontSize(12)
            .fontColor('#ff4444')
            .margin({ top: 4 })
        }
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 12 })
    }
    .width('100%')
    .padding(12)
    .backgroundColor('#ffffff')
    .borderRadius(12)
    .margin(4)
  }
}

interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  imageUrl?: string;
}
