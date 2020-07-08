import React from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <nav>
      <NavLink exact activeClassName="active" to="/">
        Home
      </NavLink>
      <NavLink activeClassName="active" to="/users">
        Users
      </NavLink>
      <NavLink activeClassName="active" to="/contact">
        Contact
      </NavLink>
    </nav>
  );
} 