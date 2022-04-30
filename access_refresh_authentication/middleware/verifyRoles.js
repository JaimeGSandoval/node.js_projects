// We pass in how ever many roles we want to.
// It's how ever many you're checking for or want to allow into a specific route

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) {
      return res.sendStatus(401);
    }

    const rolesArray = [...allowedRoles];
    console.log(rolesArray);
    console.log(req.roles);
    const result = req.roles
      .map((role) => rolesArray.includes(role))
      .find((booleanVal) => booleanVal === true);

    if (!result) {
      return res.sendStatus(401);
    }

    // If the request has made it this far, that means this route can be accessed and we can call next()

    next();
  };
};

module.exports = verifyRoles;
