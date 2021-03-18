const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function() {
ac.grant("basic")
 .createOwn("profile")
 .readOwn("profile")
 .deleteOwn("profile")

ac.grant("admin")
 .extend("basic")
 .readAny("profile")
 .updateAny("profile")
 .deleteAny("profile")
 .createAny("profile")

ac.grant("super-admin")
 .extend("basic")
 .extend("admin")
 .updateAny("profile")
 .deleteAny("profile")

return ac;
})();