import { CommonStatus } from '$enums';

export const getListLanguageSchema: AjvSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    status: {
      type: ['null', 'number'],
    },
  },
};

export const addLanguageSchema: AjvSchema = {
  type: 'object',
  required: ['code', 'name', 'isDefault', 'flagIcon'],
  additionalProperties: false,
  properties: {
    code: {
      type: 'string',
      minLength: 1,
    },
    status: {
      enum: [CommonStatus.ACTIVE, CommonStatus.INACTIVE],
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    viName: {
      type: 'string',
    },
    priority: {
      type: 'integer',
    },
    flagIcon: {
      type: 'string',
      minLength: 1,
    },
    isDefault: {
      enum: [CommonStatus.ACTIVE, CommonStatus.INACTIVE],
    },
  },
};

export const updateLanguageSchema: AjvSchema = {
  type: 'object',
  required: ['code'],
  additionalProperties: false,
  properties: {
    code: {
      type: 'string',
      minLength: 1,
    },
    status: {
      enum: [CommonStatus.ACTIVE, CommonStatus.INACTIVE],
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    viName: {
      type: 'string',
    },
    priority: {
      type: 'integer',
    },
    flagIcon: {
      type: 'string',
      minLength: 1,
    },
    isDefault: {
      enum: [CommonStatus.ACTIVE, CommonStatus.INACTIVE],
    },
  },
};

export const getListLanguageKeySchema: AjvSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    keyword: {
      type: 'string',
    },
    environments: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
    },
    take: {
      type: 'integer',
      minimum: 1,
    },
    pageIndex: {
      type: 'integer',
      minimum: 1,
    },
  },
};

export const addLanguageKeySchema: AjvSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    key: {
      type: 'string',
      minLength: 1,
    },
    defaultValue: {
      type: 'string',
      minLength: 1,
    },
    environment: {
      type: 'string',
    },
    translations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['code', 'value'],
        additionalProperties: false,
        properties: {
          code: {
            type: 'string',
            minLength: 1,
          },
          value: {
            type: 'string',
          },
        },
      },
    },
  },
};

export const getFileLanguageSchema: AjvSchema = {
  type: 'object',
  required: ['environment'],
  additionalProperties: false,
  properties: {
    environment: {
      type: 'string',
      minLength: 1,
    },
    code: {
      type: 'string',
      minLength: 1,
    },
  },
};
export const uploadFileLanguageSchema: AjvSchema = {
  type: 'object',
  required: ['environment', 'code', 'languages'],
  additionalProperties: false,
  properties: {
    environment: {
      type: 'string',
      minLength: 1,
    },
    code: {
      type: 'string',
      minLength: 1,
    },
    languages: {
      type: 'object',
    },
  },
};
