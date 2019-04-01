/**
 * types of http responses
 */
module.exports.responseTypes = {
    success: 'success',
    error: 'error'
};

/**
 * success statuses and codes
 */
module.exports.success = {
    c200: {'code' : 200, 'status' : 'OK'},
    c201 : {'code' : 201, 'status' : 'Created'},
    c202 : {'code' : 202, 'status' : 'Accepted'},
    c203 : {'code' : 203, 'status' : 'Non-Authoritative Information'},
    c204 : {'code' : 204, 'status' : 'No Content'},
    c205 : {'code' : 205, 'status' : 'Reset Content'},
}

/**
 * error statuses and codes
 */
module.exports.error = {
    client_error: {
        c400 : {'code' : 400, 'status' : 'Bad Request'},
        c401 : {'code' : 401, 'status' : 'Unauthorized'},
        c402 : {'code' : 402, 'status' : 'Payment Required'},
        c403 : {'code' : 403, 'status' : 'Forbidden'},
        c404 : {'code' : 404, 'status' : 'Not Found'},
        c405 : {'code' : 405, 'status' : 'Method Not Allowed'},
        c406 : {'code' : 406, 'status' : 'Not Acceptable'},
    },
    server_error: {
        c500 : {'code' : 500, 'status' : 'Internal Server Error'},
        c501 : {'code' : 501, 'status' : 'Not Implemented'},
        c502 : {'code' : 502, 'status' : 'Bad Gateway'},
    },
}
