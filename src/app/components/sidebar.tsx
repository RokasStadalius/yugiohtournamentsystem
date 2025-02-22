'use client'

import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Drawer, List, ListItem } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import Toolbar from "@mui/material/Toolbar";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { GiCardPick } from "react-icons/gi";

export function Sidebar() {
  const [open, setOpen] = useState(false); // State to control Drawer open/close

  const toggleDrawer = () => {
    setOpen(!open); // Toggle the open/close state
  };

  return (
    <>
      {/* Toggle button to open/close Drawer */}
      <AppBar>
        <Toolbar>
           <IconButton edge="start" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      

      {/* Drawer component */}
      <Drawer
        variant="temporary" // 'temporary' will allow it to toggle
        anchor="left"
        open={open}
        onClose={toggleDrawer} // Close when clicking outside the Drawer
        sx={{
          width: 250, // Set the drawer width
          '& .MuiDrawer-paper': {
            width: 70, // Paper width
          },
        }}
      >
        <List>
          <ListItem>
            <IconButton>
              <PersonIcon />
            </IconButton>
          </ListItem>
          <ListItem>
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </ListItem>
          <ListItem>
            <IconButton>
              <AddIcon />
            </IconButton>
          </ListItem>
          <ListItem>
            <IconButton>
              <EmojiEventsIcon/>
            </IconButton>
          </ListItem>
          <ListItem>
            <IconButton>
              <GiCardPick/>
            </IconButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
