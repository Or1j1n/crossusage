export class LazyStore {
  constructor(_fileName: string) {}
  async get<T>(_key: string): Promise<T | undefined> { return undefined }
  async set(_key: string, _value: unknown): Promise<void> {}
  async save(): Promise<void> {}
}
