import api from "../api/axios";

/*
----------------------------------
Get Logged-in User Profile
(Student / Staff / Admin)
----------------------------------
*/

export const getProfile = async () => {
  const response = await api.get("/profile");

  return response.data?.data || {};
};

/*
----------------------------------
Update Logged-in User Profile
(Student / Staff / Admin)
----------------------------------
*/

export const updateProfile = async (data) => {
  const payload = {
    name: data.name,
    phone: data.phone,
    department: data.department,
    bio: data.bio,
    profile_image: data.profile_image,
  };

  // Student-only fields
  if (data.roll_number !== undefined) {
    payload.roll_number = data.roll_number;
  }

  if (data.hostel !== undefined) {
    payload.hostel = data.hostel;
  }

  // Staff/Admin fields
  if (data.designation !== undefined) {
    payload.designation = data.designation;
  }

  if (data.office !== undefined) {
    payload.office = data.office;
  }

  const response = await api.put("/profile", payload);

  return response.data?.data || {};
};
