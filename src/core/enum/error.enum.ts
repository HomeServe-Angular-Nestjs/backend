export enum ErrorMessage {
    // Not Found
    PROVIDER_NOT_FOUND = 'Provider not found',
    SERVICE_NOT_FOUND = 'Service not found',
    USER_NOT_FOUND = 'User not found',
    DOCUMENT_NOT_FOUND = 'Document not found',

    // With ID placeholders
    PROVIDER_NOT_FOUND_WITH_ID = 'Provider not found with ID: ',
    CUSTOMER_NOT_FOUND_WITH_ID = 'Customer not found with ID: ',
    SERVICE_NOT_FOUND_WITH_ID = 'Service not found with ID: ',

    // Bad Request
    INVALID_INPUT = 'Invalid input data',
    MISSING_FIELDS = 'Required fields are missing',
    FILE_UPLOAD_FAILED = 'File upload failed',
    INVALID_CREDENTIALS = 'Invalid email or password',

    // Forbidden
    FORBIDDEN_ACTION = 'You are not allowed to perform this action',

    // Unauthorized
    UNAUTHORIZED_ACCESS = 'Unauthorized access, please login',
    USER_BLOCKED = 'You are blocked by the admin.',

    // Server Errors
    INTERNAL_SERVER_ERROR = 'An unexpected error occurred. Please try again later',
    DOCUMENT_CREATION_ERROR = 'Error creating document',

    // Conflict Error
    DOCUMENT_ALREADY_EXISTS = 'Already exists',

    // Socket Error
    SOCKET_CONNECTION_REJECTED = 'Socket connection rejected: ',

    // Token Errors
    NO_TOKEN_FOUND = 'No token provided.',
    INVALID_REFRESH_TOKEN = 'Invalid or expired refresh token.',

    UPLOAD_FAILED = 'Failed to upload an image.',
}
