// server/roles.js
const AccessControl = require("accesscontrol");
const ac = new AccessControl();
 
exports.roles = (function() {
    ac.grant("basic")
        .createOwn('review')
        .readOwn("user")
        .updateOwn("user")
        .readOwn("review")
        .updateOwn("review")
        .readAny("book")
        .readAny("user")
        .readAny("review")
    
    ac.grant("supervisor")
        .extend("basic")
        .updateAny("user")
        .updateAny("review")
        .createAny("tag")
    
    ac.grant("admin")
        .extend("basic")
        .extend("supervisor")
        .deleteAny("user")
        .deleteAny("review")
        .updateAny("book")
        .deleteAny("book")
        .updateAny("tag")
        .deleteAny("tag")
    
    return ac;
})();