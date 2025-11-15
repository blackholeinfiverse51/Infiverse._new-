import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import api, { API_URL } from "@/lib/api";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { isValid, parse } from "date-fns";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/auth-context";
import { getUserTasks } from "@/lib/user-api";

export function CreateTaskDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]); // ✅ Initialize as empty array
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [selectedUserTasks, setSelectedUserTasks] = useState([]);
  const [loadingUserTasks, setLoadingUserTasks] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    assignee: "",
    priority: "Medium",
    status: "Pending",
    dependencies: [],
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        description: "",
        department: "",
        assignee: "",
        priority: "Medium",
        status: "Pending",
        dependencies: [],
      });
      setDueDate("");
      setDocumentFile(null);
      setDateError("");
      setFilteredUsers([]);
      setAssigneeSearch("");
      setSelectedUserTasks([]);
      setLoadingUserTasks(false);

      const fetchData = async () => {
  try {
    // ✅ FIXED: Use authenticated API methods instead of direct axios calls
    const [departmentsResponse, usersResponse, tasksResponse] = await Promise.all([
      api.departments.getDepartments(),
      api.users.getUsers(), // Use authenticated API method
      api.tasks.getTasks(), // Use authenticated API method
    ]);

    console.log('Departments response:', departmentsResponse);
    console.log('Users response:', usersResponse);
    console.log('Tasks response:', tasksResponse);

    // ✅ Handle different response formats for departments
    let departmentsData = [];
    if (Array.isArray(departmentsResponse)) {
      departmentsData = departmentsResponse;
    } else if (departmentsResponse?.success && Array.isArray(departmentsResponse.data)) {
      departmentsData = departmentsResponse.data;
    } else if (departmentsResponse?.data && Array.isArray(departmentsResponse.data)) {
      departmentsData = departmentsResponse.data;
    }

    // ✅ Filter users by email starting with "blackhole" and ensure data is an array
    const filteredUsers = Array.isArray(usersResponse)
      ? usersResponse.filter((user) => user.email && user.email.toLowerCase().startsWith("blackhole"))
      : [];

    // ✅ Ensure all data is arrays
    setDepartments(departmentsData);
    setAllUsers(filteredUsers);
    setTasks(Array.isArray(tasksResponse) ? tasksResponse : []);

    console.log('Processed data:', {
      departments: departmentsData.length,
      users: filteredUsers.length,
      tasks: Array.isArray(tasksResponse) ? tasksResponse.length : 0
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Failed to load required data");
    // ✅ Set empty arrays on error
    setDepartments([]);
    setAllUsers([]);
    setTasks([]);
  }
};

      fetchData();
    }
  }, [open]);

  const handleDepartmentChange = (departmentId) => {
    setFormData((prev) => ({ ...prev, department: departmentId, assignee: "" }));
    setAssigneeSearch("");
    
    // ✅ Filter users by department - show all active users (removed blackhole filtering)
    const usersInDepartment = allUsers.filter(
      (user) => user.department?._id === departmentId && user.stillExist === 1
    );
    setFilteredUsers(usersInDepartment);
    
    console.log('Users in department:', usersInDepartment);
  };

  const handleAssigneeSearch = (e) => {
  const searchValue = e.target.value;
  setAssigneeSearch(searchValue);
  
  // Filter users by department and email starting with "blackhole"
  const usersInDepartment = allUsers.filter(
    (user) =>
      user.department?._id === formData.department &&
      user.stillExist === 1 &&
      user.email.toLowerCase().startsWith("blackhole")
  );
  
  if (searchValue.trim() === "") {
    setFilteredUsers(usersInDepartment);
  } else {
    const filtered = usersInDepartment.filter((user) =>
      user.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredUsers(filtered);
  }
};
  const handleAssigneeSelect = async (user) => {
    setFormData((prev) => ({ ...prev, assignee: user._id }));
    setAssigneeSearch(user.name);
    setFilteredUsers([]); // Clear filtered users after selection

    // Fetch user's previous tasks
    await fetchUserTasks(user._id);
  };

  const fetchUserTasks = async (userId) => {
    setLoadingUserTasks(true);
    try {
      const tasks = await getUserTasks(userId);
      setSelectedUserTasks(Array.isArray(tasks) ? tasks : []);
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      setSelectedUserTasks([]);
    } finally {
      setLoadingUserTasks(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDueDate(value);

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      setDateError("Please enter a valid date in YYYY-MM-DD format");
      return;
    }

    const parsedDate = parse(value, "yyyy-MM-dd", new Date());
    if (!isValid(parsedDate)) {
      setDateError("Invalid date");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      setDateError("Due date cannot be in the past");
      return;
    }

    setDateError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/html",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Only PDF, DOC, DOCX, TXT, and HTML files are allowed.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setDocumentFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.department || !formData.assignee) {
      toast.error("Please fill in all required fields (Title, Department, Assignee)");
      return;
    }

    if (dueDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dueDate)) {
        toast.error("Please enter a valid due date in YYYY-MM-DD format");
        return;
      }

      const parsedDate = parse(dueDate, "yyyy-MM-dd", new Date());
      if (!isValid(parsedDate)) {
        toast.error("Invalid due date");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        toast.error("Due date cannot be in the past");
        return;
      }
    }

    setIsLoading(true);

    try {
      // ✅ FIXED: Use authenticated API method for task creation
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("assignee", formData.assignee);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("dependencies", JSON.stringify(formData.dependencies));
      formDataToSend.append("user", user.id);
      formDataToSend.append("links", formData.links || "");

      if (dueDate) {
        formDataToSend.append("dueDate", dueDate);
      }
      if (documentFile) {
        formDataToSend.append("document", documentFile);
        formDataToSend.append("fileType", documentFile.type);
      }

      console.log("Creating task with data:", formData);

      // ✅ Use authenticated fetch API instead of axios
      const token = localStorage.getItem("WorkflowToken");
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          ...(token && { "x-auth-token": token }),
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create task: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Task created successfully:", result);

      toast.success("Task created successfully");
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error.message || "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[92vh] overflow-hidden bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-lg p-0">
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only dark:text-slate-100">Create New Task</DialogTitle>
        
        {/* Scrollable Content Area */}
        <div className="px-7 pt-7 pb-6 overflow-y-auto max-h-[calc(92vh-130px)] scrollbar-thin scrollbar-thumb-white/20 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-white/30 dark:hover:scrollbar-thumb-slate-600">
          <div className="grid gap-6">
            {/* Task Title */}
            <div className="grid gap-2.5">
              <Label htmlFor="title" className="text-sm font-bold text-gray-900 dark:text-slate-200 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                Task Title <span className="text-red-400 ml-0.5">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter a descriptive task title..."
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="h-12 px-4 bg-white/10 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/30 rounded-xl transition-all duration-300 text-base font-medium placeholder:text-gray-500 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-100 backdrop-blur-xl"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2.5">
              <Label htmlFor="description" className="text-sm font-bold text-gray-900 dark:text-slate-200 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary shadow-lg shadow-secondary/50"></div>
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the task in detail..."
                className="min-h-[110px] px-4 py-3 bg-white/10 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 focus:border-secondary focus-visible:ring-4 focus-visible:ring-secondary/30 rounded-xl resize-none transition-all duration-300 text-base placeholder:text-gray-500 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-100 backdrop-blur-xl"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Links */}
            <div className="grid gap-2.5">
              <Label htmlFor="links" className="text-sm font-bold text-gray-900 dark:text-slate-200 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-accent shadow-lg shadow-accent/50"></div>
                Reference Links
              </Label>
              <Input
                id="links"
                placeholder="Add URLs separated by commas..."
                value={formData.links}
                onChange={(e) => handleChange("links", e.target.value)}
                className="h-12 px-4 bg-white/10 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 focus:border-accent focus-visible:ring-4 focus-visible:ring-accent/30 rounded-xl transition-all duration-300 text-base placeholder:text-gray-500 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-100 backdrop-blur-xl"
              />
            </div>

            {/* Department and Assignee Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="grid gap-2.5">
                <Label htmlFor="department" className="text-sm font-bold text-gray-900 dark:text-slate-200 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-info shadow-lg shadow-info/50"></div>
                  Department <span className="text-red-400 ml-0.5">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger id="department" className="h-12 px-4 bg-white/10 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 focus:border-info focus:ring-4 focus:ring-info/30 rounded-xl transition-all duration-300 text-base font-medium text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 backdrop-blur-xl">
                    <SelectValue placeholder={
                      Array.isArray(departments) && departments.length > 0 
                        ? "Select department..." 
                        : "Loading..."
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/30 dark:border-slate-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto" style={{backdropFilter: 'blur(20px)'}}>
                    {Array.isArray(departments) && departments.length > 0 && 
                      departments.map((dept) => (
                        <SelectItem 
                          key={dept._id} 
                          value={dept._id}
                          className="my-1 mx-2 px-3 py-2.5 rounded-lg hover:bg-info/20 dark:hover:bg-info/30 cursor-pointer transition-all duration-200 font-medium text-gray-900 dark:text-slate-100"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-info"></div>
                            {dept.name}
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                {Array.isArray(departments) && departments.length === 0 && (
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Loading departments...</p>
                )}
              </div>

              <div className="grid gap-2.5">
                <Label htmlFor="assignee-search" className="text-sm font-bold text-gray-900 dark:text-slate-200 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-success shadow-lg shadow-success/50"></div>
                  Assignee <span className="text-red-400 ml-0.5">*</span>
                </Label>
                <Input
                  id="assignee-search"
                  placeholder="Search assignees..."
                  value={assigneeSearch}
                  onChange={handleAssigneeSearch}
                  disabled={!formData.department}
                  className="h-12 px-4 bg-white/10 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 focus:border-success focus-visible:ring-4 focus-visible:ring-success/30 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed text-base placeholder:text-gray-500 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-100 backdrop-blur-xl"
                />
                {filteredUsers.length > 0 && formData.department && (
                  <div className="mt-1 bg-white/10 dark:bg-slate-900/95 backdrop-blur-xl border border-white/30 dark:border-slate-700 rounded-xl max-h-60 overflow-y-auto shadow-xl scrollbar-thin scrollbar-thumb-white/20 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent" style={{backdropFilter: 'blur(20px)'}}>
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="m-2 px-4 py-3 hover:bg-success/30 dark:hover:bg-success/40 cursor-pointer text-sm flex items-center justify-between rounded-lg transition-all duration-200 group"
                      onClick={() => handleAssigneeSelect(user)}
                    >
                      <span className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-success transition-colors">{user.name}</span>
                      <span className="text-xs bg-success/20 dark:bg-success/10 text-success px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Active
                      </span>
                    </div>
                    ))}
                </div>
              )}
              {formData.department && filteredUsers.length === 0 && assigneeSearch && !formData.assignee && (
                <div className="px-4 py-2 text-sm text-muted-foreground dark:text-slate-400">
                  No active users found in this department
                </div>
              )}

              {/* User's Previous Tasks */}
              {formData.assignee && (
                <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent border border-primary/20 dark:border-primary/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h4 className="font-semibold text-foreground dark:text-slate-200">Previous Tasks for {assigneeSearch}</h4>
                  </div>

                  {loadingUserTasks ? (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground dark:text-slate-400 text-sm">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Loading tasks...
                      </div>
                    </div>
                  ) : selectedUserTasks.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-border/50 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                      {selectedUserTasks.slice(0, 5).map((task) => (
                        <div key={task._id} className="flex items-center justify-between p-2 bg-muted/50 dark:bg-slate-800/50 rounded-lg border border-border/30 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/50 transition-colors duration-200">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground dark:text-slate-200 truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.status === 'Completed' ? 'bg-success/20 text-success' :
                                task.status === 'In Progress' ? 'bg-info/20 text-info' :
                                'bg-warning/20 text-warning'
                              }`}>
                                {task.status}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.priority === 'High' ? 'bg-red-500/20 text-red-500' :
                                task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-green-500/20 text-green-500'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground dark:text-slate-400 ml-2">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                          </div>
                        </div>
                      ))}
                      {selectedUserTasks.length > 5 && (
                        <div className="text-xs text-muted-foreground dark:text-slate-400 text-center py-2">
                          +{selectedUserTasks.length - 5} more tasks
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground dark:text-slate-400 text-sm">
                      No previous tasks found for this user
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="grid gap-2.5">
              <Label htmlFor="priority" className="text-sm font-bold text-gray-900 dark:text-slate-200 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-warning shadow-lg shadow-warning/50"></div>
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger id="priority" className="h-12 px-4 bg-white/10 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 focus:border-warning focus:ring-4 focus:ring-warning/30 rounded-xl transition-all duration-300 text-base font-medium text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 backdrop-blur-xl">
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent className="bg-white/10 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/30 dark:border-slate-700 rounded-2xl shadow-2xl" style={{backdropFilter: 'blur(20px)'}}>
                  <SelectItem value="High" className="my-1 mx-2 px-3 py-2.5 rounded-lg hover:bg-destructive/30 dark:hover:bg-destructive/40 cursor-pointer transition-all duration-200 text-gray-900 dark:text-slate-100">
                    <span className="flex items-center gap-2.5 font-semibold">
                      <span className="h-2.5 w-2.5 rounded-full bg-destructive shadow-lg shadow-destructive/30"></span>
                      <span className="text-destructive">High Priority</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="Medium" className="my-1 mx-2 px-3 py-2.5 rounded-lg hover:bg-warning/30 dark:hover:bg-warning/40 cursor-pointer transition-all duration-200 text-gray-900 dark:text-slate-100">
                    <span className="flex items-center gap-2.5 font-semibold">
                      <span className="h-2.5 w-2.5 rounded-full bg-warning shadow-lg shadow-warning/30"></span>
                      <span className="text-warning">Medium Priority</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="Low" className="my-1 mx-2 px-3 py-2.5 rounded-lg hover:bg-success/30 dark:hover:bg-success/40 cursor-pointer transition-all duration-200 text-gray-900 dark:text-slate-100">
                    <span className="flex items-center gap-2.5 font-semibold">
                      <span className="h-2.5 w-2.5 rounded-full bg-success shadow-lg shadow-success/30"></span>
                      <span className="text-success">Low Priority</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="dueDate" className="text-sm font-bold text-gray-900 dark:text-slate-200 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-info shadow-lg shadow-info/50"></div>
                Due Date
              </Label>
              <div className="relative">
                <Input
                  id="dueDate"
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={dueDate}
                  onChange={handleDateChange}
                  className={cn("h-12 px-4 pr-11 bg-white/10 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 focus:border-info focus-visible:ring-4 focus-visible:ring-info/30 rounded-xl transition-all duration-300 text-base text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 backdrop-blur-xl", dateError && "border-red-400 focus:border-red-400 focus-visible:ring-red-400/30")}
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {dateError && <p className="text-sm text-destructive flex items-center gap-1.5 mt-1 font-medium">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {dateError}
              </p>}
            </div>
          </div>

          {/* Dependencies */}
          <div className="grid gap-2.5">
            <Label htmlFor="dependencies" className="text-sm font-bold text-gray-900 dark:text-slate-200 flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-secondary shadow-lg shadow-secondary/50"></div>
              Dependencies
            </Label>
            <Select
              value={formData.dependencies[0] || ""}
              onValueChange={(value) => handleChange("dependencies", value ? [value] : [])}
            >
              <SelectTrigger id="dependencies" className="h-12 px-4 bg-white/10 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 focus:border-secondary focus:ring-4 focus:ring-secondary/30 rounded-xl transition-all duration-300 text-base font-medium text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 backdrop-blur-xl">
                <SelectValue placeholder={
                  Array.isArray(tasks) && tasks.length > 0 
                    ? "Select dependent tasks..." 
                    : "No dependencies available"
                } />
              </SelectTrigger>
              <SelectContent className="bg-white/10 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/30 dark:border-slate-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto" style={{backdropFilter: 'blur(20px)'}}>
                {Array.isArray(tasks) && tasks.length > 0 && 
                  tasks.map((task) => (
                    <SelectItem 
                      key={task._id} 
                      value={task._id}
                      className="my-1 mx-2 px-3 py-2.5 rounded-lg hover:bg-secondary/30 dark:hover:bg-secondary/40 cursor-pointer transition-all duration-200 font-medium text-gray-900 dark:text-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {task.title}
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            {Array.isArray(tasks) && tasks.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">No tasks available for dependencies</p>
            )}
          </div>

          {/* Document Upload */}
          <div className="grid gap-2.5">
            <Label htmlFor="document" className="text-sm font-bold text-gray-900 dark:text-slate-200 flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-accent shadow-lg shadow-accent/50"></div>
              Document Attachment
            </Label>
            <div className="relative">
              <Input
                id="document"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.html"
                onChange={handleFileChange}
                className="h-12 px-4 bg-white/10 dark:bg-slate-800/50 border-2 border-dashed border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 focus:border-accent focus-visible:ring-4 focus-visible:ring-accent/30 rounded-xl transition-all duration-300 cursor-pointer text-gray-900 dark:text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-accent file:to-accent/80 file:text-accent-foreground hover:file:from-accent/90 hover:file:to-accent/70 file:transition-all file:duration-300 backdrop-blur-xl"
              />
            </div>
            {documentFile && (
              <div className="mt-1 p-3 bg-accent/20 dark:bg-accent/10 border border-accent/40 dark:border-accent/30 rounded-lg backdrop-blur-xl">
                <p className="text-sm text-gray-900 dark:text-slate-100 flex items-center gap-2.5 font-medium">
                  <svg className="h-5 w-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate">{documentFile.name}</span>
                  <span className="text-xs text-accent bg-accent/20 px-2 py-0.5 rounded-full ml-auto">Attached</span>
                </p>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Premium Footer */}
        {/* Premium Footer */}
        <DialogFooter className="px-7 py-4 border-t border-white/20 dark:border-slate-800 bg-gradient-to-t from-white/10 dark:from-slate-800/50 to-transparent backdrop-blur-xl" style={{backdropFilter: 'blur(20px)'}}>
          <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none h-12 px-6 rounded-xl border border-white/30 dark:border-slate-700 hover:border-white/50 dark:hover:border-slate-600 hover:bg-white/10 dark:hover:bg-slate-800 transition-all duration-300 font-semibold text-gray-900 dark:text-slate-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit} 
              disabled={isLoading || dateError}
              className="flex-1 sm:flex-none h-12 px-8 rounded-xl gradient-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none font-bold"
            >
              {isLoading ? (
                <span className="flex items-center gap-2.5">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Creating Task...
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Task
                </span>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}