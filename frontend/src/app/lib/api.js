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

function createApiError(error, fallbackMessage) {
  const apiError = new Error(getErrorMessage(error, fallbackMessage));
  apiError.status = error.response?.status;
  return apiError;
}

export function isAuthError(error) {
  return error.status === 401 || error.status === 403;
}

export async function registerUser(registerData) {
  try {
    const response = await api.post("/auth/register", registerData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Registration failed");
  }
}

export async function loginUser(loginData) {
  try {
    const response = await api.post("/auth/login", loginData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Login failed");
  }
}

export async function verifyEmail(verifyData) {
  try {
    const response = await api.post("/auth/verify-email", verifyData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Email verification failed");
  }
}

export async function resendVerificationOtp(email) {
  try {
    const response = await api.post("/auth/resend-verification-otp", {
      email,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to resend OTP");
  }
}

export async function forgotPassword(email) {
  try {
    const response = await api.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to send password reset OTP");
  }
}

export async function resetPassword(resetData) {
  try {
    const response = await api.post("/auth/reset-password", resetData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to reset password");
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load profile");
  }
}

export async function logoutUser() {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw createApiError(error, "Logout failed");
  }
}

export async function getCommutes() {
  try {
    const response = await api.get("/commutes");
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load commutes");
  }
}

export async function getCommute(commuteId) {
  try {
    const response = await api.get(`/commutes/${commuteId}`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load commute");
  }
}

export async function createCommute(commuteData) {
  try {
    const response = await api.post("/commutes", commuteData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to create commute");
  }
}

export async function updateCommute(commuteId, commuteData) {
  try {
    const response = await api.patch(`/commutes/${commuteId}`, commuteData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to update commute");
  }
}

export async function updateCreatorCommuteLocation(commuteId, locationData) {
  try {
    const response = await api.patch(
      `/commutes/${commuteId}/creator-location`,
      locationData,
    );
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to update creator live location");
  }
}

export async function joinCommute(commuteId) {
  try {
    const response = await api.post(`/commutes/${commuteId}/join`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to join commute");
  }
}

export async function getMyCommutes() {
  try {
    const response = await api.get("/commutes/my");
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load my commutes");
  }
}

export async function closeCommute(commuteId) {
  try {
    const response = await api.patch(`/commutes/${commuteId}/close`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to close commute");
  }
}

export async function completeCommute(commuteId) {
  try {
    const response = await api.patch(`/commutes/${commuteId}/complete`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to complete commute");
  }
}

export async function submitCommuteRatings(commuteId, ratingData) {
  try {
    const response = await api.post(`/commutes/${commuteId}/ratings`, ratingData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to submit feedback");
  }
}

export async function getUserRatingSummary(userId) {
  try {
    const response = await api.get(`/ratings/users/${userId}/summary`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load rating summary");
  }
}

export async function cancelCommute(commuteId) {
  try {
    const response = await api.patch(`/commutes/${commuteId}/cancel`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to cancel commute");
  }
}

export async function getMyParticipations() {
  try {
    const response = await api.get("/participations/my");
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load participations");
  }
}

export async function leaveCommute(commuteId) {
  try {
    const response = await api.delete(`/commutes/${commuteId}/leave`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to leave commute");
  }
}

export async function deleteParticipationHistory(participationId) {
  try {
    const response = await api.delete(`/participations/my/${participationId}`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to delete participation history");
  }
}

export async function getCommuteRequests(commuteId) {
  try {
    const response = await api.get(`/commutes/${commuteId}/requests`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load commute requests");
  }
}

export async function getCommuteParticipants(commuteId) {
  try {
    const response = await api.get(`/commutes/${commuteId}/participants`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load participants");
  }
}

export async function updateMyCommuteLocation(commuteId, locationData) {
  try {
    const response = await api.patch(
      `/commutes/${commuteId}/location`,
      locationData,
    );
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to update live location");
  }
}

export async function updateJoinRequest(commuteId, userId, status) {
  try {
    const response = await api.patch(`/commutes/${commuteId}/request/${userId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to update join request");
  }
}

export async function getMyNotifications() {
  try {
    const response = await api.get("/notifications/my");
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load notifications");
  }
}

export async function markNotificationRead(notificationId) {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to update notification");
  }
}

export async function changePassword(passwordData) {
  try {
    const response = await api.post("/auth/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to change password");
  }
}

export async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append("profilePicture", file);

  try {
    const response = await api.patch("/users/me/profile-picture", formData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to upload profile picture");
  }
}

export async function clearProfilePicture() {
  try {
    const response = await api.delete("/users/me/profile-picture");
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to clear profile picture");
  }
}

export async function updateRoutePreference(preferenceData) {
  try {
    const response = await api.patch(
      "/users/me/route-preference",
      preferenceData,
    );
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to update route preference");
  }
}

export async function getAdminUsers() {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to load users");
  }
}

export async function deleteAdminUser(userId) {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to delete user");
  }
}
