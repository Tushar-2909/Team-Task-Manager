import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatStatus(status) {
  return {
    TODO: "Todo",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
  }[status] || status;
}

export function formatPriority(priority) {
  return {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  }[priority] || priority;
}

export function isOverdue(task) {
  if (!task.due_date || task.status === "DONE") return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
}
