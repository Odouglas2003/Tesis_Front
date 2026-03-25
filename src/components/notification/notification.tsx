"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Badge,
  Divider,
  Tooltip,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CircleIcon from "@mui/icons-material/FiberManualRecord";
import { Notification } from "@/types/interface";
import {
  getNotificationsByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/api";
import { useUser } from "@/app/UserContext";
import { useAppTheme } from "@/app/ThemeProviderClient";

const NotificationModal = () => {
  // Solo usamos theme para iconos
  const { colors } = useAppTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);
  const { user } = useUser();
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);
  useEffect(() => {
    if (!userEmail) return;
    fetchNotifications();
  }, [userEmail]);
  useEffect(() => {
    if (!userEmail) return;
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [userEmail]);
  const fetchNotifications = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const { data: arr = [] } = await getNotificationsByUser(userEmail);
      setNotifications(arr);
      const unread: number = arr.filter((n: Notification) => !n.readers).length;
      setNotificationCount(unread);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenModal = async () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const handleMarkOneAsRead = async (notif: Notification) => {
    if (!userEmail) return;
    try {
      await markNotificationAsRead(userEmail, notif.referenceId, notif.type);
      fetchNotifications();
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };
  const handleMarkAllAsRead = async () => {
    if (!userEmail) return;
    try {
      await markAllNotificationsAsRead(userEmail);
      fetchNotifications();
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };
  const handleNotificationButtonClick = async () => {
    await handleOpenModal();
  };
  return (
    <>
      <IconButton
        onClick={handleNotificationButtonClick}
        sx={{
          '&:hover .top-notif-icon': { color: colors.text },
        }}
      >
        <Badge
          badgeContent={notificationCount}
          sx={{ "& .MuiBadge-badge": { backgroundColor: "#23FFDC" } }}
          overlap="circular"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <NotificationsIcon className="top-notif-icon" sx={{ fontSize: "24px", color: '#fff', transition: 'color .25s ease' }} />
        </Badge>
      </IconButton>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          pt: 8,
          pr: 3,
        }}
      >
        <Box
          sx={{
            width: "371px",
            maxHeight: "80vh",
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.12)",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #f0f0f0",
            outline: "none",
          }}
        >
          <Box sx={{ p: 2.5, pb: 1.5 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                fontFamily="Poppins"
                fontSize="20px"
                sx={{ color: "#002B5B" }}
              >
                Notificaciones
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mx: 2.5 }} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 2.5, py: 2 }}
          >
            <Typography
              sx={{ color: "#000", fontWeight: 500 }}
              fontSize="16px"
              fontFamily="Poppins"
            >
              Recientes
            </Typography>
            <Typography
              fontSize="16px"
              fontFamily="Poppins"
              fontWeight={400}
              sx={{
                color: "#000",
                cursor: "pointer",
                "&:hover": {
                  color: "#1976d2",
                },
              }}
              onClick={handleMarkAllAsRead}
            >
              Marcar todo como leído
            </Typography>
          </Box>

          <Box
            sx={{
              overflowY: "auto",
              flexGrow: 1,
              px: 2.5,
              pb: 2.5,
              maxHeight: "50vh",
            }}
          >
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Typography
                variant="body2"
                fontFamily="Poppins"
                fontSize="16px"
                sx={{ color: "#000", textAlign: "center", py: 4 }}
              >
                No hay alertas activas
              </Typography>
            ) : (
              notifications.map((notif) => (
                <Box
                  key={notif._id}
                  display="flex"
                  alignItems="flex-start"
                  bgcolor={
                    selectedNotifId === notif._id ? "#e0f7fa" : "transparent"
                  }
                  borderRadius={2}
                  p={1.5}
                  mb={1}
                  sx={{
                    position: "relative",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "#e0f7fa",
                    },
                  }}
                  onClick={async () => {
                    setSelectedNotifId(notif._id);
                    await handleMarkOneAsRead(notif);
                  }}
                  onMouseEnter={() => setSelectedNotifId(notif._id)}
                  onMouseLeave={() => setSelectedNotifId(null)}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#0087FF",
                      width: 40,
                      height: 40,
                      mr: 1.5,
                      mt: 0.5,
                      ml: 1,
                    }}
                  >
                    <NotificationsIcon
                      className="notif-icon"
                      sx={{
                        color: '#fff',
                        fontSize: 20,
                        transition: 'color .25s ease',
                      }}
                    />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      fontSize="14px"
                      color="#000"
                      fontFamily="Poppins"
                      fontWeight={400}
                      sx={{
                        lineHeight: 1.4,
                        pr: 1,
                      }}
                    >
                      {notif.message}
                    </Typography>
                  </Box>
                  <Tooltip title="Marcar como Leída">
                    <CircleIcon
                      className="notif-unread"
                      sx={{
                        color: 'red',
                        fontSize: 10,
                        position: 'absolute',
                        top: 30,
                        right: 320,
                        transition: 'color .25s ease',
                      }}
                    />
                  </Tooltip>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default NotificationModal;
