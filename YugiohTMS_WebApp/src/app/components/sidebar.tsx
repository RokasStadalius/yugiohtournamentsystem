"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Collapse, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import QueueIcon from "@mui/icons-material/Queue";
import GroupsIcon from "@mui/icons-material/Groups";
import { GiCardPick } from "react-icons/gi";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Sword } from "lucide-react";
import { Mail } from "lucide-react";
import ForumIcon from '@mui/icons-material/Forum';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import Home from '@mui/icons-material/Home';

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [deckOpen, setDeckOpen] = useState(false);
  const [tournamentOpen, setTournamentOpen] = useState(false);
  const [clubOpen, setClubOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("isAdmin") === "1");
    }
  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleDeckClick = () => {
    setDeckOpen(!deckOpen);
  };

  const handleTournamentClick = () => {
    setTournamentOpen(!tournamentOpen);
  };

  const handleClubClick = () => {
    setClubOpen(!clubOpen);
  };

  const deckItems = [
    { icon: <QueueIcon className="text-red-500" />, path: "/decks", name: "My Decks" },
    { icon: <GiCardPick className="text-red-500 text-xl" />, path: "/cardlibrary", name: "Card Library" },
  ];

  const tournamentItems = [
    { icon: <EmojiEventsIcon className="text-red-500" />, path: "/tournaments", name: "My Tournaments" },
  ];

  const clubItems = [
    { icon: <GroupsIcon className="text-red-500" />, path: "/clubs", name: "My Clubs" },
    { icon: <Sword className="text-red-500" />, path: "/clubs/public", name: "Public Clubs" },
  ];

  return (
    <>
      <div className={`fixed top-4 left-4 z-[1500] ${open ? 'hidden' : ''}`}>
        <IconButton
          onClick={toggleDrawer}
          sx={{ color: "red", backgroundColor: "rgba(15, 15, 15, 0.9)" }}
        >
          <MenuIcon />
        </IconButton>
      </div>

      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: 200,
            backgroundColor: "#0f0f0f",
            borderRight: "1px solid #1f1f1f",
            paddingTop: "32px",
          },
        }}
      >
        <List className="flex flex-col gap-2 mt-2">
          <ListItem disablePadding sx={{ marginTop: "16px" }}>
              <ListItemButton
                onClick={() => router.push("/")}
                className="hover:bg-zinc-800 transition duration-200 pl-4"
                sx={{ color: "red" }}
              >
                <ListItemIcon sx={{ color: "red" }}>
                  <Home />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
          {/* Deck Group */}
          <ListItemButton onClick={handleDeckClick} sx={{ color: "white", paddingLeft: "16px" }}>
            <ListItemIcon sx={{ color: "red" }}>
              <QueueIcon />
            </ListItemIcon>
            <ListItemText primary="Decks" />
            {deckOpen ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
          </ListItemButton>
          <Collapse in={deckOpen} timeout="auto" unmountOnExit>
            <List disablePadding>
              {deckItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      toggleDrawer();
                      router.push(item.path);
                    }}
                    className="hover:bg-zinc-800 transition duration-200 pl-8"
                    sx={{ color: "white" }}
                  >
                    <ListItemIcon sx={{ color: "red" }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Tournament Group */}
          <ListItemButton onClick={handleTournamentClick} sx={{ color: "white", paddingLeft: "16px", marginTop: "8px" }}>
            <ListItemIcon sx={{ color: "red" }}>
              <EmojiEventsIcon />
            </ListItemIcon>
            <ListItemText primary="Tournaments" />
            {tournamentOpen ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
          </ListItemButton>
          <Collapse in={tournamentOpen} timeout="auto" unmountOnExit>
            <List disablePadding>
              {tournamentItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      toggleDrawer();
                      router.push(item.path);
                    }}
                    className="hover:bg-zinc-800 transition duration-200 pl-8"
                    sx={{ color: "white" }}
                  >
                    <ListItemIcon sx={{ color: "red" }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Club Group */}
          <ListItemButton onClick={handleClubClick} sx={{ color: "white", paddingLeft: "16px", marginTop: "8px" }}>
            <ListItemIcon sx={{ color: "red" }}>
              <GroupsIcon />
            </ListItemIcon>
            <ListItemText primary="Clubs" />
            {clubOpen ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
          </ListItemButton>
          <Collapse in={clubOpen} timeout="auto" unmountOnExit>
            <List disablePadding>
              {clubItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      toggleDrawer();
                      router.push(item.path);
                    }}
                    className="hover:bg-zinc-800 transition duration-200 pl-8"
                    sx={{ color: "white" }}
                  >
                    <ListItemIcon sx={{ color: "red" }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                toggleDrawer();
                router.push("/forum");
              }}
              className="hover:bg-zinc-800 transition duration-200 pl-4"
              sx={{ color: "white" }}
            >
              <ListItemIcon sx={{ color: "red" }}>
                <ForumIcon />
              </ListItemIcon>
              <ListItemText primary="Forum" />
            </ListItemButton>
          </ListItem>

          {/* My Invitations */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                toggleDrawer();
                router.push("/clubs/invitations");
              }}
              className="hover:bg-zinc-800 transition duration-200 pl-4"
              sx={{ color: "white" }}
            >
              <ListItemIcon sx={{ color: "red" }}>
                <Mail />
              </ListItemIcon>
              <ListItemText primary="My Invitations" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                toggleDrawer();
                router.push("/leaderboard");
              }}
              className="hover:bg-zinc-800 transition duration-200 pl-4"
              sx={{ color: "white" }}
            >
              <ListItemIcon sx={{ color: "red" }}>
                <LeaderboardIcon />
              </ListItemIcon>
              <ListItemText primary="Leaderboard" />
            </ListItemButton>
          </ListItem>

          {isAdmin && (
            <ListItem disablePadding sx={{ marginTop: "16px" }}>
              <ListItemButton
                onClick={() => router.push("/adminpanel")}
                className="hover:bg-zinc-800 transition duration-200 pl-4"
                sx={{ color: "red" }}
              >
                <ListItemIcon sx={{ color: "red" }}>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </ListItemButton>
            </ListItem>
          )}

          {/* Logout */}
          <ListItem disablePadding sx={{ marginTop: "auto" }}>
            <ListItemButton
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="hover:bg-zinc-800 transition duration-200 pl-4"
              sx={{ color: "red" }}
            >
              <ListItemIcon sx={{ color: "red" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
