// 边界条件测试 - enum和const enum
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}

export enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

export const enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum StatusWithMethods {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  
  isValid(status: string): boolean {
    return Object.values(this).includes(status as any);
  }
  
  getDisplayName(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}

export type StatusCheck = {
  status: UserStatus | HttpStatus | Priority;
  isValid: boolean;
  label: string;
};

export function checkStatus(status: UserStatus): StatusCheck {
  return {
    status,
    isValid: status in UserStatus,
    label: UserStatus[status]
  };
}

// 反向映射
export const STATUS_LABELS: Record<string, string> = {
  [UserStatus.ACTIVE]: '活跃',
  [UserStatus.INACTIVE]: '未激活',
  [UserStatus.SUSPENDED]: '已暂停',
  [UserStatus.PENDING]: '待处理'
};
