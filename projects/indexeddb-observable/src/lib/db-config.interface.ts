export interface DbConfig {
  /** name for indexed db name */
  name: string;
  /** keyPath in indexed db */
  keyPath?: string;
  /** default objectName of indexed db */
  objectName: string;
  /**  */
  autoIncrement?: boolean;
  /** version */
  version: number;
}