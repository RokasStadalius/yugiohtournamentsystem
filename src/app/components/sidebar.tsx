"use client";  // ✅ Add this at the top

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
import { useRouter } from 'next/navigation';  // ✅ Use next/navigation instead of next/router
import QueueIcon from '@mui/icons-material/Queue';

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();  // ✅ This will now work

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      <AppBar color="transparent" elevation={0}>
        <Toolbar>
           <IconButton edge="start" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        sx={{
          width: 250,
          '& .MuiDrawer-paper': {
            width: 70,
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
            <IconButton onClick={() => router.push('/tournaments')}>
              <EmojiEventsIcon />
            </IconButton>
          </ListItem>
          <ListItem>
            <IconButton onClick={() => router.push('/deckbuilder')}>  
              <GiCardPick />
            </IconButton>
          </ListItem>
          <ListItem>
            <IconButton onClick={() => router.push('/decks')}>  
              <QueueIcon />
            </IconButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
