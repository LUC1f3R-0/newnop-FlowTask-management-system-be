import Joi from 'joi';

const validationSchema = Joi.object({
  PORT: Joi.number().port().default(3000),

  // DATABASE_URL: Joi.string().trim().required(),
  DATABASE_HOST: Joi.string().trim().optional(),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USER: Joi.string().trim().optional(),
  DATABASE_PASSWORD: Joi.string().trim().optional(),
  DATABASE_NAME: Joi.string().trim().optional(),
  DB_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
  DB_LOGGING: Joi.boolean().truthy('true').falsy('false').default(false),

  SMTP_HOST: Joi.string().trim().required(),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  SMTP_USER: Joi.string().trim().required(),
  SMTP_PASS: Joi.string().trim().required(),

  CORS_ORIGINS: Joi.string()
    .pattern(/^https?:\/\/[^\s,]+(,https?:\/\/[^\s,]+)*$/)
    .required(),
});

export default validationSchema;
