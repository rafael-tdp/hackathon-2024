// toast.js
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export const showToast = ({ message, type = "default", transition = "bounce" }) => {
  toast(message, {
    type, // Type de toast : "success", "error", "info", "warning", etc.
    transition, // Transition : "flip", "bounce", "slide", "zoom"
    autoClose: 2000,
    dangerouslyHTMLString: true,
  });
};
