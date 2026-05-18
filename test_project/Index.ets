@Entry
@Component
struct Index {
  @State message: string = 'Hello World'
  
  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
      }
      .width('100%')
    }
    .height('100%')
  }
}

function calculateSum(a: number, b: number): number {
  return a + b;
}

interface UserData {
  name: string;
  age: number;
  email: string;
}

class UserService {
  private users: UserData[] = [];
  
  addUser(user: UserData): void {
    this.users.push(user);
  }
  
  getUsers(): UserData[] {
    return this.users;
  }
  
  findUserByName(name: string): UserData | undefined {
    return this.users.find(u => u.name === name);
  }
}

export { UserService, UserData, calculateSum };
