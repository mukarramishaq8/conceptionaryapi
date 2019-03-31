/**
 * it includes routes with names
 * each name must contain atleast two attributes get and put
 * with these two routes we can handle four http request (GET, POST, PUT, DELETE)
 * you can explicity gives separate route to each http method too
 */
module.exports = {
    concepts: {
        get: '/concepts',
        post: '/concepts',
        put: '/concepts/:conceptId',
        delete: '/concepts/:conceptId',
        getOne: '/concepts/:conceptId',
    },
};