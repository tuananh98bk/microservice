import AJV from 'ajv';
import { HttpError } from './response';
import { ErrorCode } from '$enums';
const dateTimeRegex = new RegExp(
  '^\\d\\d\\d\\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])T(00|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9].[0-9][0-9][0-9])Z$'
);
export default function Ajv(config?) {
  const ajv = config ? new AJV(config) : new AJV();
  ajv.addFormat('datetimeISO', {
    validate: (dateTimeString: string) => dateTimeRegex.test(dateTimeString),
  });
  return ajv;
}

export function validate(schemaKeyRef: object | string | boolean, data: any): undefined {
  const Ajv = new AJV();
  Ajv.addFormat('ISOString', {
    validate: (dateTimeString: string) => dateTimeRegex.test(dateTimeString),
  });
  const validate = Ajv.validate(schemaKeyRef, data);
  if (!validate) {
    throw new HttpError(ErrorCode.Invalid_Input, 422, Ajv.errors); // 422 Unprocessable Entity
  }
  return;
}
