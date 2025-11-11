declare module 'clsx' {
  type ClassValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | { [key: string]: any }
    | ClassValue[];
  export default function clsx(...inputs: ClassValue[]): string;
  export type { ClassValue };
}
