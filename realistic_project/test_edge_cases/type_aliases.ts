// 测试type alias和复杂的type定义
export type StringOrNumber = string | number;
export type UserId = string;
export type Callback<T> = (data: T) => void;
export type AsyncCallback<T, E = Error> = (data: T, error?: E) => void;
export type CreateUserDto = {
  name: string;
  email: string;
  age?: number;
  roles?: string[];
};
export type PartialUser = Partial<User>;
export type ReadonlyUser = Readonly<User>;
export type PickUserName = Pick<User, 'name' | 'email'>;
export type OmitUserId = Omit<User, 'id'>;
export type UserWithDefaults = Required<Pick<User, 'name' | 'email'>>;

export type Mixed = string | number | boolean | object | null | undefined;

export type TreeNode<T> = {
  value: T;
  children?: TreeNode<T>[];
  parent?: TreeNode<T>;
};

export type LinkedList<T> = {
  value: T;
  next?: LinkedList<T>;
  prev?: LinkedList<T>;
};

export type Either<L, R> = { kind: 'left'; left: L } | { kind: 'right'; right: R };

export type Option<T> = Some<T> | None;

export interface Some<T> {
  kind: 'some';
  value: T;
}

export interface None {
  kind: 'none';
}

export type AsyncResult<T> = Promise<{ success: boolean; data?: T; error?: string }>;

export type Validator<T> = (value: T) => boolean;

export type Formatters = {
  [K in keyof User]: (value: User[K]) => string;
};
