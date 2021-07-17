export const loginSchema: AjvSchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      pattern: '^(\\w+([\\.\\+-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+)$',
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 255,
    },
  },
};

export const changePasswordSchema: AjvSchema = {
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  additionalProperties: false,
  properties: {
    oldPassword: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
    },
    newPassword: {
      type: 'string',
      minLength: 6,
      maxLength: 255,
    },
  },
};

export const resetPasswordSchema: AjvSchema = {
  type: 'object',
  required: ['email', 'newPassword', 'verifiedCode'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      pattern: '^(\\w+([\\.\\+-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+)$',
    },
    newPassword: {
      type: 'string',
      minLength: 6,
      maxLength: 255,
    },
    verifiedCode: {
      type: 'string',
      pattern: '^\\d{6}$',
    },
  },
};

export const requestVerifiedCodeSchema: AjvSchema = {
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      pattern: '^(\\w+([\\.\\+-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+)$',
    },
  },
};

export const checkEmailSchema: AjvSchema = {
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      pattern: '^(\\w+([\\.\\+-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+)$',
    },
  },
};

export const checkVerifiedCodeSchema: AjvSchema = {
  type: 'object',
  required: ['email', 'verifiedCode'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      pattern: '^(\\w+([\\.\\+-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+)$',
    },
    verifiedCode: {
      type: 'string',
      pattern: '^\\d{6}$',
    },
  },
};

export const registerSchema: AjvSchema = {
  type: 'object',
  required: ['email', 'password', 'verifiedCode'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      pattern: '^(\\w+([\\.\\+-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+)$',
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 255,
    },
    verifiedCode: {
      type: 'string',
      pattern: '^\\d{6}$',
    },
  },
};
