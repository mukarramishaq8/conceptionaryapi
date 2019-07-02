const _ = require('underscore');
module.exports.serializeURLQuery = query => {
    let {offset, limit} = this.getPaginators(query);
    let include = this.getIncludedModels(query);
    return {offset, limit, include};
};

module.exports.getPaginators = ({offset, limit}) => {
    offset =  parseInt(offset);
    limit =  parseInt(limit);
    return {offset: offset ? offset : undefined, limit: limit ? limit : undefined};
};

module.exports.getIncludedModels = ({include}) => {
    let includedModels = [];
    if (_.isString(include) === true) { //when include is string
        includedModels.push({model: include});
    } else if (_.isArray(include) === true) { //when include is an array
        include.forEach(model => includedModels.push({model}))
    }
    return includedModels;
};
/**
 * getQueryFields return an array of fields splitted through the delimiter
 * @param {Object} query
 * @param {String} delimiter it is optional and its default value is ' '.
 * @return {Array}
 */
module.exports.getQueryFields = ({fields}, delimiter = ' ') => {
    return _.isEmpty(fields) ? undefined : fields.split(delimiter);
}
/**
 * isRelationshipIncluded tells whether the given object has 
 * relationships attribute and it has some value other than undefined or empty string
 * @param {Object} query
 * @return {Boolean}
 */
module.exports.isRelationshipIncluded = ({relationships}) => {
    return _.isEmpty(relationships) || _.isEqual(relationships, 'false') ? false : true;
}
module.exports.withSelfAssociationsOnly = ({withSelfAssociationsOnly}) => {
    return _.isEmpty(withSelfAssociationsOnly) || _.isEqual(withSelfAssociationsOnly, 'false') ? false : true;
}