import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LocationPicker from "./LocationPicker";

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    location: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLocationChange = (location) => {
    setFormData({
      ...formData,
      location,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, password, email, location } = formData;

    // Validation
    if (!username || username.length > 12) {
      toast.error("שם משתמש עד 12 תווים נדרש");
      return;
    }
    if (!password || password.length > 12) {
      toast.error("סיסמה עד 12 תווים נדרשת");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("אימייל לא תקין");
      return;
    }
    if (!location) {
      toast.error("יש לבחור מיקום");
      return;
    }

    // Simulate API Call
    toast.success("יוזר נוסף בהצלחה!");
    console.log("Submitted Data:", formData);

    // Reset form
    setFormData({ username: "", password: "", email: "", location: "" });
  };

  return (
      <div style={{ direction: "rtl", textAlign: "center" }}>
        <h2>הוספת יוזר חדש</h2>
        <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div className="field">
            <label className="label">שם משתמש:</label>
            <div className="control">
              <input
                  className="input"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  maxLength={12}
                  required
              />
            </div>
          </div>
          <div className="field">
            <label className="label">סיסמה:</label>
            <div className="control">
              <input
                  className="input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  maxLength={12}
                  required
              />
            </div>
          </div>
          <div className="field">
            <label className="label">אימייל:</label>
            <div className="control">
              <input
                  className="input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
              />
            </div>
          </div>
          <div className="field">
            <label className="label">מיקום:</label>
            <LocationPicker onLocationSelect={handleLocationChange} />
          </div>
          <div className="field">
            <button className="button is-primary" type="submit">
              הוסף יוזר
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
  );
};

export default AddUserForm;
