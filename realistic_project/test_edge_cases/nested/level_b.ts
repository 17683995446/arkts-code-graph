import { CircularA } from '../circular_nested';
export class LevelB {
  name: string = 'Level B';
  useCircularA(a: CircularA): string {
    return a.getInfo();
  }
}
