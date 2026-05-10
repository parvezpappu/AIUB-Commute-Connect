import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

function getErrorMessage(error, fallbackMessage) {
  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (message) {
    return message;
  }

  if (error.response?.status) {
    return `${fallbackMessage} (${error.response.status})`;
  }

  return error.message || fallbackMessage;
}

export async function registerUser(registerData) {
  try {
    const response = await api.post("/auth/register", registerData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Registration failed"));
  }
}

export async function loginUser(loginData) {
  try {
    const response = await api.post("/auth/login", loginData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Login failed"));
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load profile"));
  }
}

export async function logoutUser() {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Logout failed"));
  }
}

export async function getCommutes() {
  try {
    const response = await api.get("/commutes");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load commutes"));
  }
}

export async function getCommute(commuteId) {
  try {
    const response = await api.get(`/commutes/${commuteId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load commute"));
  }
}

export async function createCommute(commuteData) {
  try {
    const response = await api.post("/commutes", commuteData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create commute"));
  }
}

export async function joinCommute(commuteId) {
  try {
    const response = await api.post(`/commutes/${commuteId}/join`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to join commute"));
  }
}

export async function getMyCommutes() {
  try {
    const response = await api.get("/commutes/my");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load my commutes"));
  }
}

export async function closeCommute(commuteId) {
  try {
    const response = await api.patch(`/commutes/${commuteId}/close`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to close commute"));
  }
}

export async function cancelCommute(commuteId) {
  try {
    const response = await api.patch(`/commutes/${commuteId}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to cancel commute"));
  }
}

export async function getMyParticipations() {
  try {
    const response = await api.get("/participations/my");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load participations"));
  }
}

export async function leaveCommute(commuteId) {
  try {
    const response = await api.delete(`/commutes/${commuteId}/leave`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to leave commute"));
  }
}


export async function getCommuteRequests(commuteId) {
  try {
    const response = await api.get(`/commutes/${commuteId}/requests`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load commute requests"));
  }
}

export async function getCommuteParticipants(commuteId) {
  try {
    const response = await api.get(`/commutes/${commuteId}/participants`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load participants"));
  }
}

export async function updateJoinRequest(commuteId, userId, status) {
  try {
    const response = await api.patch(`/commutes/${commuteId}/request/${userId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update join request"));
  }
}

export async function getMyNotifications() {
  try {
    const response = await api.get("/notifications/my");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load notifications"));
  }
}

export async function markNotificationRead(notificationId) {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update notification"));
  }
}
