import React, { useEffect, useState } from "react";
import {
  Button,
  Row,
  Col,
  Container,
  Modal,
  Form,
  Card,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  useCreateTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../slices/usersApiSlice";
import Swal from "sweetalert2";

const HomeScreen = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [taskIdToEdit, setTaskIdToEdit] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [taskDetails, setTaskDetails] = useState({});
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [errors, setErrors] = useState({});

  const {
    data: fetchedTasks,
    isLoading,
    error,
    refetch,
  } = useGetTasksQuery({ search, sort });
  const [tasks, setTasks] = useState([]);
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  const handleAddTask = () => {
    setIsEdit(false);
    setShowModal(true);
    setTaskTitle("");
    setTaskDescription("");
    setAssignedTo("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
  };
  const validateForm = () => {
    const newErrors = {};

    if (!taskTitle.trim()) {
      newErrors.taskTitle = "Task title is required.";
    }

    if (!taskDescription.trim()) {
      newErrors.taskDescription = "Task description is required.";
    }

    if (!assignedTo.trim()) {
      newErrors.assignedTo = "Assignee is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    if (isEdit) {
      try {
        await updateTask({
          id: taskIdToEdit,
          taskData: {
            title: taskTitle,
            description: taskDescription,
            assignedTo,
          },
        }).unwrap();
        setShowModal(false);
        refetch();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else {
      try {
        await createTask({
          title: taskTitle,
          description: taskDescription,
          assignedTo,
        }).unwrap();
        setShowModal(false);
        refetch();
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
  };

  const handleEditTask = (task) => {
    setIsEdit(true);
    setShowModal(true);
    setTaskIdToEdit(task._id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setAssignedTo(task.assignedTo);
  };

  const handleDeleteTask = async (taskId, title) => {
    const result = await Swal.fire({
      title: `Are you sure you want to delete ${title}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(taskId).unwrap();
        Swal.fire("Deleted!", "The task has been deleted.", "success");
        refetch();
      } catch (error) {
        Swal.fire("Error!", "There was a problem deleting the task.", "error");
      }
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId;

    const updatedTasks = tasks.map((task) =>
      task._id === draggableId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    try {
      await updateTask({
        id: draggableId,
        status: newStatus,
      }).unwrap();

      await refetch();

      console.log("Tasks after refetch:", tasks);
    } catch (error) {
      console.error("Error updating task status:", error);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === draggableId ? { ...task, status: previousStatus } : task
        )
      );
    }
  };

  const handleViewDetails = (task) => {
    setTaskDetails(task);
    setShowDetailsModal(true);
  };

  const renderTaskCards = (status) => (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ minHeight: "100px" }}
        >
          {tasks
            ?.filter((task) => task.status === status)
            .map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-3"
                    style={{
                      backgroundColor: "#d2e6fa",
                      ...provided.draggableProps.style,
                    }}
                  >
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <Card.Title className="mb-2">{task.title}</Card.Title>
                          <Card.Text className="mb-4">
                            {task.description}
                          </Card.Text>
                        </div>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-${task._id}`}>
                              Assigned to: {task.assignedTo}
                            </Tooltip>
                          }
                        >
                          <div
                            style={{
                              backgroundColor: "#5596f5",
                              color: "white",
                              borderRadius: "50%",
                              height: "40px",
                              width: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              cursor: "pointer",
                            }}
                          >
                            {task.assignedTo?.charAt(0).toUpperCase()}
                          </div>
                        </OverlayTrigger>
                      </div>
                      <Card.Text>
                        <small>
                          Created at:{" "}
                          {new Date(task.createdAt).toLocaleString()}
                        </small>
                      </Card.Text>
                      <div className="d-flex justify-content-end">
                        <Button
                          size="sm"
                          style={{
                            backgroundColor: "rgba(245,100,100,255)",
                            border: "none",
                          }}
                          className="me-2"
                          onClick={() => handleDeleteTask(task._id, task.title)}
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          style={{ backgroundColor: "#5596f5", border: "none" }}
                          className="me-2"
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleViewDetails(task)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Draggable>
            ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <Container className="mt-5">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Row className="mb-3">
          <Col className="d-flex justify-content-start">
            <Button
              onClick={handleAddTask}
              variant="primary"
              style={{ width: "160px", textAlign: "center" }}
            >
              Add Task
            </Button>
          </Col>
        </Row>
        <Row className="px-2">
          <Col
            className="d-flex justify-content-between align-items-center shadow"
            style={{ padding: "10px", borderRadius: "5px" }}
          >
            <Form className="d-flex align-items-center">
              <span className="me-2">Search:</span>
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
                style={{ height: "30px", padding: "5px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Form>
            <div className="d-flex align-items-center">
              <span className="me-2">Sort By:</span>
              <Form.Select
                aria-label="Sort by"
                style={{
                  width: "110px",
                  height: "30px",
                  padding: "5px",
                  lineHeight: "15px",
                  textAlign: "center",
                }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recent" style={{ textAlign: "center" }}>
                  Recent
                </option>
                <option value="title" style={{ textAlign: "center" }}>
                  Title A-Z
                </option>
              </Form.Select>
            </div>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col className="border p-3 mx-2 shadow">
            <div className="header-bar">TODO</div>
            {renderTaskCards("todo")}
          </Col>
          <Col className="border p-3 mx-2 shadow">
            <div className="header-bar">IN PROGRESS</div>
            {renderTaskCards("inprogress")}
          </Col>
          <Col className="border p-3 mx-2 shadow">
            <div className="header-bar">DONE</div>
            {renderTaskCards("done")}
          </Col>
        </Row>
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{isEdit ? "Edit Task" : "Add Task"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="taskTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  isInvalid={!!errors.taskTitle}
                  required
                />
                 <Form.Control.Feedback type="invalid">
                {errors.taskTitle}
              </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="taskDescription" className="mt-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter task description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  isInvalid={!!errors.taskDescription}
                  required
                />
                 <Form.Control.Feedback type="invalid">
                {errors.taskDescription}
              </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="assignedTo" className="mt-2">
                <Form.Label>Assigned To</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter assignee"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  isInvalid={!!errors.assignedTo}
                />
                 <Form.Control.Feedback type="invalid">
                {errors.assignedTo}
              </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              onClick={handleSubmit}
              style={{ backgroundColor: "#e0e0e0", color: "#000" }}
            >
              Save
            </Button>
            <Button
              variant="light"
              onClick={handleCloseModal}
              style={{ backgroundColor: "#e0e0e0", color: "#000" }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
          <Modal.Header closeButton>
            <Modal.Title>Task Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Title:</strong> {taskDetails.title}
            </p>
            <p>
              <strong>Description:</strong> {taskDetails.description}
            </p>
            <p>
              <strong>Assigned To:</strong> {taskDetails.assignedTo}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(taskDetails.createdAt).toLocaleString()}
            </p>
          </Modal.Body>
        </Modal>
      </DragDropContext>
    </Container>
  );
};

export default HomeScreen;
