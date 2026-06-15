import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import ChangePasswordComponent from "./changePassword";

const EmployeeChangePassword = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <ChangePasswordComponent />
      </Route>
    </Switch>
  );
};

export default EmployeeChangePassword;
