export type FieldType = 'string'|'number'|'boolean'|'select'|'multiselect'|'date';

export interface FieldDef {
  _id:    string;
  key:    string;
  label:  string;
  type:   FieldType;
  options?: string[];
  order:  number;
  extraData?: string;
}
