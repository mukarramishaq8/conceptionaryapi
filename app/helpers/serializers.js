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