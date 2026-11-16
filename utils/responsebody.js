// Shared response templates used across controllers.
//
// WARNING: these are exported as singleton objects. Controllers mutate them
// before sending (`successResponseBody.data = ...`), so concurrent requests
// share the same object and can overwrite each other's data. Prefer building
// a fresh response object per request in each controller.
const errorResponseBody = {
    err: {},
    data: {},
    message: 'Something went wrong, cannot process the request',
    success: false
}

const successResponseBody = {
    err: {},
    data: {},
    message: 'Successfully processed the request',
    success: true
}

module.exports = {
    successResponseBody,
    errorResponseBody
};