"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer, List, ListItem } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import QueueIcon from "@mui/icons-material/Queue";
import GroupsIcon from "@mui/icons-material/Groups";
import { GiCardPick } from "react-icons/gi";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    {
      icon: <EmojiEventsIcon className="text-red-500" />,
      path: "/tournaments",
    },
    {
      icon: <GiCardPick className="text-red-500 text-xl" />,
      path: "/cardlibrary",
    },
    { icon: <QueueIcon className="text-red-500" />, path: "/decks" },
    { icon: <GroupsIcon className="text-red-500" />, path: "/clubs" },
  ];

  return (
    <>
      {/* Standalone menu button without AppBar */}
      <div className="fixed top-4 left-4 z-[1500]">
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
            width: 70,
            backgroundColor: "#0f0f0f",
            borderRight: "1px solid #1f1f1f",
            paddingTop: "32px", // Reduced padding
          },
        }}
      >
        <List className="flex flex-col items-center gap-4 mt-4">
          {menuItems.map((item, index) => (
            <ListItem key={index}>
              <IconButton
                onClick={() => {
                  toggleDrawer();
                  router.push(item.path);
                }}
                className="hover:text-red-500 transition duration-200"
              >
                {item.icon}
              </IconButton>
            </ListItem>
          ))}
          {localStorage.getItem("isAdmin") === "1" && (
            <ListItem>
              <IconButton
                onClick={() => router.push("/adminpanel")}
                sx={{ color: "red" }}
              >
                <AdminPanelSettingsIcon />
              </IconButton>
            </ListItem>
          )}
          <ListItem>
            <IconButton
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              sx={{ color: "red" }}
            >
              <LogoutIcon />
            </IconButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}