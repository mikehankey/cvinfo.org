import React from 'react';
import { bool } from 'prop-types';
import { StyledMenu } from './Menu.styled';
import { NavLink } from "react-router-dom";

const Menu = ({ open, ...props }) => {
  
  const isHidden = open ? true : false;
  const tabIndex = isHidden ? 0 : -1;

  return (
    <StyledMenu open={open} aria-hidden={!isHidden} {...props}>
      <nav>
         <NavLink exact activeClassName="active" to="/" tabIndex={tabIndex}>
         Home
         </NavLink>
         <NavLink to="/" tabIndex={tabIndex}>
         Forecast
         </NavLink> 
      </nav>
    </StyledMenu>
  )
}

Menu.propTypes = {
  open: bool.isRequired,
}

export default Menu;