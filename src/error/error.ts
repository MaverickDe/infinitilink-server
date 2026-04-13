
interface BaseError {
  stq_controlled: true;
  code: string;
  message: string;
  name: string;
  statusCode: number;
  errors?: any;
}

const createError = (
  data: Omit<BaseError, "stq_controlled" >
): BaseError => ({
  stq_controlled: true,
    errors: [],
  ...data,
});


export const ERRORSMG = {
  GENERAL_ERROR: createError({
    code: "serr_1000",
    message: "A general server error occurred. Please try again later.",
    name: "GeneralServerError",
    statusCode: 500,

  }),


  NOT_FOUND_ERROR: createError({
    code: "serr_1001",
    message: "The requested resource was not found.",
    name: "NotFoundError",
    statusCode: 404,
    errors: [],
  }),

  VALIDATION_ERROR: createError({
    code: "serr_1002",
    message: "Data validation failed. Please check the input data.",
    name: "ValidationError",
    statusCode: 400,
    errors: [],
  }),

  AUTHENTICATION_ERROR: createError({
    code: "serr_1003",
    message: "Authentication failed. Please check your credentials.",
    name: "AuthenticationError",
    statusCode: 401,
    errors: [],
  }),
  AUTHORIZATION_ERROR: createError({
    code: "serr_1004",
    message: "Authorization failed. You do not have permission to access this resource.",
    name: "AuthorizationError",
    statusCode: 403,
    errors: [],
  }),
  KYC_VERIFICATION_ERROR: createError({
    code: "serr_1005",
    message: "KYC verification failed. Please ensure all required documents are submitted correctly.",
    name: "KYCVerificationError",
    statusCode: 400,
    errors: [],
  }),
  BAD_REQUEST_ERROR: createError({
    code: "serr_1006",
    message: "Bad request. Please check the request parameters.",
    name: "BadRequestError",
    statusCode: 400,
    errors: [],
  }),
  BAD_PARAMETER_ERROR: createError({
    code: "serr_1007",
    message: "Bad parameter. Please check the provided parameters.",
    name: "BadParameterError",
    statusCode: 400,
    errors: [],
  }),
    SOMETHING_WENT_WRONG_ERROR: createError({
    code: "serr_1008",
    message: "Something went wrong",
    name: "GeneralUnknownError",
    statusCode: 500,

  }),
    INVALID_CREDENTIALS: createError({
    code: "serr_1009",
    message: "Invalid credentials",
    name: "InvalidCredentialError",
    statusCode: 500,

  }),
    IS_EXIST_ERROR: createError({
    code: "serr_1010",
    message: "content already exists",
    name: "IsExistError",
    statusCode: 500,

  }),
  

  
} as const;
