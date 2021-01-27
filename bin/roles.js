// server/roles.js
const AccessControl = require("accesscontrol");
const ac = new AccessControl();
 
exports.roles = (function() {
ac.grant("basic")
 .readOwn("profile")
 .updateOwn("profile")
 .readOwn("review")
 .updateOwn("review")
 
ac.grant("supervisor")
 .extend("basic")
 .readAny("profile")
 .readAny("review")
 
ac.grant("admin")
 .extend("basic")
 .extend("supervisor")
 .updateAny("profile")
 .deleteAny("profile")
 .updateAny("review")
 .deleteAny("review")
 
return ac;
})();